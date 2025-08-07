const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Vérification des variables d'environnement critiques
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET non défini, utilisation d\'une valeur temporaire');
  process.env.JWT_SECRET = 'temp_secret_for_development_only_change_in_production';
}

const app = express();
const port = process.env.PORT || 3000;

console.log('🔍 Configuration de la base de données...');

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'agriconnect_rca',
  user: process.env.DB_USER || 'agriconnect_user',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

console.log('🔍 Configuration des middlewares...');

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:8081', 
    'http://localhost:8082',
    'http://192.168.1.178:8081', // ← Votre IP exacte
    'http://192.168.1.178:8082'  // ← Votre IP exacte
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log des requêtes pour debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requis' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Utilisateur invalide' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Erreur authentification:', error);
    return res.status(403).json({ success: false, message: 'Token invalide' });
  }
};

console.log('🔍 Définition des routes...');

// ============================================
// ROUTES D'AUTHENTIFICATION
// ============================================

// Inscription
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Tentative d\'inscription avec:', req.body);
  
  try {
    const { name, phone, password, location, user_type } = req.body;

    // Validation stricte
    if (!name || !phone || !password) {
      console.log('❌ Champs manquants:', { name: !!name, phone: !!phone, password: !!password });
      return res.status(400).json({ 
        success: false, 
        message: 'Nom, téléphone et mot de passe sont requis',
        missing: {
          name: !name,
          phone: !phone,
          password: !password
        }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    console.log('🔍 Vérification utilisateur existant...');
    const existingUser = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      console.log('❌ Utilisateur existe déjà');
      return res.status(400).json({ success: false, message: 'Ce numéro de téléphone est déjà utilisé' });
    }

    // Hasher le mot de passe
    console.log('🔐 Hashage du mot de passe...');
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    console.log('💾 Création utilisateur en base...');
    const result = await pool.query(
      'INSERT INTO users (name, phone, password_hash, location, user_type, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, phone, location, user_type, created_at',
      [name, phone, password_hash, location || 'Non spécifié', user_type || 'buyer', true]
    );

    const user = result.rows[0];
    console.log('✅ Utilisateur créé:', user);

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        location: user.location,
        type: user.user_type
      },
      token
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message 
    });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Tentative de connexion avec:', req.body);
  
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      console.log('❌ Champs manquants:', { phone: !!phone, password: !!password });
      return res.status(400).json({ 
        success: false, 
        message: 'Téléphone et mot de passe requis',
        missing: {
          phone: !phone,
          password: !password
        }
      });
    }

    // Trouver l'utilisateur
    console.log('🔍 Recherche utilisateur avec téléphone:', phone);
    const userResult = await pool.query('SELECT * FROM users WHERE phone = $1 AND is_active = true', [phone]);
    
    console.log(`📊 Utilisateurs trouvés: ${userResult.rows.length}`);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Aucun utilisateur trouvé avec ce téléphone');
      
      // DEBUG: Afficher tous les utilisateurs pour vérifier
      const allUsers = await pool.query('SELECT phone, name FROM users WHERE is_active = true LIMIT 5');
      console.log('👥 Utilisateurs existants:', allUsers.rows);
      
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const user = userResult.rows[0];
    console.log('👤 Utilisateur trouvé:', { id: user.id, name: user.name, phone: user.phone });

    // Vérifier le mot de passe
    console.log('🔐 Vérification mot de passe...');
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('🔐 Mot de passe valide:', validPassword);
    
    if (!validPassword) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    console.log('✅ Connexion réussie pour:', user.name);

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        location: user.location,
        type: user.user_type
      },
      token
    });

  } catch (error) {
    console.error('❌ Erreur connexion complète:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la connexion',
      error: error.message 
    });
  }
});

// ============================================
// ROUTES PRODUITS
// ============================================

