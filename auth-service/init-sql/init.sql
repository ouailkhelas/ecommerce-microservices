-- Table des utilisateurs avec rôles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Table des refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT false
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Insérer des utilisateurs de test (mots de passe: "password123")
-- Hash bcrypt de "password123": $2b$10$rZ5L8xGKWQxJ4kQ8F3yK3eH4mXfYvYxLjN8hKjN8hKjN8hKjN8hKj
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('admin@example.com', '$2b$10$rZ5L8xGKWQxJ4kQ8F3yK3eH4mXfYvYxLjN8hKjN8hKjN8hKjN8hKj', 'admin', 'Admin', 'User'),
('customer@example.com', '$2b$10$rZ5L8xGKWQxJ4kQ8F3yK3eH4mXfYvYxLjN8hKjN8hKjN8hKjN8hKj', 'customer', 'John', 'Doe'),
('staff@example.com', '$2b$10$rZ5L8xGKWQxJ4kQ8F3yK3eH4mXfYvYxLjN8hKjN8hKjN8hKjN8hKj', 'staff', 'Jane', 'Smith')
ON CONFLICT (email) DO NOTHING;

