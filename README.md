# 🛒 E-Commerce Order Management System

Complete implementation of a distributed microservices-based e-commerce platform demonstrating modern cloud-native architecture patterns, resilience engineering, and observability practices. Academic project completed as part of the **Containerization and Orchestration of Software Environments**.

## 🎯 Project Objective

Build a production-ready e-commerce order management system using microservices architecture, handling the complete order lifecycle from placement to delivery with robust communication patterns, security, fault tolerance, and comprehensive monitoring.

## 🏗️ Architecture

### System Architecture
```
                                    ┌─────────────────┐
                                    │   API Gateway   │
                                    │    (NGINX)      │
                                    │   Port: 8080    │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
            ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
            │ Order Service │       │Customer Service│      │Inventory Service│
            │  (Port 3001)  │       │  (Port 3002)  │       │  (Port 3003)  │
            └───────┬───────┘       └───────────────┘       └───────┬───────┘
                    │                                                │
                    └────────────────────┬───────────────────────────┘
                                         │
                                ┌────────▼────────┐
                                │    RabbitMQ     │
                                │  Message Broker │
                                │  Port: 5672     │
                                └────────┬────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            ┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
            │Payment Service│   │Shipping Service│   │ Notification  │
            │  (Port 3004)  │   │  (Port 3005)  │   │    Service    │
            └───────────────┘   └───────────────┘   │  (Port 3006)  │
                                                     └───────────────┘

                         Monitoring & Observability Layer
            ┌──────────────┬──────────────┬──────────────────────┐
            │  Prometheus  │   Grafana    │      ELK Stack       │
            │  (Port 9090) │ (Port 3000)  │ (Kibana: 5601)       │
            └──────────────┴──────────────┴──────────────────────┘
```

### Microservices

| Service | Purpose | Database | Port |
|---------|---------|----------|------|
| **Order Service** | Order creation and tracking | PostgreSQL | 3001 |
| **Customer Service** | Customer information management | PostgreSQL | 3002 |
| **Inventory Service** | Product stock management | PostgreSQL | 3003 |
| **Payment Service** | Payment processing | PostgreSQL | 3004 |
| **Shipping Service** | Delivery logistics | PostgreSQL | 3005 |
| **Notification Service** | Email/SMS notifications | PostgreSQL | 3006 |

### Supporting Infrastructure

- **API Gateway**: NGINX (Port 8080)
- **Message Broker**: RabbitMQ (Port 5672, Management: 15672)
- **Monitoring**: Prometheus (Port 9090) + Grafana (Port 3000)
  
## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **Node.js (Express)** | Backend microservices framework |
| **PostgreSQL** | Relational database |
| **RabbitMQ** | Message broker (AMQP) |
| **NGINX** | API Gateway and reverse proxy |
| **Docker & Docker Compose** | Containerization and orchestration |
| **Prometheus & Grafana** | Metrics collection and visualization |
| **JWT** | Authentication and authorization |
| **Opossum** | Circuit breaker pattern |

## 📦 Project Structure

```
## 🚀 Implementation Phases

### Phase 1: Microservices Foundation
**Focus**: Independent microservices with Docker containerization

**Deliverables**:
- ✅ Order, Customer, and Inventory services
- ✅ PostgreSQL database per service
- ✅ Docker containers for each service
- ✅ RESTful CRUD operations

📖 [Detailed Documentation](./docs/phase-1-microservices.md)

---

### Phase 2: Service Communication & Infrastructure
**Focus**: Inter-service communication patterns

**Deliverables**:
- ✅ All 6 microservices operational
- ✅ Synchronous REST communication
- ✅ Asynchronous event-driven architecture (RabbitMQ)
- ✅ Service orchestration workflows

📖 [Detailed Documentation](./docs/phase-2-communication.md)

---

### Phase 3: API Gateway
**Focus**: Single entry point with NGINX

**Deliverables**:
- ✅ NGINX reverse proxy configuration
- ✅ Request routing and load balancing
- ✅ CORS and rate limiting
- ✅ Centralized access logging

📖 [Detailed Documentation](./docs/phase-3-api-gateway.md)

---

### Phase 4: Authentication & Authorization
**Focus**: Security implementation with JWT and RBAC

**Deliverables**:
- ✅ JWT token generation and validation
- ✅ Refresh token mechanism
- ✅ Password hashing (bcrypt)
- ✅ Role-Based Access Control (Admin, Customer, Staff)

📖 [Detailed Documentation](./docs/phase-4-auth.md)

---

### Phase 5: Resilience & Fault Tolerance
**Focus**: Failure handling and graceful degradation

**Deliverables**:
- ✅ Circuit breaker pattern (50% threshold, 30s reset)
- ✅ Retry with exponential backoff (max 3 attempts)
- ✅ Timeout configuration (3-10s per operation)
- ✅ Fallback strategies for critical services
- ✅ Rate limiting protection

**Libraries**: opossum, axios-retry, express-rate-limit, node-cache

📖 [Detailed Documentation](./docs/phase-5-resilience.md)

---

### Phase 6: Observability
**Focus**: Comprehensive monitoring, logging, and tracing

**Deliverables**:
- ✅ Structured JSON logging with correlation IDs
- ✅ Prometheus metrics endpoints (/metrics)
- ✅ Grafana dashboards (System, Services, Resilience, Business)
- ✅ Prometheus alert rules

**Libraries**: Winston/Pino, prom-client, jaeger-client

📖 [Detailed Documentation](./docs/phase-6-observability.md)

## ✅ Project Outcomes

- ✔️ Complete microservices architecture with 6 independent services
- ✔️ Dual communication patterns (REST + Event-driven)
- ✔️ Secure API Gateway with JWT authentication
- ✔️ Production-ready resilience patterns implemented
- ✔️ Full observability stack with metrics, logs, and traces
- ✔️ Infrastructure as Code with Docker Compose
- ✔️ Comprehensive documentation for each phase


## 🔧 Quick Start

### Installation & Running

```bash
# Clone repository
git clone https://github.com/yourusername/ecommerce-order-management.git
cd ecommerce-order-management

# Start all services
docker-compose up -d

# Verify services
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| API Gateway | http://localhost:8080 | - |
| Grafana | http://localhost:3000 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| RabbitMQ Management | http://localhost:15672 | guest/guest |



## 📚 Documentation

Detailed documentation for each phase is available in the `/docs` directory:

- [Phase 1: Microservices Foundation](./docs/phase-1-microservices.md)
- [Phase 2: Service Communication](./docs/phase-2-communication.md)
- [Phase 3: API Gateway](./docs/phase-3-api-gateway.md)
- [Phase 4: Authentication & Authorization](./docs/phase-4-auth.md)
- [Phase 5: Resilience & Fault Tolerance](./docs/phase-5-resilience.md)
- [Phase 6: Observability](./docs/phase-6-observability.md)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🌟 Future Enhancements

- [ ] Implement GraphQL API
- [ ] Add Kubernetes deployment with Helm charts
- [ ] Implement automated backup and disaster recovery


## 👨‍💻 Author

**Ouail Mokhtar Khelas**  
Master's Degree - Networks and Distributed Systems (RSD)  
Constantine 2 University - Abdelhamid Mehri  
Module: COSE| Instructor: Pr. Mohamed Gharzouli

---

**Built with ❤️ for learning microservices architecture and cloud-native development**

