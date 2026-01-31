# Phase 2: Service Communication & Infrastructure

## 🎯 Objective

Implement inter-service communication patterns using both synchronous (REST) and asynchronous (RabbitMQ) approaches, completing the remaining three microservices (Payment, Shipping, Notification).

## 📋 Deliverables

- ✅ Three additional microservices (Payment, Shipping, Notification)
- ✅ Synchronous REST API communication between services
- ✅ Asynchronous event-driven communication via RabbitMQ
- ✅ Service orchestration for order workflow
- ✅ Event publishers and consumers

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Service Communication                        │
│                                                                  │
│  ┌──────────┐  REST   ┌──────────┐  REST   ┌──────────┐        │
│  │  Order   │────────>│ Customer │────────>│ Inventory│        │
│  │ Service  │<────────│ Service  │<────────│ Service  │        │
│  └────┬─────┘         └──────────┘         └──────────┘        │
│       │                                                          │
│       │ REST                                                     │
│       ▼                                                          │
│  ┌──────────┐         ┌──────────────────────────────┐         │
│  │ Payment  │         │         RabbitMQ             │         │
│  │ Service  │         │     Message Broker           │         │
│  └────┬─────┘         │  ┌────────────────────────┐  │         │
│       │               │  │  Exchange: orders      │  │         │
│       │ Publishes     │  │  Queues:               │  │         │
│       └──────────────>│  │  - payment.processed   │  │         │
│                       │  │  - shipping.requested  │  │         │
│                       │  │  - notification.send   │  │         │
│                       │  └────────────────────────┘  │         │
│                       └─────────┬────────────────────┘         │
│                                 │ Consumes                      │
│                    ┌────────────┼────────────────┐             │
│                    │            │                │             │
│               ┌────▼───┐   ┌───▼──────┐   ┌────▼──────────┐   │
│               │Shipping│   │Notification │ │ Other         │   │
│               │Service │   │  Service   │  │ Consumers     │   │
│               └────────┘   └────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

- **Synchronous**: Axios (HTTP client)
- **Asynchronous**: RabbitMQ (AMQP)
- **Message Library**: amqplib (Node.js RabbitMQ client)
- **Service Discovery**: Environment variables (later: Consul/Eureka)


```

## 🚀 Implementation Steps

### Step 1: Add RabbitMQ to Docker Compose


### Step 2: Install RabbitMQ Client


### Step 3: Create RabbitMQ Publisher


### Step 4: Create RabbitMQ Consumer


### Step 5: Implement Synchronous Communication


### Step 6: Implement Order Workflow Orchestration


## 📊 Event Types

| Event | Publisher | Consumers | Routing Key |
|-------|-----------|-----------|-------------|
| Order Created | Order Service | Notification | `order.created` |
| Payment Completed | Payment Service | Shipping, Notification | `payment.completed` |
| Payment Failed | Payment Service | Order, Notification | `payment.failed` |
| Shipping Started | Shipping Service | Order, Notification | `shipping.started` |
| Order Delivered | Shipping Service | Order, Notification | `order.delivered` |


### Test Asynchronous Communication
```bash
# Check RabbitMQ Management UI
open http://localhost:15672
# Login: guest/guest

# Monitor queues and messages
# View shipping.queue, notification.queue
```

### Monitor Service Logs
```bash
# Watch all service logs
docker-compose logs -f

# Watch specific service
docker-compose logs -f payment-service
docker-compose logs -f rabbitmq
```

## ✅ Validation Checklist

- [ ] RabbitMQ container running and accessible
- [ ] All 6 microservices operational
- [ ] Synchronous calls work (Customer, Inventory validation)
- [ ] Payment processing completes successfully
- [ ] Events published to RabbitMQ correctly
- [ ] Shipping service consumes payment events
- [ ] Notification service sends emails/logs
- [ ] Error handling works (failed payments, timeouts)
- [ ] Service logs show communication flow

## 🔍 Key Concepts Learned

1. **Synchronous vs Asynchronous**: Understanding when to use each pattern
2. **Service Orchestration**: Coordinating multiple services for complex workflows
3. **Message Broker**: Decoupling services with RabbitMQ
4. **Event-Driven Architecture**: Publish-subscribe pattern
5. **Error Handling**: Dealing with network failures and timeouts
6. **Service Discovery**: Finding and calling other services

