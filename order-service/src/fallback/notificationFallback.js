/**
 * Fallback strategies pour le Notification Service
 */

// Simuler une queue pour les notifications en attente
const pendingNotificationsQueue = [];

/**
 * Fallback quand Notification Service est indisponible
 * Met la notification en file d'attente pour envoi ultérieur
 * @param {Object} notificationData - Données de la notification
 * @returns {Object} Réponse fallback
 */
function notificationFallback(notificationData) {
  console.log('[Fallback] Notification Service unavailable - Queueing notification for later');
  
  // Ajouter à la queue
  const queuedNotification = {
    id: `notif_${Date.now()}`,
    ...notificationData,
    status: 'QUEUED',
    queuedAt: new Date().toISOString(),
    retryCount: 0
  };

  pendingNotificationsQueue.push(queuedNotification);
  
  console.log(`[Fallback] Notification queued: ${queuedNotification.id}`);
  console.log(`[Fallback] Queue length: ${pendingNotificationsQueue.length}`);

  // Retourner succès (ne pas bloquer la commande)
  return {
    success: true,
    notification: {
      id: queuedNotification.id,
      status: 'QUEUED',
      message: 'Notification queued for later delivery',
      queuedAt: queuedNotification.queuedAt
    },
    fallbackActivated: true
  };
}

/**
 * Récupérer les notifications en attente
 * @returns {Array} Liste des notifications en attente
 */
function getPendingNotifications() {
  return pendingNotificationsQueue;
}

/**
 * Marquer une notification comme envoyée
 * @param {string} notificationId - ID de la notification
 */
function markNotificationSent(notificationId) {
  const index = pendingNotificationsQueue.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    pendingNotificationsQueue.splice(index, 1);
    console.log(`[Fallback] Notification ${notificationId} sent and removed from queue`);
  }
}

/**
 * Worker pour retraiter les notifications en attente
 */
async function processNotificationQueue(notificationClient) {
  if (pendingNotificationsQueue.length === 0) {
    return;
  }

  console.log(`[Fallback] Processing ${pendingNotificationsQueue.length} queued notifications`);

  const notificationsToProcess = [...pendingNotificationsQueue];

  for (const notification of notificationsToProcess) {
    try {
      console.log(`[Fallback] Retrying notification ${notification.id} (attempt ${notification.retryCount + 1})`);
      
      // Essayer d'envoyer la notification
      const result = await notificationClient.sendNotification(notification);
      
      if (result.success) {
        markNotificationSent(notification.id);
        console.log(`[Fallback] Notification ${notification.id} successfully sent`);
      }
    } catch (error) {
      notification.retryCount++;
      console.error(`[Fallback] Failed to send notification ${notification.id}:`, error.message);
      
      // Abandonner après 3 tentatives
      if (notification.retryCount >= 3) {
        console.error(`[Fallback] Notification ${notification.id} abandoned after 3 attempts`);
        markNotificationSent(notification.id);
      }
    }
  }
}

module.exports = {
  notificationFallback,
  getPendingNotifications,
  markNotificationSent,
  processNotificationQueue
};