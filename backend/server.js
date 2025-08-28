// server.js - AgriConnect RCA (version complète)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/* =========================
   Sécurité: JWT Secret
========================= */
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET non défini, utilisation d\'une valeur temporaire (DEV)');
  process.env.JWT_SECRET = 'temp_secret_for_development_only_change_in_production';
}

const app = express();
const port = process.env.PORT || 3000;

/* =========================
   PostgreSQL Pool
========================= */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'agriconnect_rca',
  user: process.env.DB_USER || 'agriconnect_user',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/* =========================
   Middlewares
========================= */
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://192.168.1.178:8081',
    'http://192.168.1.178:8082'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

/* =========================
   Logs requêtes (debug)
========================= */
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('Body:', req.body);
  }
  next();
});

/* =========================
   Auth middlewares
========================= */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const t = authHeader && authHeader.split(' ')[1];
  if (!t) return res.status(401).json({ success: false, message: 'Token requis' });
  try {
    const decoded = jwt.verify(t, process.env.JWT_SECRET);
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Utilisateur invalide' });
    }
    req.user = userResult.rows[0];
    next();
  } catch (e) {
    console.error('Erreur authentification:', e);
    return res.status(403).json({ success: false, message: 'Token invalide' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.user_type)) {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }
  next();
};

/* =========================
   Boot helpers (tables)
========================= */

// Table pour OTP (password reset)
const ensurePasswordResetTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id BIGSERIAL PRIMARY KEY,
      phone TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_password_resets_phone ON password_resets(phone)`);
};

// Table d'analytics (événements)
const ensureAnalyticsTable = async () => {
  try { await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`); } catch {}
  let uuidFn = 'gen_random_uuid';
  const hasGen = await pool.query(`SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname='gen_random_uuid') AS ok`);
  if (!hasGen.rows[0].ok) {
    try { await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`); } catch {}
    const hasOssp = await pool.query(`SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname='uuid_generate_v4') AS ok`);
    uuidFn = hasOssp.rows[0].ok ? 'uuid_generate_v4' : null;
  }
  if (!uuidFn) {
    console.warn('⚠️ Aucune extension UUID disponible. La table analytics utilisera SERIAL.');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID,
        event_type TEXT NOT NULL,
        payload JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  } else {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT ${uuidFn}(),
        user_id UUID,
        event_type TEXT NOT NULL,
        payload JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at)`);
};

