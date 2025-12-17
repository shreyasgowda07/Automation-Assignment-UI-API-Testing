#!/usr/bin/env node

/**
 * Interactive .env Configuration Helper
 * This script helps you configure your .env file step by step
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureEnv() {
  console.log('🔧 Automation Anywhere .env Configuration Helper\n');
  console.log('='.repeat(60));
  console.log('This script will help you configure your .env file.\n');
  console.log('Press Enter to use default values (shown in brackets)\n');

  const env = {};

  // UI Configuration
  console.log('\n📱 UI Test Configuration');
  console.log('-'.repeat(60));
  
  env.UI_BASE_URL = await question('UI Base URL [https://community.automationanywhere.com]: ') || 'https://community.automationanywhere.com';
  
  env.UI_USERNAME = await question('UI Username (email): ');
  if (!env.UI_USERNAME) {
    console.log('⚠️  Warning: UI_USERNAME is required for UI tests');
  }
  
  env.UI_PASSWORD = await question('UI Password: ');
  if (!env.UI_PASSWORD) {
    console.log('⚠️  Warning: UI_PASSWORD is required for UI tests');
  }
  
  const headless = await question('Run browser in headless mode? (y/n) [y]: ') || 'y';
  env.HEADLESS = headless.toLowerCase() === 'y' ? 'true' : 'false';

  // API Configuration
  console.log('\n🔌 API Test Configuration');
  console.log('-'.repeat(60));
  console.log('💡 Tip: Use browser Network tab to find API endpoints\n');
  
  env.API_BASE_URL = await question('API Base URL [https://community.automationanywhere.com/api/v1]: ') || 'https://community.automationanywhere.com/api/v1';
  
  console.log('\n💡 To get API Token:');
  console.log('   1. Log into Automation Anywhere');
  console.log('   2. Go to Settings → Security → API Tokens');
  console.log('   3. Generate/Create a new token');
  console.log('   4. Copy the token\n');
  
  env.API_TOKEN = await question('API Token: ');
  if (!env.API_TOKEN || env.API_TOKEN === 'your_api_token_here') {
    console.log('⚠️  Warning: API_TOKEN is required for API tests');
    console.log('   You can set it later by editing .env file\n');
  }

  // Generate .env content
  const envContent = `# ============================================
# UI Test Configuration
# ============================================
# Base URL for the Automation Anywhere Community Edition UI
UI_BASE_URL=${env.UI_BASE_URL}

# Your Automation Anywhere Community Edition login email
UI_USERNAME=${env.UI_USERNAME}

# Your Automation Anywhere Community Edition login password
UI_PASSWORD=${env.UI_PASSWORD}

# Run browser in headless mode (true) or visible mode (false)
# Set to false if you want to see the browser during test execution
HEADLESS=${env.HEADLESS}

# ============================================
# API Test Configuration
# ============================================
# Base URL for the Automation Anywhere API
API_BASE_URL=${env.API_BASE_URL}

# API authentication token (Bearer token)
# Replace with your actual API token from Automation Anywhere
API_TOKEN=${env.API_TOKEN || 'your_api_token_here'}
`;

  // Show summary
  console.log('\n📋 Configuration Summary');
  console.log('='.repeat(60));
  console.log('UI_BASE_URL:', env.UI_BASE_URL);
  console.log('UI_USERNAME:', env.UI_USERNAME);
  console.log('UI_PASSWORD:', '***');
  console.log('HEADLESS:', env.HEADLESS);
  console.log('API_BASE_URL:', env.API_BASE_URL);
  console.log('API_TOKEN:', env.API_TOKEN ? (env.API_TOKEN.substring(0, 20) + '...') : 'NOT SET');

  const confirm = await question('\n💾 Save this configuration to .env file? (y/n) [y]: ') || 'y';
  
  if (confirm.toLowerCase() === 'y') {
    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Configuration saved to .env file!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Review .env file and update if needed');
    console.log('   2. Test configuration: node test-config.js');
    console.log('   3. Run tests: npm test\n');
  } else {
    console.log('\n❌ Configuration not saved. Run the script again when ready.\n');
  }

  rl.close();
}

// Run configuration
configureEnv().catch((error) => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});



