#!/usr/bin/env node

/**
 * Wait for PostgreSQL to be ready
 * Usage: node scripts/wait-for-db.js
 */

const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mongol_beauty',
};

const maxAttempts = 30;
const delay = 1000; // 1 second

async function waitForDatabase() {
  console.log('⏳ Waiting for PostgreSQL to be ready...');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = new Client(config);
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      
      console.log('✅ PostgreSQL is ready!');
      process.exit(0);
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error('❌ Failed to connect to PostgreSQL after', maxAttempts, 'attempts');
        console.error('Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure Docker is running: docker ps');
        console.log('   2. Start the database: yarn docker:up');
        console.log('   3. Check database logs: yarn docker:logs');
        process.exit(1);
      }
      
      process.stdout.write(`   Attempt ${attempt}/${maxAttempts}...\r`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

waitForDatabase();
