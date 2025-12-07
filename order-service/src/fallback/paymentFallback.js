/**
 * Fallback strategies pour le Payment Service
 */

// Simuler une queue pour les paiements en attente
const pendingPaymentsQueue = [];

/**
 * Fallback quand Payment Service est indisponible
 * Met le paiement en file d'attente pour traitement ultérieur
 * @param {Object} paymentData - Données du paiement
 * @returns {Object} Réponse fallback
 */
function paymentFallback(paymentData) {
  console.log('[Fallback] Payment Service unavailable - Queueing payment for later processing');
  
  // Ajouter à la queue
  const queuedPayment = {
    id: `pending_${Date.now()}`,
    ...paymentData,
    status: 'QUEUED',
    queuedAt: new Date().toISOString(),
    retryCount: 0
  };

  pendingPaymentsQueue.push(queuedPayment);
  
  console.log(`[Fallback] Payment queued: ${queuedPayment.id}`);
  console.log(`[Fallback] Queue length: ${pendingPaymentsQueue.length}`);

  // Retourner une réponse indiquant que le paiement est en attente
  return {
    success: true,
    payment: {
      id: queuedPayment.id,
      status: 'PENDING_PAYMENT',
      message: 'Payment service temporarily unavailable. Payment queued for processing.',
      queuedAt: queuedPayment.queuedAt
    },
    fallbackActivated: true
  };
}

/**
 * Récupérer les paiements en attente
 * @returns {Array} Liste des paiements en attente
 */
function getPendingPayments() {
  return pendingPaymentsQueue;
}

/**
 * Marquer un paiement comme traité et le retirer de la queue
 * @param {string} paymentId - ID du paiement
 */
function markPaymentProcessed(paymentId) {
  const index = pendingPaymentsQueue.findIndex(p => p.id === paymentId);
  if (index !== -1) {
    pendingPaymentsQueue.splice(index, 1);
    console.log(`[Fallback] Payment ${paymentId} processed and removed from queue`);
  }
}

/**
 * Worker pour retraiter les paiements en attente
 * Appelé périodiquement pour réessayer les paiements en queue
 */
async function processPaymentQueue(paymentClient) {
  if (pendingPaymentsQueue.length === 0) {
    return;
  }

  console.log(`[Fallback] Processing ${pendingPaymentsQueue.length} queued payments`);

  const paymentsToProcess = [...pendingPaymentsQueue];

  for (const payment of paymentsToProcess) {
    try {
      console.log(`[Fallback] Retrying payment ${payment.id} (attempt ${payment.retryCount + 1})`);
      
      // Essayer de traiter le paiement
      const result = await paymentClient.processPayment(payment);
      
      if (result.success) {
        markPaymentProcessed(payment.id);
        console.log(`[Fallback] Payment ${payment.id} successfully processed`);
      }
    } catch (error) {
      payment.retryCount++;
      console.error(`[Fallback] Failed to process payment ${payment.id}:`, error.message);
      
      // Abandonner après 5 tentatives
      if (payment.retryCount >= 5) {
        console.error(`[Fallback] Payment ${payment.id} abandoned after 5 attempts`);
        markPaymentProcessed(payment.id);
      }
    }
  }
}

module.exports = {
  paymentFallback,
  getPendingPayments,
  markPaymentProcessed,
  processPaymentQueue
};