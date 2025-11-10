CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'email',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL
);

-- Données de test
INSERT INTO notifications (user_id, message, type, status, sent_at) VALUES 
(1, 'Votre commande #001 a été confirmée', 'email', 'sent', CURRENT_TIMESTAMP),
(2, 'Votre paiement a été traité avec succès', 'sms', 'pending', NULL),
(1, 'Votre colis a été expédié', 'email', 'sent', CURRENT_TIMESTAMP),
(3, 'Bienvenue sur notre plateforme!', 'email', 'sent', CURRENT_TIMESTAMP),
(2, 'Promotion spéciale - 20% de réduction', 'email', 'pending', NULL)
ON CONFLICT DO NOTHING;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);