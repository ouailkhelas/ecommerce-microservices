// Configuration pour les patterns de résilience

module.exports = {
  // Configuration du Circuit Breaker
  circuitBreaker: {
    payment: {
      timeout: 5000,                    // 5 secondes timeout
      errorThresholdPercentage: 50,     // Ouvrir après 50% d'échecs
      resetTimeout: 30000,              // 30 secondes avant de réessayer (HALF-OPEN)
      rollingCountTimeout: 10000,       // Fenêtre de mesure de 10 secondes
      rollingCountBuckets: 10,          // 10 buckets pour les statistiques
      name: 'PaymentCircuit',
      volumeThreshold: 10,              // Minimum 10 requêtes avant d'évaluer
    }
  },

  // Configuration du Retry
  retry: {
    maxRetries: 3,                      // Maximum 3 tentatives
    retryDelay: 'exponential',          // 1s, 2s, 4s
    shouldRetry: (error) => {
      // Retry seulement sur erreurs réseau et 5xx
      if (!error.response) return true; // Erreur réseau
      const status = error.response.status;
      return status >= 500 && status < 600; // 5xx errors
    }
  },

  // Configuration des Timeouts (en millisecondes)
  timeouts: {
    customerService: 3000,              // 3 secondes
    inventoryService: 3000,             // 3 secondes
    paymentService: 5000,               // 5 secondes
    shippingService: 5000,              // 5 secondes
    notificationService: 10000          // 10 secondes
  },

  // URLs des services
  services: {
    customerService: process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:3003',
    inventoryService: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3002',
    paymentService: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
    shippingService: process.env.SHIPPING_SERVICE_URL || 'http://shipping-service:3005',
    notificationService: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006'
  }
};