// Obtenir tous les produits
app.get('/api/products', authenticateToken, async (req, res) => {
  console.log('📦 Récupération des produits...');
  
  try {
    const { category, city, search, farmer_id } = req.query;
    
    let query = `
      SELECT p.*, u.name as farmer_name, u.phone as farmer_phone, u.location as farmer_location,
             c.name as category_name, c.icon as category_icon
      FROM products p 
      JOIN users u ON p.farmer_id = u.id 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    const params = [];
    let paramCount = 0;

    if (category && category !== 'tous') {
      paramCount++;
      query += ` AND c.name = $${paramCount}`;
      params.push(category);
    }

    if (farmer_id) {
      paramCount++;
      query += ` AND p.farmer_id = $${paramCount}`;
      params.push(farmer_id);
    }

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR u.name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    console.log('🔍 Requête produits:', query, params);
    const result = await pool.query(query, params);
    
    console.log(`✅ ${result.rows.length} produits trouvés`);
    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

// Créer un produit
app.post('/api/products', authenticateToken, async (req, res) => {
  console.log('➕ Création produit par:', req.user.name);
  console.log('📝 Données produit:', req.body);
  
  try {
    if (req.user.user_type !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Seuls les agriculteurs peuvent ajouter des produits' });
    }

    const { name, category, price, stock, unit, image_url, organic, harvest_date, description } = req.body;

    // Validation
    if (!name || !category || !price || !stock) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nom, catégorie, prix et stock sont requis',
        missing: {
          name: !name,
          category: !category,
          price: !price,
          stock: !stock
        }
      });
    }

    // Obtenir l'ID de la catégorie ou la créer
    console.log('🔍 Recherche catégorie:', category);
    let categoryResult = await pool.query('SELECT id FROM categories WHERE name = $1', [category]);
    
    if (categoryResult.rows.length === 0) {
      console.log('➕ Création nouvelle catégorie:', category);
      categoryResult = await pool.query(
        'INSERT INTO categories (name, icon) VALUES ($1, $2) RETURNING id',
        [category, '🌾'] // Icône par défaut
      );
    }

    const categoryId = categoryResult.rows[0].id;
    console.log('✅ Catégorie ID:', categoryId);

    // Créer le produit
    console.log('💾 Insertion produit en base...');
    const result = await pool.query(
      `INSERT INTO products (name, category_id, farmer_id, price, stock, unit, image_url, organic, harvest_date, description, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name, 
        categoryId, 
        req.user.id, 
        parseFloat(price), 
        parseInt(stock), 
        unit || 'kg', 
        image_url || null, 
        organic || false, 
        harvest_date || new Date().toISOString().split('T')[0], 
        description || '',
        true
      ]
    );

    console.log('✅ Produit créé:', result.rows[0]);
    res.status(201).json({ success: true, message: 'Produit créé avec succès', data: result.rows[0] });

  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la création du produit',
      error: error.message 
    });
  }
});

// ============================================
// ROUTES COMMANDES
// ============================================

// Obtenir les commandes
app.get('/api/orders', authenticateToken, async (req, res) => {
  console.log('📋 Récupération des commandes...');
  
  try {
    let query = `
      SELECT o.*, p.name as product_name, p.image_url,
             u_buyer.name as buyer_name, u_farmer.name as farmer_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u_buyer ON o.buyer_id = u_buyer.id
      JOIN users u_farmer ON o.farmer_id = u_farmer.id
    `;
    
    const params = [];
    
    if (req.user.user_type === 'farmer') {
      query += ' WHERE o.farmer_id = $1';
      params.push(req.user.id);
    } else if (req.user.user_type === 'buyer') {
      query += ' WHERE o.buyer_id = $1';
      params.push(req.user.id);
    }
    // Admin voit toutes les commandes

    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    console.log(`✅ ${result.rows.length} commandes trouvées`);
    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('❌ Erreur récupération commandes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
});

// Créer une commande
app.post('/api/orders', authenticateToken, async (req, res) => {
  console.log('🛒 Création commande par:', req.user.name);
  console.log('📝 Données commande:', req.body);
  
  try {
    if (req.user.user_type !== 'buyer') {
      return res.status(403).json({ success: false, message: 'Seuls les acheteurs peuvent passer commande' });
    }

    const { product_id, quantity, delivery_address, notes } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Produit et quantité requis',
        missing: {
          product_id: !product_id,
          quantity: !quantity
        }
      });
    }

    // Vérifier que le produit existe et a assez de stock
    const productResult = await pool.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const product = productResult.rows[0];
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Stock insuffisant' });
    }

    const unit_price = product.price;
    const total_amount = unit_price * quantity;

    // Créer la commande
    const result = await pool.query(
      `INSERT INTO orders (buyer_id, product_id, farmer_id, quantity, unit_price, total_amount, delivery_address, notes, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [req.user.id, product_id, product.farmer_id, quantity, unit_price, total_amount, delivery_address || '', notes || '', 'pending']
    );

    console.log('✅ Commande créée:', result.rows[0]);
    res.status(201).json({ success: true, message: 'Commande créée avec succès', data: result.rows[0] });

  } catch (error) {
    console.error('❌ Erreur création commande:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la création de la commande',
      error: error.message 
    });
  }
});

// ============================================
// ROUTES FAVORIS
// ============================================

// Obtenir les favoris
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, p.name, p.price, p.image_url, u.name as farmer_name
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       JOIN users u ON p.farmer_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error('❌ Erreur récupération favoris:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// ROUTE DE SANTÉ
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API AgriConnect RCA en fonctionnement',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// ============================================
// GESTION D'ERREURS
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Erreur serveur interne',
    error: err.message 
  });
});

// Route 404
app.use('*', (req, res) => {
  console.log('❌ Route non trouvée:', req.method, req.originalUrl);
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const startServer = async () => {
  try {
    // Test de connexion à la base de données
    console.log('🔍 Test connexion base de données...');
    const testResult = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Connexion à PostgreSQL établie');
    console.log('📅 Heure serveur:', testResult.rows[0].current_time);
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Serveur API AgriConnect RCA démarré sur le port ${port}`);
      console.log(`🌐 Santé API: http://localhost:${port}/api/health`);
      console.log(`🌐 Accès réseau: http://YOUR_IP:${port}/api/health`);
      console.log(`📝 Inscription: POST http://localhost:${port}/api/auth/register`);
      console.log(`🔐 Connexion: POST http://localhost:${port}/api/auth/login`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    console.error('💡 Vérifiez que PostgreSQL est lancé et accessible');
    process.exit(1);
  }
};

startServer();