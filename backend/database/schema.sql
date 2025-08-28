-- ============================================
-- BASE DE DONNÉES AGRICONNECT RCA (schéma cohérent avec server.js)
-- ============================================

-- (optionnel si déjà créé) CREATE DATABASE agriconnect_rca;
-- \c agriconnect_rca;

-- Extensions UUID (préfère pgcrypto -> gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FONCTION & TRIGGER updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLE USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer','farmer','admin')) DEFAULT 'buyer',
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_sango VARCHAR(100),
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catégories par défaut
INSERT INTO categories (name, name_sango, icon, description)
VALUES
  ('manioc', 'Mbagara', '🥔', 'Tubercules et dérivés du manioc'),
  ('cereales', 'Bale ti kobe', '🌾', 'Céréales (maïs, riz, mil, etc.)'),
  ('legumes',  'Nakulu', '🥬', 'Légumes frais et feuilles'),
  ('fruits',   'Kpondo', '🥭', 'Fruits tropicaux et de saison')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- TABLE PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  image_url TEXT,
  organic BOOLEAN NOT NULL DEFAULT FALSE,
  harvest_date DATE,
  description TEXT,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  total_sold INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE ORDERS (commande simple par produit)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id  UUID REFERENCES users(id)    ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES users(id)    ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
         CHECK (status IN ('pending','confirmed','prepared','delivered','cancelled')),
  delivery_address TEXT NOT NULL DEFAULT '',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id  ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info'
       CHECK (type IN ('info','success','warning','error')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(buyer_id, product_id, order_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);

-- ============================================
-- CITIES (optionnel, pour seed)
-- ============================================
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_sango VARCHAR(100),
  prefecture VARCHAR(100),
  population INTEGER,
  coordinates POINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO cities (name, name_sango, prefecture, population) VALUES
('Bangui','Bangui','Bangui',889231),
('Bimbo','Bimbo','Ombella-M''Poko',267859),
('Bégoua','Bégoua','Ombella-M''Poko',39676),
('Bambari','Bambari','Ouaka',41486),
('Bouar','Bouar','Nana-Mambéré',40353),
('Carnot','Carnot','Mambéré-Kadéï',45421),
('Sibut','Sibut','Kémo',34267)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- LOCALISATIONS (pour l'API /api/locations)
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('city','village','quarter')),
  parent_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_locations_name_type
ON locations (lower(name), type);

-- ============================================
-- VUES DE STATS (compatibles server.js)
-- ============================================
CREATE OR REPLACE VIEW farmer_stats AS
SELECT 
  u.id    AS farmer_id,
  u.name  AS farmer_name,
  COUNT(p.id)                 AS total_products,
  COALESCE(SUM(p.stock),0)    AS total_stock,
  COALESCE(SUM(p.total_sold),0) AS total_sold,
  COUNT(o.id)                 AS total_orders,
  COALESCE(SUM(CASE WHEN o.status='delivered' THEN o.total_amount ELSE 0 END),0) AS total_revenue,
  AVG(NULLIF(p.rating,0))     AS average_rating
FROM users u
LEFT JOIN products p ON u.id = p.farmer_id
LEFT JOIN orders   o ON u.id = o.farmer_id
WHERE u.user_type = 'farmer'
GROUP BY u.id, u.name;

CREATE OR REPLACE VIEW global_stats AS
SELECT 
  COUNT(DISTINCT CASE WHEN user_type='farmer' THEN id END) AS total_farmers,
  COUNT(DISTINCT CASE WHEN user_type='buyer'  THEN id END) AS total_buyers,
  (SELECT COUNT(*) FROM products WHERE is_active = TRUE)    AS total_products,
  (SELECT COUNT(*) FROM orders)                             AS total_orders,
  (SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE status='delivered') AS total_revenue
FROM users;

-- ============================================
-- SEED (facultatif) – mdp: "password123"
-- hash bcrypt $2b$10$rHtQxG... = "password123"
INSERT INTO users (name, phone, password_hash, location, user_type) VALUES
('Jean Bokassa',  '+23670123456', '$2b$10$rHtQxGYZKZXq5/JYNvyOy.nSPBZYlKgNqkM7VgKxE5dYpJ8yK2QOK', 'PK5, Bangui', 'farmer'),
('Marie Yakoma',  '+23670987654', '$2b$10$rHtQxGYZKZXq5/JYNvyOy.nSPBZYlKgNqkM7VgKxE5dYpJ8yK2QOK', 'Bimbo',      'buyer'),
('Admin RCA',     '+23670000000', '$2b$10$rHtQxGYZKZXq5/JYNvyOy.nSPBZYlKgNqkM7VgKxE5dYpJ8yK2QOK', 'Bangui',     'admin')
ON CONFLICT (phone) DO NOTHING;

-- Lier quelques produits au farmer si non présents
DO $$
DECLARE f UUID; c UUID;
BEGIN
  SELECT id INTO f FROM users WHERE user_type='farmer' ORDER BY created_at LIMIT 1;
  IF f IS NULL THEN RETURN; END IF;

  SELECT id INTO c FROM categories WHERE name='legumes';
  IF c IS NULL THEN
    INSERT INTO categories(name,icon) VALUES ('legumes','🥬') RETURNING id INTO c;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE farmer_id=f) THEN
    INSERT INTO products (name, category_id, farmer_id, price, stock, unit, description)
    VALUES
      ('Gombo', c, f, 700,  200, 'kg', 'Gombo frais'),
      ('Piment',c, f, 500,  150, 'kg', 'Piment rouge'),
      ('Aubergine', c, f, 900, 120, 'kg', 'Aubergine locale');
  END IF;
END$$;
