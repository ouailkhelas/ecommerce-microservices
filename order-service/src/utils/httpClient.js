const axios = require('axios');
const axiosRetry = require('axios-retry');
const config = require('../config/resilience.config');

/**
 * Crée un client HTTP avec Retry et Timeout configurés
 * @param {string} serviceName - Nom du service (pour le timeout)
 * @returns {AxiosInstance}
 */
function createHttpClient(serviceName) {
  const timeout = config.timeouts[serviceName] || 5000;

  // Créer instance Axios
  const client = axios.create({
    timeout: timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Configurer Retry
  axiosRetry(client, {
    retries: config.retry.maxRetries,
    
    // Exponential backoff: 1s, 2s, 4s
    retryDelay: (retryCount) => {
      const delay = Math.pow(2, retryCount - 1) * 1000;
      // Ajouter jitter (±30%) pour éviter thundering herd
      const jitter = delay * 0.3 * (Math.random() - 0.5);
      const finalDelay = delay + jitter;
      
      console.log(`[Retry] Attempt ${retryCount}/${config.retry.maxRetries} - Waiting ${Math.round(finalDelay)}ms`);
      return finalDelay;
    },

    // Condition de retry
    retryCondition: (error) => {
      // Retry sur erreurs réseau
      if (axiosRetry.isNetworkOrIdempotentRequestError(error)) {
        console.log(`[Retry] Network error detected, retrying...`);
        return true;
      }

      // Retry sur erreurs 5xx
      if (error.response && error.response.status >= 500) {
        console.log(`[Retry] Server error ${error.response.status}, retrying...`);
        return true;
      }

      // Ne pas retry sur erreurs 4xx (erreurs client)
      console.log(`[Retry] Client error or success, not retrying`);
      return false;
    },

    // Callback avant retry
    onRetry: (retryCount, error, requestConfig) => {
      console.log(`[Retry] ${serviceName} - Retry ${retryCount} for ${requestConfig.url}`);
    }
  });

  // Intercepteur pour logger les requêtes
  client.interceptors.request.use(
    (config) => {
      console.log(`[HTTP] ${config.method.toUpperCase()} ${config.url} (timeout: ${timeout}ms)`);
      return config;
    },
    (error) => {
      console.error(`[HTTP] Request error:`, error.message);
      return Promise.reject(error);
    }
  );

  // Intercepteur pour logger les réponses
  client.interceptors.response.use(
    (response) => {
      console.log(`[HTTP] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
      return response;
    },
    (error) => {
      if (error.code === 'ECONNABORTED') {
        console.error(`[HTTP] Timeout after ${timeout}ms for ${error.config?.url}`);
      } else if (error.response) {
        console.error(`[HTTP] Error ${error.response.status} from ${error.config?.url}`);
      } else {
        console.error(`[HTTP] Network error for ${error.config?.url}:`, error.message);
      }
      return Promise.reject(error);
    }
  );

  return client;
}

module.exports = { createHttpClient };