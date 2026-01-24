#!/usr/bin/env node

/**
 * Setup environment files from .example files
 * Automatically creates .env files if they don't exist
 */

const fs = require('fs');
const path = require('path');

const envFiles = [
  { example: '.env.example', target: '.env', name: 'Root .env' },
  { example: 'apps/api/.env.example', target: 'apps/api/.env', name: 'Backend .env' },
  { example: 'apps/web/.env.example', target: 'apps/web/.env', name: 'Frontend .env' },
];

console.log('🔧 Setting up environment files...\n');

let created = 0;
let skipped = 0;

envFiles.forEach(({ example, target, name }) => {
  const examplePath = path.join(process.cwd(), example);
  const targetPath = path.join(process.cwd(), target);
  
  // Check if example file exists
  if (!fs.existsSync(examplePath)) {
    console.log(`⚠️  ${name}: Example file not found (${example})`);
    return;
  }
  
  // Check if target already exists
  if (fs.existsSync(targetPath)) {
    console.log(`⏭️  ${name}: Already exists, skipping`);
    skipped++;
    return;
  }
  
  // Copy example to target
  try {
    fs.copyFileSync(examplePath, targetPath);
    console.log(`✅ ${name}: Created from ${example}`);
    created++;
  } catch (error) {
    console.error(`❌ ${name}: Failed to create - ${error.message}`);
    process.exit(1);
  }
});

console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);

if (created > 0) {
  console.log('\n💡 Tip: Review and update the .env files if needed.');
}

process.exit(0);
