#!/usr/bin/env node

/**
 * Configuration Test Script for Automation Anywhere
 * This script helps verify your .env configuration
 */

require('dotenv').config();
const axios = require('axios');

console.log('🔍 Automation Anywhere Configuration Test\n');
console.log('=' .repeat(50));

// Test UI Configuration
console.log('\n📱 UI Configuration:');
console.log('  UI_BASE_URL:', process.env.UI_BASE_URL || '❌ NOT SET');
console.log('  UI_USERNAME:', process.env.UI_USERNAME || '❌ NOT SET');
console.log('  UI_PASSWORD:', process.env.UI_PASSWORD ? '***' : '❌ NOT SET');
console.log('  HEADLESS:', process.env.HEADLESS || 'true');

// Test API Configuration
console.log('\n🔌 API Configuration:');
console.log('  API_BASE_URL:', process.env.API_BASE_URL || '❌ NOT SET');
console.log('  API_TOKEN:', process.env.API_TOKEN ? 
  (process.env.API_TOKEN === 'your_api_token_here' ? '❌ NOT CONFIGURED (still placeholder)' : '✅ SET') 
  : '❌ NOT SET');

// Test URL Accessibility
console.log('\n🌐 Testing URL Accessibility:\n');

async function testURL(url, name) {
  try {
    const response = await axios.head(url, { timeout: 5000, validateStatus: () => true });
    if (response.status < 400) {
      console.log(`  ✅ ${name}: ${url} - Accessible (Status: ${response.status})`);
      return true;
    } else {
      console.log(`  ⚠️  ${name}: ${url} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.log(`  ❌ ${name}: ${url} - Domain not found`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`  ❌ ${name}: ${url} - Connection refused`);
    } else {
      console.log(`  ❌ ${name}: ${url} - Error: ${error.message}`);
    }
    return false;
  }
}

async function testAPI() {
  if (process.env.API_BASE_URL && process.env.API_TOKEN && process.env.API_TOKEN !== 'your_api_token_here') {
    try {
      console.log('\n🔐 Testing API Authentication:');
      const response = await axios.get(`${process.env.API_BASE_URL}/learning-instances`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log(`  ✅ API Authentication: SUCCESS (Status: ${response.status})`);
      } else if (response.status === 401) {
        console.log(`  ❌ API Authentication: FAILED - Unauthorized (Invalid token?)`);
      } else if (response.status === 404) {
        console.log(`  ⚠️  API Authentication: Token might be valid, but endpoint not found`);
      } else {
        console.log(`  ⚠️  API Authentication: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ API Authentication: Error - ${error.message}`);
    }
  } else {
    console.log('\n⚠️  Skipping API test - API_BASE_URL or API_TOKEN not configured');
  }
}

(async () => {
  if (process.env.UI_BASE_URL) {
    await testURL(process.env.UI_BASE_URL, 'UI Base URL');
  }
  
  if (process.env.API_BASE_URL) {
    await testURL(process.env.API_BASE_URL, 'API Base URL');
  }
  
  await testAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📝 Next Steps:');
  console.log('  1. Verify all URLs are accessible');
  console.log('  2. Ensure API_TOKEN is set (not placeholder)');
  console.log('  3. Test login manually in browser to verify credentials');
  console.log('  4. Run tests: npm test\n');
})();

