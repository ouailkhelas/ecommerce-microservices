# Phase 1: Microservices Foundation

## 🎯 Objective

Build independent microservices with Docker containerization, implementing basic CRUD operations for Order, Customer, and Inventory management.

## 📋 Deliverables

- ✅ Three core microservices (Order, Customer, Inventory)
- ✅ PostgreSQL database per service (database per service pattern)
- ✅ Docker containerization for each service
- ✅ RESTful API endpoints with CRUD operations
- ✅ Service independence and bounded contexts

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Order Service   │     │ Customer Service │     │Inventory Service │
│   Port: 3001     │     │   Port: 3002     │     │   Port: 3003     │
│                  │     │                  │     │                  │
│  ┌────────────┐  │     │  ┌────────────┐  │     │  ┌────────────┐  │
│  │ Express.js │  │     │  │ Express.js │  │     │  │ Express.js │  │
│  └─────┬──────┘  │     │  └─────┬──────┘  │     │  └─────┬──────┘  │
│        │         │     │        │         │     │        │         │
│  ┌─────▼──────┐  │     │  ┌─────▼──────┐  │     │  ┌─────▼──────┐  │
│  │PostgreSQL  │  │     │  │PostgreSQL  │  │     │  │PostgreSQL  │  │
│  │Port: 5432  │  │     │  │Port: 5433  │  │     │  │Port: 5434  │  │
│  └────────────┘  │     │  └────────────┘  │     │  └────────────┘  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL 14
- **ORM/Client**: pg (node-postgres) or Sequelize
- **Containerization**: Docker & Docker Compose
- **API**: RESTful JSON


## 🚀 Implementation Steps

### Step 1: Setup Project Structure


### Step 2: Create Database Schema


### Step 3: Implement RESTful Endpoints


### Step 4: Create Dockerfile


### Step 5: Create Docker Compose



## ✅ Validation Checklist

- [ ] All three services run independently in Docker containers
- [ ] Each service has its own PostgreSQL database
- [ ] All CRUD operations work correctly
- [ ] Services can be stopped and started independently
- [ ] Data persists across container restarts (Docker volumes)
- [ ] API responses follow RESTful conventions
- [ ] Error handling is implemented
- [ ] Environment variables are used for configuration

## 🔍 Key Concepts Learned

1. **Service Independence**: Each microservice operates independently with its own database
2. **Bounded Contexts**: Each service manages its own domain (orders, customers, inventory)
3. **Database per Service Pattern**: Ensures loose coupling between services
4. **Containerization**: Docker ensures consistency across environments
5. **RESTful API Design**: Standard HTTP methods and status codes
6. **Environment Configuration**: Using environment variables for flexibility



**Duration**: 2 weeks  
**Difficulty**: Beginner to Intermediate
