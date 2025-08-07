const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Connexion réussie:', result.rows[0]);
    await client.end();
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
  }
}

testConnection();