-- Création de la table customers
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des données initiales
INSERT INTO customers (name, email, address, phone) VALUES 
('Ali Benali', 'ali@gmail.com', '123 Rue Principale, Casablanca', '+212-600-123456'),
('Sarah Smith', 'sarah@yahoo.com', '456 Avenue Mohammed V, Rabat', '+212-600-654321'),
('Mohamed Alami', 'mohamed@outlook.com', '789 Boulevard Hassan II, Marrakech', '+212-600-789012'),
('Lina Johnson', 'lina.johnson@email.com', '321 Rue du Commerce, Tanger', '+212-600-345678'),
('Karim El Fassi', 'karim.elfassi@email.com', '159 Avenue des FAR, Fès', '+212-600-111222'),
('Fatima Zahra', 'fatima.zahra@email.com', '753 Boulevard Mohammed VI, Agadir', '+212-600-333444')
ON CONFLICT (email) DO NOTHING;

-- Création d'index pour les performances
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);