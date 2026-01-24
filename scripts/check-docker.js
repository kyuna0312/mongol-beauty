#!/usr/bin/env node

/**
 * Check if Docker and Docker Compose are available
 */

const { execSync } = require('child_process');

console.log('🔍 Checking Docker installation...\n');

let dockerInstalled = false;
let dockerComposeAvailable = false;

// Check Docker
try {
  execSync('docker --version', { stdio: 'ignore' });
  const dockerVersion = execSync('docker --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ Docker: ${dockerVersion}`);
  dockerInstalled = true;
} catch (error) {
  console.log('❌ Docker: Not installed or not in PATH');
}

// Check Docker Compose (try both methods)
if (dockerInstalled) {
  try {
    // Try 'docker compose' (plugin)
    execSync('docker compose version', { stdio: 'ignore' });
    const composeVersion = execSync('docker compose version', { encoding: 'utf-8' }).trim();
    console.log(`✅ Docker Compose: ${composeVersion.split('\n')[0]}`);
    dockerComposeAvailable = true;
  } catch (error) {
    try {
      // Try 'docker-compose' (standalone)
      execSync('docker-compose --version', { stdio: 'ignore' });
      const composeVersion = execSync('docker-compose --version', { encoding: 'utf-8' }).trim();
      console.log(`✅ Docker Compose: ${composeVersion}`);
      dockerComposeAvailable = true;
    } catch (error2) {
      console.log('❌ Docker Compose: Not available');
    }
  }
}

if (!dockerInstalled) {
  console.log('\n📦 Installation Guide:');
  console.log('  Fedora:  See INSTALL_DOCKER_FEDORA.md in project root');
  console.log('  macOS:   https://docs.docker.com/desktop/install/mac-install/');
  console.log('  Linux:   https://docs.docker.com/engine/install/');
  console.log('  Windows: https://docs.docker.com/desktop/install/windows-install/');
  console.log('\n💡 Quick Fedora install:');
  console.log('   Option 1 (Automated): bash INSTALL_DOCKER_FEDORA_QUICK.sh');
  console.log('   Option 2 (RPM Fusion): sudo dnf install docker docker-compose');
  console.log('   Then: sudo systemctl start docker && sudo usermod -aG docker $USER');
  console.log('   Apply changes: newgrp docker');
  process.exit(1);
}

if (!dockerComposeAvailable) {
  console.log('\n📦 Docker Compose Installation:');
  console.log('  It should be included with Docker Desktop');
  console.log('  Or install separately: https://docs.docker.com/compose/install/');
  process.exit(1);
}

console.log('\n✅ Docker is ready to use!');
process.exit(0);
