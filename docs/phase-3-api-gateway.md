# Phase 3: API Gateway (NGINX)

## 🎯 Objective

Implement a single entry point for all microservices using NGINX as an API Gateway, providing request routing, load balancing, rate limiting, and centralized logging.

## 📋 Deliverables

- ✅ NGINX reverse proxy configuration
- ✅ Request routing to all 6 microservices
- ✅ CORS handling for cross-origin requests
- ✅ Rate limiting to prevent abuse
- ✅ Centralized access logging
- ✅ Health check aggregation
- ✅ SSL/TLS termination (optional)

## 🏗️ Architecture

### Before API Gateway
```
Client App → http://order-service:3001/orders
Client App → http://customer-service:3002/customers
Client App → http://inventory-service:3003/products
Client App → http://payment-service:3004/payments
Client App → http://shipping-service:3005/shipments
Client App → http://notification-service:3006/notifications

❌ Multiple endpoints to manage
❌ CORS configuration in each service
❌ No centralized rate limiting
❌ Difficult to monitor
```

### After API Gateway
```
                    ┌─────────────────────────────┐
                    │     Client Application      │
                    └──────────────┬──────────────┘
                                   │
                         Single Entry Point
                                   │
                    ┌──────────────▼──────────────┐
                    │      NGINX API Gateway      │
                    │      http://localhost:8080  │
                    │                             │
                    │  Features:                  │
                    │  - Request Routing          │
                    │  - Rate Limiting            │
                    │  - CORS                     │
                    │  - Load Balancing           │
                    │  - Access Logging           │
                    │  - Health Checks            │
                    └──────────────┬──────────────┘
                                   │
        ┌──────────────┬───────────┼───────────┬───────────┬───────────┐
        │              │           │           │           │           │
   ┌────▼────┐   ┌────▼────┐ ┌───▼────┐ ┌────▼────┐ ┌───▼────┐ ┌────▼────┐
   │ Order   │   │Customer │ │Inventory│ │Payment  │ │Shipping│ │Notifica-│
   │ Service │   │Service  │ │Service  │ │Service  │ │Service │ │tion Svc │
   │  :3001  │   │  :3002  │ │  :3003  │ │  :3004  │ │  :3005 │ │  :3006  │
   └─────────┘   └─────────┘ └─────────┘ └─────────┘ └────────┘ └─────────┘

✅ Single endpoint
✅ Centralized configuration
✅ Unified rate limiting
✅ Easy monitoring
```

## 🛠️ Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **NGINX** | API Gateway & Reverse Proxy | 1.24+ |
| **Docker** | Containerization | 20.10+ |
| **Lua** | Advanced routing (optional) | - |


## 🚀 Implementation Steps

### Step 1: Create NGINX Configuration


### Step 2: Create Dockerfile


### Step 3: Create Error Pages


### Step 4: Update Docker Compose


### Step 5: Advanced Features



## 📊 Routing Table

| Client Request | Backend Service | Rate Limit |
|----------------|-----------------|------------|
| `GET /api/orders` | order-service:3001 | 10 req/min |
| `POST /api/orders` | order-service:3001 | 10 req/min |
| `GET /api/customers` | customer-service:3002 | 100 req/min |
| `GET /api/products` | inventory-service:3003 | 100 req/min |
| `POST /api/payments` | payment-service:3004 | 5 req/min |
| `GET /api/shipments` | shipping-service:3005 | 100 req/min |
| `POST /api/notifications` | notification-service:3006 | 100 req/min |
| `GET /health` | Gateway health check | No limit |


## 🧪 Testing

### Test 1: Request Routing

```bash
# Test Order Service routing
curl http://localhost:8080/api/orders

# Test Customer Service routing
curl http://localhost:8080/api/customers

# Test Inventory Service routing
curl http://localhost:8080/api/products
```



## ✅ Validation Checklist

- [ ] NGINX container running on port 8080
- [ ] All 6 services accessible through gateway
- [ ] CORS headers present in responses
- [ ] Health check endpoint responds
- [ ] Access logs being written
- [ ] Timeout configuration working
- [ ] Error pages displayed correctly
- [ ] Security headers added to responses

## 🔍 Key Concepts Learned

1. **Reverse Proxy**: NGINX forwards client requests to backend services
2. **Single Entry Point**: All client requests go through one gateway
3. **Rate Limiting**: Protect backend services from overload
7. **Health Checks**: Monitor gateway and backend service availability

