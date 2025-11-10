CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données de test
INSERT INTO products (name, description, price, quantity) VALUES 
('Laptop Dell XPS', 'Laptop haute performance 16GB RAM', 1299.99, 15),
('iPhone 15 Pro', 'Smartphone Apple 128GB', 999.99, 25),
('Samsung Galaxy S24', 'Smartphone Android 256GB', 849.99, 30),
('MacBook Air M2', 'Laptop Apple Chip M2', 1199.99, 10),
('AirPods Pro', 'Écouteurs sans fil Apple', 249.99, 50)
ON CONFLICT DO NOTHING;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);