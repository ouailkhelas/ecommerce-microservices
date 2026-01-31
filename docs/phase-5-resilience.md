# Phase 5: Resilience & Fault Tolerance

## 🎯 Objective

Implement resilience patterns to handle failures gracefully, prevent cascading failures, and ensure the system can continue operating in degraded mode rather than completely failing.

## 📋 Deliverables

- ✅ Circuit breaker pattern for critical service calls
- ✅ Retry mechanism with exponential backoff
- ✅ Timeout configuration for all inter-service calls
- ✅ Fallback strategies for graceful degradation
- ✅ Rate limiting to prevent overload

## 🏗️ The Problem: Cascading Failures

### Without Resilience
```
User Request → Order Service → Payment Service (DOWN)
                     ↓
               Waits 30 seconds
                     ↓
               Times out, fails
                     ↓
          100 concurrent users × 30s
                     ↓
          All threads blocked!
                     ↓
          Order Service CRASHES
                     ↓
          ENTIRE SYSTEM DOWN!
```

### With Resilience Patterns
```
User Request → Order Service → Circuit Breaker → Payment Service (DOWN)
                     ↓                                    ↓
              Circuit OPENS                      Stop calling
                     ↓                                    
              Fallback Response                          
                     ↓
              Queue for Later
                     ↓
              Return "PENDING_PAYMENT"
                     ↓
              User gets response < 1 second
              System stays UP! ✅
```

## 🛠️ Technology Stack

| Library | Purpose | Configuration |
|---------|---------|---------------|
| **opossum** | Circuit breaker | 50% failure threshold, 30s reset |
| **axios-retry** | Retry with backoff | Max 3 attempts, exponential delay |
| **express-rate-limit** | Rate limiting | 100 req/15min per IP |
| **node-cache** | Caching for fallback | TTL 5 minutes |

## 🚀 Implementation Steps

### Step 1: Install Dependencies


### Step 2: Implement Circuit Breaker


### Step 3: Implement Retry with Exponential Backoff


### Step 4: Configure Timeouts


### Step 5: Implement Fallback Strategies


### Step 6: Implement Rate Limiting


### Step 7: Apply Middleware to Routes


## 🧪 Testing

### Test 1: Circuit Breaker Behavior

```bash
# 1. Start all services
docker-compose up -d

# 2. Send successful requests (circuit stays CLOSED)
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/orders \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"customerId":1,"items":[{"productId":1,"quantity":1}]}'
done

# 3. Stop payment service to trigger failures
docker-compose stop payment-service

# 4. Send 20 requests - circuit should open after 50% failure
for i in {1..20}; do
  curl -X POST http://localhost:8080/api/orders \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"customerId":1,"items":[{"productId":1,"quantity":1}]}'
  sleep 1
done

# 5. Circuit is now OPEN - subsequent requests fail fast (<1 second)
time curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"items":[{"productId":1,"quantity":1}]}'

# 6. Wait 30 seconds for circuit to enter HALF-OPEN
sleep 30

# 7. Restart payment service
docker-compose start payment-service

# 8. Circuit should close after successful request
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"items":[{"productId":1,"quantity":1}]}'
```

### Test 2: Retry Mechanism

```bash
# Check logs for retry attempts
docker-compose logs -f order-service | grep "Retry attempt"
```

### Test 3: Timeout

```bash
# Add artificial delay to payment service
# Then make request with 5-second timeout
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"items":[{"productId":1,"quantity":1}]}'

# Should timeout after 5 seconds
```

### Test 4: Rate Limiting

```bash
# Send rapid requests
for i in {1..15}; do
  curl -X POST http://localhost:8080/api/orders \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"customerId":1,"items":[{"productId":1,"quantity":1}]}'
done

# Should get 429 Too Many Requests after 10 requests
```

## ✅ Validation Checklist

- [ ] Circuit breaker opens after 50% failures
- [ ] Circuit breaker closes after successful requests
- [ ] Fallback strategies execute when circuit is open
- [ ] Retry attempts logged correctly
- [ ] Timeouts prevent indefinite waiting
- [ ] Rate limiting returns 429 status
- [ ] Metrics exposed for all resilience patterns
- [ ] System remains operational during service failures

## 🔍 Key Concepts Learned

1. **Circuit Breaker Pattern**: Prevent cascading failures by stopping calls to failing services
2. **Exponential Backoff**: Progressively increase delay between retries
3. **Timeout Configuration**: Set appropriate timeouts to prevent resource exhaustion
4. **Graceful Degradation**: Provide reduced functionality instead of complete failure
5. **Rate Limiting**: Protect services from overload
6. **Fallback Strategies**: Alternative responses when primary operation fails
