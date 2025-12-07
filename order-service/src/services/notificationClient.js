const { createHttpClient } = require('../utils/httpClient');
const config = require('../config/resilience.config');
const { notificationFallback } = require('../fallback/notificationFallback');

// Créer le client HTTP avec retry et timeout
const httpClient = createHttpClient('notificationService');
const BASE_URL = config.services.notificationService;

/**
 * Envoyer une notification
 * @param {Object} notificationData - Données de la notification
 * @returns {Promise<Object>}
 */
async function sendNotification(notificationData) {
  try {
    console.log(`[Notification Client] Sending notification to ${BASE_URL}/notifications`);
    
    const response = await httpClient.post(`${BASE_URL}/notifications`, notificationData);
    
    console.log('[Notification Client] ✅ Notification sent successfully');
    return response.data;
    
  } catch (error) {
    console.error('[Notification Client] ❌ Failed to send notification:', error.message);
    
    // Activer fallback : mettre en queue
    console.log('[Notification Client] Activating fallback - Queueing notification');
    return notificationFallback(notificationData);
  }
}

/**
 * Envoyer une notification de création de commande
 * @param {Object} order - Données de la commande
 * @param {Object} customer - Données du client
 * @returns {Promise<Object>}
 */
async function sendOrderCreatedNotification(order, customer) {
  const notificationData = {
    userId: customer.id,
    type: 'email',
    subject: 'Order Confirmation',
    message: `Your order #${order.id} has been created successfully. Total: ${order.totalAmount}`,
    metadata: {
      orderId: order.id,
      orderStatus: order.status
    }
  };

  return await sendNotification(notificationData);
}

/**
 * Envoyer une notification de mise à jour de commande
 * @param {Object} order - Données de la commande
 * @param {Object} customer - Données du client
 * @returns {Promise<Object>}
 */
async function sendOrderUpdatedNotification(order, customer) {
  const notificationData = {
    userId: customer.id,
    type: 'email',
    subject: 'Order Status Update',
    message: `Your order #${order.id} status has been updated to: ${order.status}`,
    metadata: {
      orderId: order.id,
      orderStatus: order.status
    }
  };

  return await sendNotification(notificationData);
}

module.exports = {
  sendNotification,
  sendOrderCreatedNotification,
  sendOrderUpdatedNotification
};