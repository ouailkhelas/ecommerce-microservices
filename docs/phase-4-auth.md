# Phase 4: Authentication & Authorization

## 🎯 Objective

Implement secure authentication using JSON Web Tokens (JWT) and role-based access control (RBAC) to protect the API and control user permissions.

## 📋 Deliverables

- ✅ JWT token generation and validation
- ✅ User registration and login endpoints
- ✅ Password hashing with bcrypt
- ✅ Refresh token mechanism
- ✅ Token validation middleware at API Gateway
- ✅ Role-Based Access Control (Admin, Customer, Staff)
- ✅ User context propagation across services

## 🏗️ Architecture

```
                    ┌──────────────────────┐
                    │   Client Application │
                    └──────────┬───────────┘
                               │
                    1. POST /auth/login
                    {email, password}
                               │
                    ┌──────────▼───────────┐
                    │   API Gateway        │
                    │   (NGINX + Auth)     │
                    └──────────┬───────────┘
                               │
                    2. Forward to Auth Service
                               │
                    ┌──────────▼───────────┐
                    │   Auth Service       │
                    │   - Validate creds   │
                    │   - Hash password    │
                    │   - Generate JWT     │
                    └──────────┬───────────┘
                               │
                    3. Return JWT Token
                    {token, refreshToken}
                               │
                    ┌──────────▼───────────┐
                    │   Client stores JWT  │
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │   Subsequent Requests│
                    │   Authorization:     │
                    │   Bearer <JWT>       │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   API Gateway        │
                    │   - Validate JWT     │
                    │   - Extract user info│
                    │   - Check permissions│
                    └──────────┬───────────┘
                               │
                    If valid & authorized
                               │
                    ┌──────────▼───────────┐
                    │   Backend Services   │
                    │   (with user context)│
                    └──────────────────────┘
```

## 🛠️ Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **jsonwebtoken** | JWT creation and validation | 9.0+ |
| **bcrypt** | Password hashing | 5.1+ |
| **express-jwt** | JWT middleware | 8.0+ |
| **PostgreSQL** | User data storage | 14+ |


## 🚀 Implementation Steps

### Step 1: Install Dependencies

### Step 2: Create User Model and Database Schema

### Step 3: Password Service

### Step 4: Token Service

### Step 5: Authentication Controller

### Step 6: JWT Validation Middleware

### Step 7: Role-Based Access Control Middleware

### Step 8: Apply Middleware to Routes

### Step 9: Update API Gateway for Authentication



## 🔐 RBAC Permission Matrix

| Resource | Admin | Staff | Customer |
|----------|-------|-------|----------|
| **Orders** |
| Create order | ✅ | ✅ | ✅ |
| View own orders | ✅ | N/A | ✅ |
| View all orders | ✅ | ✅ | ❌ |
| Update order status | ✅ | ✅ | ❌ |
| Delete order | ✅ | ❌ | ❌ |
| **Customers** |
| Create customer | ✅ | ✅ | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| View all customers | ✅ | ✅ | ❌ |
| Update own profile | ✅ | ✅ | ✅ |
| Update any profile | ✅ | ❌ | ❌ |
| Delete customer | ✅ | ❌ | ❌ |
| **Products** |
| View products | ✅ | ✅ | ✅ |
| Create product | ✅ | ✅ | ❌ |
| Update product | ✅ | ✅ | ❌ |
| Delete product | ✅ | ❌ | ❌ |
| Update stock | ✅ | ✅ | ❌ |
| **Payments** |
| Process payment | ✅ | ✅ | ✅ (own) |
| View all payments | ✅ | ✅ | ❌ |
| Refund payment | ✅ | ✅ | ❌ |

## 🧪 Testing

### Test 1: User Registration

### Test 2: User Login

### Test 3: Access Protected Endpoint

### Test 4: Role-Based Access

### Test 5: Token Refresh

### Test 6: Logout



## ✅ Validation Checklist

- [ ] User registration works with password validation
- [ ] Login returns valid JWT tokens
- [ ] JWT tokens verified correctly
- [ ] Expired tokens rejected with appropriate error
- [ ] Refresh token mechanism works
- [ ] Protected endpoints require authentication
- [ ] Role-based access control enforced
- [ ] Admin has full access
- [ ] Staff has limited access
- [ ] Customer has minimal access
- [ ] Logout revokes refresh tokens
- [ ] Password hashing secure (bcrypt)

## 🔍 Key Concepts Learned

1. **JWT Authentication**: Stateless token-based authentication
2. **Password Security**: Hashing with bcrypt and salt
3. **Access vs Refresh Tokens**: Short-lived access, long-lived refresh
4. **Role-Based Access Control**: Permission management by user role
5. **Middleware Pattern**: Reusable authentication and authorization logic
6. **Token Validation**: Verify signature, expiration, and claims
7. **Security Headers**: Authorization header with Bearer scheme

