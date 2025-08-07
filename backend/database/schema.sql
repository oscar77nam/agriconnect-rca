-- ============================================
-- BASE DE DONNÉES AGRICONNECT RCA
-- ============================================

-- Créer la base de données
CREATE DATABASE agriconnect_rca;

-- Utiliser la base de données
\c agriconnect_rca;

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE USERS (Utilisateurs)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('farmer', 'buyer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    verified BOOLEAN DEFAULT false
);

-- Index sur les champs fréquemment utilisés
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_location ON users(location);

-- ============================================
-- TABLE CATEGORIES (Catégories de produits)
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    name_sango VARCHAR(100),
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les catégories par défaut
INSERT INTO categories (name, name_sango, icon, description) VALUES
('manioc', 'Mbagara', '🥔', 'Tubercules et dérivés du manioc'),
('cereales', 'Bale ti kobe', '🌾', 'Céréales (maïs, riz, mil, etc.)'),
('legumes', 'Nakulu', '🥬', 'Légumes frais et légumes feuilles'),
('fruits', 'Kpondo', '🥭', 'Fruits tropicaux et de saison');

-- ============================================
-- TABLE PRODUCTS (Produits)
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id),
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'kg',
    image_url TEXT,
    organic BOOLEAN DEFAULT false,
    harvest_date DATE,
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    total_sold INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_products_farmer_id ON products(farmer_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);

-- ============================================
-- TABLE ORDERS (Commandes)
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'prepared', 'delivered', 'cancelled')),
    delivery_address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP
);

-- Index pour les commandes
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================
-- TABLE FAVORITES (Favoris)
-- ============================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Index pour les favoris
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- ============================================
-- TABLE NOTIFICATIONS (Notifications)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data JSONB -- Pour stocker des données supplémentaires
);

-- Index pour les notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- TABLE REVIEWS (Avis sur les produits)
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(buyer_id, product_id, order_id)
);

-- Index pour les avis
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON reviews(buyer_id);

-- ============================================
-- TABLE CITIES (Villes de RCA)
-- ============================================
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    name_sango VARCHAR(100),
    prefecture VARCHAR(100),
    population INTEGER,
    coordinates POINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les villes principales de RCA
INSERT INTO cities (name, name_sango, prefecture, population) VALUES
('Bangui', 'Bangui', 'Bangui', 889231),
('Bimbo', 'Bimbo', 'Ombella-M''Poko', 267859),
('Bégoua', 'Bégoua', 'Ombella-M''Poko', 39676),
('Bambari', 'Bambari', 'Ouaka', 41486),
('Bouar', 'Bouar', 'Nana-Mambéré', 40353),
('Carnot', 'Carnot', 'Mambéré-Kadéï', 45421),
('Sibut', 'Sibut', 'Kémo', 34267);

-- ============================================
-- TRIGGERS POUR UPDATED_AT
-- ============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour les tables principales
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FONCTION POUR METTRE À JOUR LES STATS PRODUITS
-- ============================================
CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour les stats quand une commande est livrée
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE products 
        SET total_sold = total_sold + NEW.quantity,
            stock = stock - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour les stats produits
CREATE TRIGGER update_product_stats_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stats();

-- ============================================
-- VUES POUR LES STATISTIQUES
-- ============================================

-- Vue pour les statistiques des agriculteurs
CREATE VIEW farmer_stats AS
SELECT 
    u.id as farmer_id,
    u.name as farmer_name,
    COUNT(p.id) as total_products,
    SUM(p.stock) as total_stock,
    SUM(p.total_sold) as total_sold,
    COUNT(o.id) as total_orders,
    SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE 0 END) as total_revenue,
    AVG(p.rating) as average_rating
FROM users u
LEFT JOIN products p ON u.id = p.farmer_id
LEFT JOIN orders o ON u.id = o.farmer_id
WHERE u.user_type = 'farmer'
GROUP BY u.id, u.name;

-- Vue pour les statistiques globales
CREATE VIEW global_stats AS
SELECT 
    COUNT(DISTINCT CASE WHEN user_type = 'farmer' THEN id END) as total_farmers,
    COUNT(DISTINCT CASE WHEN user_type = 'buyer' THEN id END) as total_buyers,
    (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT SUM(total_amount) FROM orders WHERE status = 'delivered') as total_revenue
FROM users;

-- ============================================
-- DONNÉES DE TEST
-- ============================================

-- Insérer des utilisateurs de test (mot de passe: "password123")
INSERT INTO users (name, phone, password_hash, location, user_type) VALUES
('Jean Bokassa', '+23670123456', '$2b$10$rHtQxGYZKZXq5/JYNvyOy.nSPBZYlKgNqkM7VgKxE5dYpJ8yK2QOK', 'PK5, Bangui', 'farmer'),
('Marie Yakoma', '+23670987654', '$2b$10$rHtQxGYZKZXq5/JYNvyOy.nSPBZYlKgNqkM7VgKxE5dYpJ8yK2QOK', '