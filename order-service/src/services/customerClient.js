const { createHttpClient } = require('../utils/httpClient');
const config = require('../config/resilience.config');
const NodeCache = require('node-cache');

// Créer le client HTTP avec retry et timeout
const httpClient = createHttpClient('customerService');
const BASE_URL = config.services.customerService;

// Cache pour les données clients (TTL: 5 minutes)
const customerCache = new NodeCache({ stdTTL: 300 });

/**
 * Récupérer un client par ID
 * @param {number} customerId - ID du client
 * @returns {Promise<Object>}
 */
async function getCustomer(customerId) {
  try {
    // Vérifier le cache d'abord
    const cachedCustomer = customerCache.get(`customer_${customerId}`);
    if (cachedCustomer) {
      console.log(`[Customer Client] ✅ Customer ${customerId} found in cache`);
      return cachedCustomer;
    }

    console.log(`[Customer Client] Fetching customer ${customerId} from ${BASE_URL}`);
    
    const response = await httpClient.get(`${BASE_URL}/customers/${customerId}`);
    const customer = response.data;

    // Mettre en cache
    customerCache.set(`customer_${customerId}`, customer);
    console.log(`[Customer Client] ✅ Customer ${customerId} fetched and cached`);

    return customer;
    
  } catch (error) {
    console.error(`[Customer Client] ❌ Failed to fetch customer ${customerId}:`, error.message);
    
    // Fallback: Vérifier le cache même expiré
    const cachedCustomer = customerCache.get(`customer_${customerId}`);
    if (cachedCustomer) {
      console.log(`[Customer Client] 🆘 Using cached customer data (fallback)`);
      return cachedCustomer;
    }

    throw error;
  }
}

/**
 * Vérifier si un client existe
 * @param {number} customerId - ID du client
 * @returns {Promise<boolean>}
 */
async function customerExists(customerId) {
  try {
    await getCustomer(customerId);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getCustomer,
  customerExists
};