-- =========================================
-- Création de la table payments
-- =========================================
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    customer_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- Données de test
-- =========================================
INSERT INTO payments (order_id, customer_id, amount, payment_method, status, transaction_id) VALUES 
(1, 1, 1999.98, 'credit_card', 'completed', 'TXN-001-2024'),
(2, 2, 75.00, 'paypal', 'completed', 'TXN-002-2024'),
(3, 3, 450.00, 'credit_card', 'pending', 'TXN-003-2024')
ON CONFLICT (transaction_id) DO NOTHING;

-- =========================================
-- Index pour performances
-- =========================================
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
