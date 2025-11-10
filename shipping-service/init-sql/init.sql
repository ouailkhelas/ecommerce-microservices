-- Création de la table shipments
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT NOT NULL,
    carrier VARCHAR(50) DEFAULT 'DHL',
    estimated_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données de test
INSERT INTO shipments (order_id, customer_id, tracking_number, status, shipping_address, carrier, estimated_delivery) VALUES 
(1, 1, 'TRK-001-2024', 'processing', '123 Rue Principale, Casablanca', 'DHL', '2024-01-20'),
(2, 2, 'TRK-002-2024', 'shipped', '456 Avenue Mohammed V, Rabat', 'FedEx', '2024-01-18'),
(3, 3, 'TRK-003-2024', 'delivered', '789 Boulevard Hassan II, Marrakech', 'UPS', '2024-01-15')
ON CONFLICT (tracking_number) DO NOTHING;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);