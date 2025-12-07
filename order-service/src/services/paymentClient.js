const CircuitBreaker = require('opossum');
const { createHttpClient } = require('../utils/httpClient');
const config = require('../config/resilience.config');
const { paymentFallback } = require('../fallback/paymentFallback');

// Créer le client HTTP avec retry et timeout
const httpClient = createHttpClient('paymentService');
const BASE_URL = config.services.paymentService;

/**
 * Fonction pour appeler le Payment Service
 * @param {Object} paymentData - Données du paiement
 * @returns {Promise<Object>} Réponse du service
 */
async function callPaymentService(paymentData) {
  console.log(`[Payment Client] Calling Payment Service: ${BASE_URL}/payments`);
  
  const response = await httpClient.post(`${BASE_URL}/payments`, paymentData);
  return response.data;
}

// Créer le Circuit Breaker
const paymentCircuit = new CircuitBreaker(callPaymentService, {
  ...config.circuitBreaker.payment,
  
  // Fallback en cas d'échec
  fallback: (paymentData) => {
    console.log('[Circuit Breaker] Circuit OPEN - Activating fallback');
    return paymentFallback(paymentData);
  },

  // Callback pour les erreurs
  errorFilter: (error) => {
    // Toutes les erreurs ouvrent le circuit
    return true;
  }
});

// Event listeners pour le circuit breaker
paymentCircuit.on('open', () => {
  console.log('🔴 [Circuit Breaker] Payment circuit: OPEN (too many failures)');
});

paymentCircuit.on('halfOpen', () => {
  console.log('🟡 [Circuit Breaker] Payment circuit: HALF-OPEN (testing recovery)');
});

paymentCircuit.on('close', () => {
  console.log('🟢 [Circuit Breaker] Payment circuit: CLOSED (service healthy)');
});

paymentCircuit.on('success', (result) => {
  console.log('[Circuit Breaker] ✅ Payment request successful');
});

paymentCircuit.on('failure', (error) => {
  console.log(`[Circuit Breaker] ❌ Payment request failed: ${error.message}`);
});

paymentCircuit.on('timeout', () => {
  console.log('[Circuit Breaker] ⏱️  Payment request timed out');
});

paymentCircuit.on('reject', () => {
  console.log('[Circuit Breaker] 🚫 Payment request rejected (circuit OPEN)');
});

paymentCircuit.on('fallback', (result) => {
  console.log('[Circuit Breaker] 🆘 Fallback activated for payment');
});

/**
 * Traiter un paiement avec Circuit Breaker
 * @param {Object} paymentData - Données du paiement
 * @returns {Promise<Object>}
 */
async function processPayment(paymentData) {
  try {
    console.log('[Payment Client] Processing payment through circuit breaker...');
    const result = await paymentCircuit.fire(paymentData);
    return result;
  } catch (error) {
    // Si le circuit breaker a un fallback, l'erreur ne remonte pas ici
    // Mais on peut gérer d'autres cas
    console.error('[Payment Client] Payment processing failed:', error.message);
    throw error;
  }
}

/**
 * Vérifier le statut du paiement
 * @param {string} paymentId - ID du paiement
 * @returns {Promise<Object>}
 */
async function getPaymentStatus(paymentId) {
  try {
    const response = await httpClient.get(`${BASE_URL}/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error(`[Payment Client] Failed to get payment status:`, error.message);
    throw error;
  }
}

/**
 * Obtenir les statistiques du circuit breaker
 * @returns {Object} Stats du circuit
 */
function getCircuitStats() {
  return {
    name: paymentCircuit.name,
    state: paymentCircuit.opened ? 'OPEN' : paymentCircuit.halfOpen ? 'HALF-OPEN' : 'CLOSED',
    stats: paymentCircuit.stats
  };
}

module.exports = {
  processPayment,
  getPaymentStatus,
  getCircuitStats,
  paymentCircuit
};