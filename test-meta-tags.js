#!/usr/bin/env node

/**
 * Meta Tags Validation Script
 * Tests Open Graph and Twitter Card meta tags for Contentlynk
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const TESTS = {
  production: 'https://contentlynk.com',
  local: 'http://localhost:3000'
};

// Expected meta tags based on optimized implementation
const EXPECTED_META_TAGS = {
  title: '🐘 Contentlynk | Where Creators Actually Get Paid',
  description: '55-75% revenue share vs traditional 0-5%. Zero follower minimums. Immediate earnings from day one. Beta Q2 2026 • 1,000 spots.',
  'og:title': '🐘 Contentlynk | Where Creators Actually Get Paid',
  'og:description': 'Get paid from day one. 55-75% revenue share vs traditional 0-5%. Zero follower minimums. Immediate earnings. Beta launch Q2 2026 • 1,000 founding creator spots available.',
  'og:image': '/images/og-image.png',
  'og:url': 'https://contentlynk.com',
  'og:type': 'website',
  'og:site_name': 'Contentlynk',
  'twitter:card': 'summary_large_image',
  'twitter:title': '🐘 Contentlynk | Where Creators Actually Get Paid',
  'twitter:description': '55-75% revenue share vs traditional 0-5%. Zero follower minimums. Immediate earnings from day one. Beta Q2 2026 • 1,000 spots.',
  'twitter:image': '/images/og-image.png',
  'twitter:creator': '@havanaelephant',
  'twitter:site': '@havanaelephant',
};

// Key messages to check for
const KEY_MESSAGES = [
  { name: 'Elephant Emoji', pattern: /🐘/, required: true },
  { name: 'Tagline', pattern: /Where Creators Actually Get Paid/i, required: true },
  { name: 'Revenue Share Range', pattern: /55-?75%/i, required: true },
  { name: 'Competitive Comparison', pattern: /0-?5%|traditional/i, required: true },
  { name: 'Zero Minimums', pattern: /zero.*minimums/i, required: true },
  { name: 'Immediate Earnings', pattern: /immediate.*earnings/i, required: true },
  { name: 'Beta Q2 2026', pattern: /beta.*q2.*2026/i, required: true },
  { name: '1,000 Spots', pattern: /1,?000.*spots/i, required: true },
];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function extractMetaTags(html) {
  const metaTags = {};

  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    metaTags.title = titleMatch[1].trim();
  }

  // Extract meta tags
  const metaRegex = /<meta\s+([^>]+)>/gi;
  let match;

  while ((match = metaRegex.exec(html)) !== null) {
    const attributes = match[1];

    // Extract property/name and content
    const propertyMatch = attributes.match(/(?:property|name)=["']([^"']+)["']/);
    const contentMatch = attributes.match(/content=["']([^"']+)["']/);

    if (propertyMatch && contentMatch) {
      const key = propertyMatch[1];
      const value = contentMatch[1];
      metaTags[key] = value;
    }
  }

  return metaTags;
}

function checkImageFile(imagePath) {
  const fullPath = path.join(__dirname, 'public', imagePath);

  if (!fs.existsSync(fullPath)) {
    return { exists: false, size: null, dimensions: null };
  }

  const stats = fs.statSync(fullPath);
  const sizeKB = (stats.size / 1024).toFixed(2);

  return {
    exists: true,
    size: sizeKB,
    path: fullPath
  };
}

function validateMetaTags(metaTags, environment) {
  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };

  // Check expected meta tags
  for (const [key, expectedValue] of Object.entries(EXPECTED_META_TAGS)) {
    const actualValue = metaTags[key];

    if (!actualValue) {
      results.failed.push({
        test: `Meta tag: ${key}`,
        expected: expectedValue,
        actual: 'Missing',
      });
      continue;
    }

    // For image paths, check if they match (allow full URLs in production)
    if (key.includes('image')) {
      if (actualValue.includes(expectedValue) || expectedValue.includes(actualValue)) {
        results.passed.push({
          test: `Meta tag: ${key}`,
          value: actualValue,
        });
      } else {
        results.failed.push({
          test: `Meta tag: ${key}`,
          expected: expectedValue,
          actual: actualValue,
        });
      }
      continue;
    }

    // Exact match for other fields
    if (actualValue === expectedValue) {
      results.passed.push({
        test: `Meta tag: ${key}`,
        value: actualValue,
      });
    } else {
      results.warnings.push({
        test: `Meta tag: ${key}`,
        expected: expectedValue,
        actual: actualValue,
      });
    }
  }

  return results;
}

function validateKeyMessages(metaTags) {
  const results = {
    passed: [],
    failed: [],
  };

  // Combine all meta tag values for searching
  const allText = Object.values(metaTags).join(' ');

  for (const message of KEY_MESSAGES) {
    if (message.pattern.test(allText)) {
      results.passed.push({
        test: `Key message: ${message.name}`,
        found: true,
      });
    } else {
      if (message.required) {
        results.failed.push({
          test: `Key message: ${message.name}`,
          pattern: message.pattern.toString(),
          found: false,
        });
      }
    }
  }

  return results;
}

function printResults(environment, metaTags, validation, keyMessages, imageCheck) {
  console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  Testing: ${environment.toUpperCase()}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Meta Tags Validation
  console.log(`${colors.bright}1. Meta Tags Validation${colors.reset}`);
  console.log(`   ${colors.green}✓ Passed: ${validation.passed.length}${colors.reset}`);

  validation.passed.forEach(item => {
    console.log(`     ${colors.green}✓${colors.reset} ${item.test}`);
  });

  if (validation.warnings.length > 0) {
    console.log(`   ${colors.yellow}⚠ Warnings: ${validation.warnings.length}${colors.reset}`);
    validation.warnings.forEach(item => {
      console.log(`     ${colors.yellow}⚠${colors.reset} ${item.test}`);
      console.log(`       Expected: ${colors.yellow}${item.expected}${colors.reset}`);
      console.log(`       Actual:   ${colors.cyan}${item.actual}${colors.reset}`);
    });
  }

  if (validation.failed.length > 0) {
    console.log(`   ${colors.red}✗ Failed: ${validation.failed.length}${colors.reset}`);
    validation.failed.forEach(item => {
      console.log(`     ${colors.red}✗${colors.reset} ${item.test}`);
      console.log(`       Expected: ${item.expected}`);
      console.log(`       Actual:   ${colors.red}${item.actual}${colors.reset}`);
    });
  }

  // Key Messages Validation
  console.log(`\n${colors.bright}2. Key Messages Check${colors.reset}`);
  console.log(`   ${colors.green}✓ Found: ${keyMessages.passed.length}/${KEY_MESSAGES.length}${colors.reset}`);

  keyMessages.passed.forEach(item => {
    console.log(`     ${colors.green}✓${colors.reset} ${item.test}`);
  });

  if (keyMessages.failed.length > 0) {
    console.log(`   ${colors.red}✗ Missing: ${keyMessages.failed.length}${colors.reset}`);
    keyMessages.failed.forEach(item => {
      console.log(`     ${colors.red}✗${colors.reset} ${item.test}`);
    });
  }

  // Image Check
  console.log(`\n${colors.bright}3. OG Image Check${colors.reset}`);
  if (imageCheck.exists) {
    console.log(`   ${colors.green}✓ Image exists${colors.reset}`);
    console.log(`     Path: ${imageCheck.path}`);
    console.log(`     Size: ${imageCheck.size} KB`);
    if (parseFloat(imageCheck.size) > 1024) {
      console.log(`     ${colors.yellow}⚠ Warning: Image size exceeds 1MB (${imageCheck.size} KB)${colors.reset}`);
    }
  } else {
    console.log(`   ${colors.red}✗ Image not found at expected path${colors.reset}`);
  }

  // Summary
  const totalTests = validation.passed.length + validation.failed.length + validation.warnings.length + keyMessages.passed.length + keyMessages.failed.length;
  const totalPassed = validation.passed.length + keyMessages.passed.length + (imageCheck.exists ? 1 : 0);
  const totalFailed = validation.failed.length + keyMessages.failed.length + (imageCheck.exists ? 0 : 1);

  console.log(`\n${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Summary:${colors.reset}`);
  console.log(`  Total Checks: ${totalTests}`);
  console.log(`  ${colors.green}✓ Passed: ${totalPassed}${colors.reset}`);
  console.log(`  ${colors.yellow}⚠ Warnings: ${validation.warnings.length}${colors.reset}`);
  console.log(`  ${colors.red}✗ Failed: ${totalFailed}${colors.reset}`);

  const score = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1);
  console.log(`  ${colors.bright}Score: ${score}%${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

async function testEnvironment(name, url) {
  console.log(`${colors.blue}Fetching: ${url}${colors.reset}`);

  try {
    const html = await fetchHTML(url);
    const metaTags = extractMetaTags(html);
    const validation = validateMetaTags(metaTags, name);
    const keyMessages = validateKeyMessages(metaTags);
    const imageCheck = checkImageFile('/images/og-image.png');

    printResults(name, metaTags, validation, keyMessages, imageCheck);

    return {
      success: validation.failed.length === 0 && keyMessages.failed.length === 0,
      validation,
      keyMessages,
    };
  } catch (error) {
    console.log(`${colors.red}✗ Failed to fetch ${name}: ${error.message}${colors.reset}\n`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log(`╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║   CONTENTLYNK META TAGS VALIDATION SCRIPT                 ║`);
  console.log(`║   Testing Open Graph & Twitter Card Implementation        ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝`);
  console.log(`${colors.reset}`);

  const args = process.argv.slice(2);
  let testsToRun = Object.entries(TESTS);

  // Allow filtering by environment
  if (args.length > 0) {
    const filter = args[0].toLowerCase();
    testsToRun = testsToRun.filter(([name]) => name.toLowerCase().includes(filter));
  }

  if (testsToRun.length === 0) {
    console.log(`${colors.red}No matching environments found.${colors.reset}`);
    console.log(`Available: ${Object.keys(TESTS).join(', ')}`);
    process.exit(1);
  }

  const results = [];

  for (const [name, url] of testsToRun) {
    const result = await testEnvironment(name, url);
    results.push({ name, ...result });
  }

  // Final Summary
  console.log(`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}FINAL RESULTS${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  results.forEach(result => {
    const status = result.success ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`;
    console.log(`  ${result.name.padEnd(15)} ${status}`);
  });

  console.log('');

  // Next steps
  console.log(`${colors.bright}Next Steps:${colors.reset}`);
  console.log(`  1. Clear social media caches:`);
  console.log(`     ${colors.cyan}https://developers.facebook.com/tools/debug/${colors.reset}`);
  console.log(`     ${colors.cyan}https://cards-dev.twitter.com/validator${colors.reset}`);
  console.log(`     ${colors.cyan}https://www.linkedin.com/post-inspector/${colors.reset}`);
  console.log(`  2. Test a real share on each platform`);
  console.log(`  3. Monitor engagement metrics\n`);

  const allPassed = results.every(r => r.success);
  process.exit(allPassed ? 0 : 1);
}

main();