/* =========================
   Multer (upload)
========================= */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const base = path.basename(file.originalname || 'image', ext).replace(/\s+/g, '_');
    const name = `${base}_${Date.now()}${ext || '.bin'}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

/* =========================
   ROUTES
========================= */

// -------- Health --------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'API AgriConnect RCA', now: new Date().toISOString() });
});

// -------- Auth: register/login --------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, password, location, user_type } = req.body || {};
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Nom, téléphone et mot de passe requis' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Mot de passe trop court (min 6)' });
    }

    const exists = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (exists.rows.length) {
      return res.status(400).json({ success: false, message: 'Téléphone déjà utilisé' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    const r = await pool.query(
      `INSERT INTO users (name, phone, password_hash, location, user_type, is_active)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, name, phone, location, user_type`,
      [name, phone, password_hash, location || 'Non spécifié', user_type || 'buyer', true]
    );
    const u = r.rows[0];
    const token = jwt.sign({ userId: u.id, userType: u.user_type }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: { id: u.id, name: u.name, phone: u.phone, location: u.location, type: u.user_type }, token });
  } catch (e) {
    console.error('❌ register:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Tentative de connexion avec:', req.body);
  try {
    const { phone, password } = req.body || {};
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Téléphone et mot de passe requis' });
    }
    const r = await pool.query('SELECT * FROM users WHERE phone = $1 AND is_active = true', [phone]);
    if (!r.rows.length) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
    const u = r.rows[0];
    const ok = await bcrypt.compare(String(password), u.password_hash);
    if (!ok) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    const token = jwt.sign({ userId: u.id, userType: u.user_type }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: u.id, name: u.name, phone: u.phone, location: u.location, type: u.user_type }, token });
  } catch (e) {
    console.error('❌ login:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

// -------- Auth: forgot / verify-otp / reset --------
const OTP_TTL_MINUTES = 30;
const OTP_SALT_ROUNDS = 10;
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

app.post('/api/auth/forgot', async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'Téléphone requis' });

    const u = await pool.query('SELECT id FROM users WHERE phone=$1 AND is_active=true', [phone]);
    if (!u.rows.length) {
      console.log(`🔐 Demande OTP pour téléphone inconnu: ${phone} (réponse 200 par sécurité)`);
      return res.json({ success: true, message: 'Si le numéro existe, un code a été envoyé.' });
    }
    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, OTP_SALT_ROUNDS);
    await pool.query(
      `INSERT INTO password_resets (phone, code_hash, expires_at)
       VALUES ($1,$2,NOW() + INTERVAL '${OTP_TTL_MINUTES} minutes')`,
      [phone, codeHash]
    );
    console.log(`📨 OTP pour ${phone}: ${code} (valide ${OTP_TTL_MINUTES} min)`);
    res.json({ success: true, message: 'Code envoyé si le numéro est valide.' });
  } catch (e) {
    console.error('❌ forgot:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return res.status(400).json({ success: false, message: 'Téléphone et code requis' });

    const r = await pool.query(
      `SELECT id, code_hash, expires_at, used
       FROM password_resets
       WHERE phone=$1
       ORDER BY created_at DESC
       LIMIT 1`, [phone]
    );
    if (!r.rows.length) return res.status(400).json({ success: false, message: 'Aucun code demandé' });
    const pr = r.rows[0];
    if (pr.used) return res.status(400).json({ success: false, message: 'Code déjà utilisé' });
    if (new Date(pr.expires_at).getTime() < Date.now()) return res.status(400).json({ success: false, message: 'Code expiré' });
    const ok = await bcrypt.compare(String(code), pr.code_hash);
    if (!ok) return res.status(400).json({ success: false, message: 'Code invalide' });
    res.json({ success: true, valid: true, message: 'Code valide' });
  } catch (e) {
    console.error('❌ verify-otp:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

app.post('/api/auth/reset', async (req, res) => {
  const client = await pool.connect();
  try {
    const { phone, code, new_password } = req.body || {};
    if (!phone || !code || !new_password) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Téléphone, code et nouveau mot de passe requis' });
    }
    if (String(new_password).length < 6) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Mot de passe trop court (min 6)' });
    }

    await client.query('BEGIN');

    const u = await client.query('SELECT id FROM users WHERE phone=$1 AND is_active=true', [phone]);
    if (!u.rows.length) { await client.query('ROLLBACK'); return res.status(400).json({ success: false, message: 'Utilisateur introuvable' }); }
    const userId = u.rows[0].id;

    const r = await client.query(
      `SELECT id, code_hash, expires_at, used
       FROM password_resets
       WHERE phone=$1
       ORDER BY created_at DESC
       LIMIT 1`, [phone]
    );
    if (!r.rows.length) { await client.query('ROLLBACK'); return res.status(400).json({ success: false, message: 'Aucun code demandé' }); }
    const pr = r.rows[0];

    if (pr.used) { await client.query('ROLLBACK'); return res.status(400).json({ success: false, message: 'Code déjà utilisé' }); }
    if (new Date(pr.expires_at).getTime() < Date.now()) { await client.query('ROLLBACK'); return res.status(400).json({ success: false, message: 'Code expiré' }); }
    const ok = await bcrypt.compare(String(code), pr.code_hash);
    if (!ok) { await client.query('ROLLBACK'); return res.status(400).json({ success: false, message: 'Code invalide' }); }

    const password_hash = await bcrypt.hash(String(new_password), 10);
    await client.query('UPDATE users SET password_hash=$1 WHERE id=$2', [password_hash, userId]);
    await client.query('UPDATE password_resets SET used=true WHERE id=$1', [pr.id]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Mot de passe réinitialisé' });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ reset:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  } finally {
    client.release();
  }
});

/* =========================
   Produits
========================= */

// GET produits (PUBLIC) — pagination + recherche + filtres
// Query params : page, limit, search|q, category, city, farmer_id
app.get('/api/products', async (req, res) => {
  console.log('📦 Récupération des produits (pagination + recherche)…');

  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const rawLimit = Math.max(1, parseInt(req.query.limit || '12', 10));
    const limit = Math.min(rawLimit, 100);
    const offset = (page - 1) * limit;

    const search = (req.query.search || req.query.q || '').trim();
    const category = (req.query.category || '').trim();
    const city = (req.query.city || '').trim();
    const farmer_id = (req.query.farmer_id || '').trim();

    const filters = ['p.is_active = true'];
    const params = [];
    let i = 0;

    if (category && category.toLowerCase() !== 'tous') {
      i++; filters.push(`LOWER(c.name) = LOWER($${i})`);
      params.push(category);
    }
    if (city && city.toLowerCase() !== 'toutes') {
      i++; filters.push(`LOWER(u.location) = LOWER($${i})`);
      params.push(city);
    }
    if (farmer_id) {
      i++; filters.push(`p.farmer_id = $${i}`);
      params.push(farmer_id);
    }
    if (search) {
      i++; const like = `%${search}%`;
      filters.push(`(p.name ILIKE $${i} OR c.name ILIKE $${i} OR u.name ILIKE $${i} OR u.location ILIKE $${i})`);
      params.push(like);
    }

    const whereSQL = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const countSQL = `
      SELECT COUNT(*)::int AS total
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSQL};
    `;
    const countRes = await pool.query(countSQL, params);
    const total = countRes.rows?.[0]?.total || 0;
    const total_pages = Math.max(1, Math.ceil(total / limit));

    i++; const limitPos = i;
    i++; const offsetPos = i;
    const dataSQL = `
      SELECT
        p.id, p.name, p.price, p.stock, p.unit, p.image_url, p.organic,
        p.harvest_date, p.description, p.rating, p.reviews_count,
        p.total_sold, p.created_at, p.updated_at, p.is_active,
        p.category_id,
        u.name       AS farmer_name,
        u.phone      AS farmer_phone,
        u.location   AS farmer_location,
        c.name       AS category_name,
        c.icon       AS category_icon
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereSQL}
      ORDER BY p.created_at DESC
      LIMIT $${limitPos} OFFSET $${offsetPos};
    `;
    const dataParams = [...params, limit, offset];
    const dataRes = await pool.query(dataSQL, dataParams);

    console.log(`✅ ${dataRes.rows.length} produits (page ${page}/${total_pages}, total=${total})`);
    return res.json({
      success: true,
      data: dataRes.rows,
      page,
      limit,
      total,
      total_pages,
    });
  } catch (e) {
    console.error('❌ produits get (pagination):', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

// POST produit (farmer)
app.post('/api/products', authenticateToken, requireRole('farmer', 'admin'), async (req, res) => {
  console.log('➕ Création produit par:', req.user?.name);
  try {
    const { name, category, price, stock, unit, image_url, organic, harvest_date, description } = req.body || {};
    if (!name || !category || price == null || stock == null) {
      return res.status(400).json({ success: false, message: 'Nom, catégorie, prix et stock sont requis' });
    }
    // Catégorie
    let cat = await pool.query('SELECT id FROM categories WHERE name=$1', [category]);
    if (!cat.rows.length) {
      cat = await pool.query('INSERT INTO categories (name, icon) VALUES ($1,$2) RETURNING id', [category, '🌾']);
    }
    const categoryId = cat.rows[0].id;

    const r = await pool.query(
      `INSERT INTO products (name, category_id, farmer_id, price, stock, unit, image_url, organic, harvest_date, description, is_active, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE,NOW())
       RETURNING *`,
      [
        name,
        categoryId,
        req.user.id,
        Number(price),
        parseInt(stock, 10),
        unit || 'kg',
        image_url || null,
        Boolean(organic),
        harvest_date || new Date().toISOString().split('T')[0],
        description || ''
      ]
    );
    res.status(201).json({ success: true, message: 'Produit créé', data: r.rows[0] });
  } catch (e) {
    console.error('❌ produits post:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

// PUT produit
app.put('/api/products/:id', authenticateToken, requireRole('farmer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.user_type === 'farmer') {
      const own = await pool.query('SELECT id FROM products WHERE id=$1 AND farmer_id=$2', [id, req.user.id]);
      if (!own.rows.length) return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    const fields = ['name','price','stock','unit','image_url','organic','harvest_date','description','is_active'];
    const set = [];
    const vals = [];
    let i = 0;
    for (const f of fields) {
      if (f in req.body) { i++; set.push(`${f}=$${i}`); vals.push(req.body[f]); }
    }
    if ('category' in req.body) {
      let c = await pool.query('SELECT id FROM categories WHERE name=$1', [req.body.category]);
      if (!c.rows.length) c = await pool.query('INSERT INTO categories (name, icon) VALUES ($1,$2) RETURNING id', [req.body.category, '🌾']);
      i++; set.push(`category_id=$${i}`); vals.push(c.rows[0].id);
    }
    if (!set.length) return res.status(400).json({ success: false, message: 'Rien à mettre à jour' });
    i++; vals.push(id);
    const r = await pool.query(`UPDATE products SET ${set.join(', ')} WHERE id=$${i} RETURNING *`, vals);
    res.json({ success: true, data: r.rows[0] });
  } catch (e) {
    console.error('❌ produits put:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

// DELETE produit
app.delete('/api/products/:id', authenticateToken, requireRole('farmer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.user_type === 'farmer') {
      const own = await pool.query('SELECT id FROM products WHERE id=$1 AND farmer_id=$2', [id, req.user.id]);
      if (!own.rows.length) return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    await pool.query('UPDATE products SET is_active=false WHERE id=$1', [id]);
    res.json({ success: true, message: 'Produit désactivé' });
  } catch (e) {
    console.error('❌ produits delete:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

// DEBUG: voir brut en base
app.get('/api/dev/raw-products', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC NULLS LAST LIMIT 50');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'debug failed', detail: e.message });
  }
});

/* =========================
   Commandes
========================= */
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    let q = `
      SELECT o.*, p.name as product_name, p.image_url,
             u_buyer.name as buyer_name, u_farmer.name as farmer_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u_buyer ON o.buyer_id = u_buyer.id
      JOIN users u_farmer ON o.farmer_id = u_farmer.id
    `;
    const params = [];
    if (req.user.user_type === 'farmer') {
      q += ' WHERE o.farmer_id = $1'; params.push(req.user.id);
    } else if (req.user.user_type === 'buyer') {
      q += ' WHERE o.buyer_id = $1'; params.push(req.user.id);
    }
    q += ' ORDER BY o.created_at DESC';
    const r = await pool.query(q, params);
    res.json({ success: true, data: r.rows });
  } catch (e) {
    console.error('❌ orders get:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

app.post('/api/orders', authenticateToken, requireRole('buyer', 'admin'), async (req, res) => {
  try {
    const { product_id, quantity, delivery_address, notes } = req.body || {};
    if (!product_id || !quantity) return res.status(400).json({ success: false, message: 'Produit et quantité requis' });
    const p = await pool.query('SELECT * FROM products WHERE id=$1 AND is_active=TRUE', [product_id]);
    if (!p.rows.length) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    const product = p.rows[0];
    if (product.stock < Number(quantity)) return res.status(400).json({ success: false, message: 'Stock insuffisant' });

    const unit_price = Number(product.price);
    const total_amount = unit_price * Number(quantity);

    const r = await pool.query(
      `INSERT INTO orders (buyer_id, product_id, farmer_id, quantity, unit_price, total_amount, delivery_address, notes, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       RETURNING *`,
      [req.user.id, product_id, product.farmer_id, Number(quantity), unit_price, total_amount, delivery_address || '', notes || '', 'pending']
    );
    res.status(201).json({ success: true, message: 'Commande créée', data: r.rows[0] });
  } catch (e) {
    console.error('❌ orders post:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

/* =========================
   Checkout (multi-lignes)
========================= */
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendSms = async (to, body) => {
  if (!to) return;
  try {
    if (twilioClient && process.env.TWILIO_FROM) {
      await twilioClient.messages.create({ from: process.env.TWILIO_FROM, to, body });
      console.log(`📩 SMS envoyé à ${to}`);
    } else {
      console.log(`📩 [LOG SMS] → ${to}: ${body}`);
    }
  } catch (e) {
    console.log('⚠️ SMS non envoyé:', e.message);
  }
};

app.post('/api/checkout', authenticateToken, requireRole('buyer', 'admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, delivery_address, payment } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Panier vide' });
    }
    if (!delivery_address || !String(delivery_address).trim()) {
      return res.status(400).json({ success: false, message: 'Adresse de livraison requise' });
    }
    // Simulation OM
    const omPhone = (payment && payment.phone) || req.user.phone;
    if (!omPhone) return res.status(400).json({ success: false, message: 'Téléphone Orange Money requis' });

    await client.query('BEGIN');

    const created = [];
    const farmerPhones = new Set();
    let totalGeneral = 0;

    for (const it of items) {
      const pid = it.product_id;
      const qty = Math.max(1, parseInt(it.quantity, 10));
      if (!pid || !Number.isFinite(qty)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Ligne invalide dans le panier' });
      }

      // verrouiller la ligne produit
      const pr = await client.query(
        `SELECT p.*, u.phone AS farmer_phone
         FROM products p
         JOIN users u ON p.farmer_id = u.id
         WHERE p.id=$1 AND p.is_active=TRUE
         FOR UPDATE`,
        [pid]
      );
      if (!pr.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Produit introuvable' });
      }
      const prod = pr.rows[0];
      if (prod.stock < qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: `Stock insuffisant pour ${prod.name}` });
      }

      const unit_price = Number(prod.price);
      const total_amount = unit_price * qty;

      // décrémenter stock
      await client.query('UPDATE products SET stock = stock - $1 WHERE id=$2', [qty, pid]);

      // créer la commande
      const r = await client.query(
        `INSERT INTO orders
         (buyer_id, product_id, farmer_id, quantity, unit_price, total_amount, delivery_address, notes, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',NOW())
         RETURNING *`,
        [req.user.id, pid, prod.farmer_id, qty, unit_price, total_amount, delivery_address, '']
      );

      created.push(r.rows[0]);
      totalGeneral += total_amount;
      if (prod.farmer_phone) farmerPhones.add(prod.farmer_phone);
    }

    // (Sandbox) "autoriser" le paiement
    console.log(`💳 Paiement OM simulé pour ${omPhone} — montant total ${totalGeneral} FCFA`);
    await client.query('COMMIT');

    // SMS
    await sendSms(omPhone, `AgriConnect: paiement de ${totalGeneral} FCFA accepté. Merci pour votre commande.`);
    for (const phone of farmerPhones) {
      await sendSms(phone, `AgriConnect: vous avez reçu une nouvelle commande. Connectez-vous pour la préparer.`);
    }

    res.json({ success: true, message: 'Commande validée', total: totalGeneral, orders: created });
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error('❌ checkout:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  } finally {
    client.release();
  }
});

/* =========================
   Favoris
========================= */
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT f.*, p.name, p.price, p.image_url, u.name as farmer_name
       FROM favorites f
       JOIN products p ON f.product_id = p.id
       JOIN users u ON p.farmer_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: r.rows });
  } catch (e) {
    console.error('❌ favoris get:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

/* =========================
   Upload
========================= */
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

/* =========================
   Analytics + Admin metrics
========================= */
app.post('/api/analytics/event', async (req, res) => {
  try {
    const { type, payload } = req.body || {};
    if (!type) return res.status(400).json({ success: false, message: 'type requis' });

    let userId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId || null;
      } catch {}
    }
    await pool.query(
      `INSERT INTO analytics_events (user_id, event_type, payload) VALUES ($1,$2,$3)`,
      [userId, type, payload || {}]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('❌ analytics event:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

/* =========================
   Localisations
========================= */
app.get('/api/locations', async (req, res) => {
  try {
    const { search, type, limit } = req.query;
    const lim = Math.min(parseInt(limit || '25', 10), 100);

    let q = `
      SELECT id, name, type, parent_id, created_at
      FROM locations
      WHERE 1=1
    `;
    const params = [];
    let i = 0;

    if (type) { i++; q += ` AND type = $${i}`; params.push(type); }
    if (search) { i++; q += ` AND name ILIKE $${i}`; params.push(`%${search}%`); }
    q += ` ORDER BY name ASC LIMIT ${lim}`;

    const rs = await pool.query(q, params);
    res.json({ success: true, data: rs.rows });
  } catch (e) {
    console.error('❌ GET /api/locations error:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

app.post('/api/locations', async (req, res) => {
  try {
    const { name, type = 'city', parent_id = null } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Nom requis' });
    }
    const clean = String(name).trim();
    const exists = await pool.query(
      'SELECT id, name, type FROM locations WHERE lower(name) = lower($1) AND type = $2 LIMIT 1',
      [clean, type]
    );
    if (exists.rows.length) {
      return res.json({ success: true, data: exists.rows[0], message: 'Déjà existant' });
    }
    const rs = await pool.query(
      `INSERT INTO locations (name, type, parent_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, type, parent_id, created_at`,
      [clean, type, parent_id]
    );
    res.status(201).json({ success: true, data: rs.rows[0] });
  } catch (e) {
    console.error('❌ POST /api/locations error:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: e.message });
  }
});

/* =========================
   Erreurs & 404
========================= */
app.use((err, _req, res, _next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({ success: false, message: 'Erreur serveur interne', error: err.message });
});

app.use('*', (req, res) => {
  console.log('❌ Route non trouvée:', req.method, req.originalUrl);
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

/* =========================
   Démarrage
========================= */
const startServer = async () => {
  try {
    console.log('🔍 Test connexion base de données...');
    const test = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Connexion à PostgreSQL établie');
    console.log('📅 Heure serveur:', test.rows[0].current_time);

    await ensurePasswordResetTable();
    await ensureAnalyticsTable();

    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Serveur API AgriConnect RCA démarré sur le port ${port}`);
      console.log(`🌐 Santé API: http://localhost:${port}/api/health`);
      console.log(`📝 Inscription: POST http://localhost:${port}/api/auth/register`);
      console.log(`🔐 Connexion: POST http://localhost:${port}/api/auth/login`);
      console.log(`🔑 Oubli MDP: POST http://localhost:${port}/api/auth/forgot`);
      console.log(`✅ Vérif OTP: POST http://localhost:${port}/api/auth/verify-otp`);
      console.log(`🔁 Reset MDP: POST http://localhost:${port}/api/auth/reset`);
    });
  } catch (e) {
    console.error('❌ Erreur démarrage serveur:', e);
    console.error('💡 Vérifiez PostgreSQL et les droits (extensions, etc.)');
    process.exit(1);
  }
};

startServer();
