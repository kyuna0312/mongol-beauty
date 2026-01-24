#!/usr/bin/env node

/**
 * Test database connection directly
 * Usage: node scripts/test-db-connection.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: 'apps/api/.env' });

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mongol_beauty',
  connectionTimeoutMillis: 10000,
});

console.log('🔌 Testing database connection...');
console.log('   Host:', process.env.DB_HOST || 'localhost');
console.log('   Port:', process.env.DB_PORT || '5432');
console.log('   Database:', process.env.DB_NAME || 'mongol_beauty');
console.log('   User:', process.env.DB_USER || 'postgres');
console.log('');

client.connect()
  .then(() => {
    console.log('✅ Connection established!');
    return client.query('SELECT version()');
  })
  .then((result) => {
    console.log('✅ Query successful!');
    console.log('   PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    return client.query('SELECT current_database(), current_user');
  })
  .then((result) => {
    console.log('✅ Database info:');
    console.log('   Current database:', result.rows[0].current_database);
    console.log('   Current user:', result.rows[0].current_user);
    client.end();
    console.log('');
    console.log('✅ All tests passed! Database is ready.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    console.error('   Code:', err.code);
    console.error('   Details:', err.detail || 'N/A');
    client.end();
    process.exit(1);
  });
