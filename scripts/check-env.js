#!/usr/bin/env node

/**
 * Check if all required environment files exist
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  { path: '.env', name: 'Root .env' },
  { path: 'apps/api/.env', name: 'Backend .env' },
  { path: 'apps/web/.env', name: 'Frontend .env' },
];

let allExist = true;

console.log('🔍 Checking environment files...\n');

requiredFiles.forEach(({ path: filePath, name }) => {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`✅ ${name}: Found`);
  } else {
    console.log(`❌ ${name}: Missing`);
    console.log(`   Create it: cp ${filePath}.example ${filePath}`);
    allExist = false;
  }
});

if (!allExist) {
  console.log('\n⚠️  Some environment files are missing!');
  console.log('   Please create them from the .example files.');
  process.exit(1);
} else {
  console.log('\n✅ All environment files are present!');
  process.exit(0);
}
