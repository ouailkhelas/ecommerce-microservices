const {
  recordHttpRequest,
  incrementRequestsInProgress,
  decrementRequestsInProgress
} = require('../metrics');

/**
 * Middleware pour enregistrer les métriques Prometheus
 * - Enregistre chaque requête HTTP
 * - Mesure la durée de traitement
 * - Met à jour les compteurs
 */
function metricsMiddleware(req, res, next) {
  // Normaliser l'endpoint (retirer les IDs pour grouper)
  const endpoint = req.route ? req.route.path : req.path;
  const method = req.method;

  // Incrémenter les requêtes en cours
  incrementRequestsInProgress(method, endpoint);

  // Capturer le temps de début
  const startTime = Date.now();

  // Hook sur la fin de la réponse
  res.on('finish', () => {
    // Calculer la durée en secondes
    const duration = (Date.now() - startTime) / 1000;
    const status = res.statusCode;

    // Enregistrer la métrique
    recordHttpRequest(method, endpoint, status, duration);

    // Décrémenter les requêtes en cours
    decrementRequestsInProgress(method, endpoint);
  });

  next();
}

module.exports = metricsMiddleware;