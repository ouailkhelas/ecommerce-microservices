# 🎯 Guide de Démonstration - Observabilité Order Service

## Les 3 Techniques Implémentées

| Technique | Outil | Port |
|-----------|-------|------|
| ✅ Structured Logging | Winston (JSON logs) | Docker logs |
| ✅ Prometheus Metrics | prom-client | http://localhost:9091 |
| ✅ Grafana Dashboards | Grafana | http://localhost:3000 |

---

## 🚀 ÉTAPE 1 : Démarrer les services

```bash
cd ~/cose-tp3
sudo docker compose up -d
```

Vérifier que tout tourne :
```bash
sudo docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 📝 ÉTAPE 2 : Tester le Structured Logging (Winston)

### 2.1 Voir les logs en temps réel
```bash
sudo docker compose logs -f order-service
```

### 2.2 Faire une requête pour générer des logs
Dans un autre terminal :
```bash
curl http://localhost:8080/api/orders
```

### 2.3 Observer les logs JSON structurés
Vous verrez des logs comme :
```json
{
  "timestamp": "2026-01-03 00:01:05.601",
  "level": "info",
  "message": "Fetching orders list",
  "service": "order-service",
  "correlationId": "db0c557c-6ad8-bad8-eac6-5acde9204ab9",
  "method": "GET",
  "path": "/orders",
  "statusCode": 200,
  "duration": "3ms"
}
```

**Points clés à montrer :**
- ✅ Format JSON (pas text brut)
- ✅ Timestamp standardisé
- ✅ Correlation ID pour tracer les requêtes
- ✅ Métadonnées (service, environment, method, path, etc.)

---

## 📊 ÉTAPE 3 : Tester Prometheus Metrics

### 3.1 Voir les métriques brutes du service
```bash
curl http://localhost:8080/orders/metrics
```

### 3.2 Ouvrir Prometheus dans le navigateur
URL : **http://localhost:9091**

### 3.3 Tester ces requêtes Prometheus

| Requête | Ce qu'elle montre |
|---------|-------------------|
| `up{job="order-service"}` | État du service (1=UP) |
| `http_requests_total` | Total des requêtes HTTP |
| `rate(http_requests_total[5m])` | Requêtes par seconde |
| `orders_created_total` | Nombre de commandes créées |

### 3.4 Générer du trafic pour voir les métriques
```bash
# Faire 20 requêtes sur orders
for i in {1..20}; do curl -s http://localhost:8080/api/orders; done

# Vérifier le health de l'API Gateway
curl http://localhost:8080/health
```

Puis dans Prometheus, exécuter : `http_requests_total`

**Points clés à montrer :**
- ✅ Métriques au format Prometheus
- ✅ Labels (method, endpoint, status)
- ✅ Compteurs (http_requests_total, orders_created_total)
- ✅ Histogrammes (http_request_duration_seconds)

---

## 📈 ÉTAPE 4 : Tester Grafana Dashboard

### 4.1 Ouvrir Grafana
URL : **http://localhost:3000**

Identifiants :
- Utilisateur : `admin`
- Mot de passe : `admin`

### 4.2 Trouver le Dashboard
1. Menu ☰ → **Dashboards**
2. Cliquer sur **"Order Service Dashboard"**

### 4.3 Ce que montre le Dashboard

| Panel | Description |
|-------|-------------|
| Order Service Status | UP (vert) ou DOWN (rouge) |
| Total Orders Created | Nombre de commandes |
| Total Orders Failed | Erreurs |
| HTTP Requests Rate | Graphique des requêtes/sec |
| Request Duration (p50 & p95) | Latence |
| Circuit Breaker State | État du circuit breaker |

### 4.4 Générer du trafic et observer en temps réel
```bash
while true; do curl -s http://localhost:8080/api/orders; sleep 1; done
```

Regarder les graphiques se mettre à jour en temps réel !

---

## 🔗 ÉTAPE 5 : Démontrer la Corrélation

### Montrer comment tout est lié :

1. **Faire une requête**
```bash
curl http://localhost:8080/orders/health
```

2. **Voir le log avec le correlation ID**
```bash
sudo docker compose logs order-service --tail=5
```

3. **Voir la métrique dans Prometheus**
```
http_requests_total{endpoint="/health"}
```

4. **Voir le graphique dans Grafana**
Le panel "HTTP Requests Rate" montre la requête

---

## 📁 Fichiers Clés à Montrer

| Fichier | Technique |
|---------|-----------|
| `order-service/src/utils/logger.js` | Winston Configuration |
| `order-service/src/metrics.js` | Prometheus Metrics |
| `order-service/index.js` | Intégration (lignes 7-10, 39-46) |
| `monitoring/prometheus/prometheus.yml` | Config Prometheus |
| `monitoring/grafana/dashboards/order-service-dashboard.json` | Dashboard Grafana |

---

## ✅ Résumé pour l'Instructeur

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDER SERVICE                            │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │   Winston   │   │ prom-client │   │   Express   │       │
│  │   Logger    │   │   Metrics   │   │     App     │       │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘       │
│         │                 │                 │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Docker Logs  │  │  Prometheus  │  │   Grafana    │
   │   (JSON)     │  │   :9091      │  │    :3000     │
   └──────────────┘  └──────────────┘  └──────────────┘
```

**Les 3 piliers de l'observabilité sont implémentés :**
1. **Logs** → Winston (structured JSON logging)
2. **Metrics** → Prometheus (time-series metrics)
3. **Visualization** → Grafana (dashboards)
