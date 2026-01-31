#!/usr/bin/env node

/**
 * Simple test script to verify npmrtdb installation
 */

import { execSync } from 'child_process';

console.log('🧪 Testing npmrtdb installation...\n');

const tests = [
  {
    name: 'npmrtdb help',
    cmd: 'node bin/npmrtdb.js --help',
    expectContains: 'npmrtdb - Multi-host NPM wrapper',
  },
  {
    name: 'npmxrtdb help',
    cmd: 'node bin/npmxrtdb.js --help',
    expectContains: 'npmxrtdb - Multi-host NPX wrapper',
  },
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  process.stdout.write(`Testing: ${test.name}... `);
  
  try {
    const output = execSync(test.cmd, { encoding: 'utf8' });
    
    if (test.expectContains && !output.includes(test.expectContains)) {
      console.log('❌ FAILED');
      console.log(`  Expected output to contain: "${test.expectContains}"`);
      failed++;
    } else {
      console.log('✅ PASSED');
      passed++;
    }
  } catch (err) {
    console.log('❌ FAILED');
    console.log(`  Error: ${err.message}`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}
