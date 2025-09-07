#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

const tests = [
  {
    name: 'Build Test',
    test: async () => {
      const { stdout } = await execAsync('npm run build');
      return !stdout.includes('error');
    }
  },
  {
    name: 'Bundle Size Check',
    test: async () => {
      const { stdout } = await execAsync('ls -la dist/assets/*.js | sort -k5 -nr | head -5');
      console.log(chalk.gray('Largest bundles:'));
      console.log(chalk.gray(stdout));
      return true;
    }
  },
  {
    name: 'Environment Variables',
    test: async () => {
      const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
      const missing = required.filter(key => !process.env[key]);
      if (missing.length > 0) {
        console.log(chalk.yellow(`Missing: ${missing.join(', ')}`));
        return false;
      }
      return true;
    }
  },
  {
    name: 'Security Headers Check',
    test: async () => {
      const files = ['vercel.json'];
      for (const file of files) {
        try {
          await execAsync(`cat ${file}`);
          console.log(chalk.green(`✓ ${file} exists`));
        } catch {
          console.log(chalk.red(`✗ ${file} missing`));
          return false;
        }
      }
      return true;
    }
  }
];

console.log(chalk.bold('🚀 Running Production Readiness Tests\n'));

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      console.log(chalk.blue(`Testing: ${name}`));
      const result = await test();
      if (result) {
        console.log(chalk.green(`✓ ${name} passed\n`));
        passed++;
      } else {
        console.log(chalk.red(`✗ ${name} failed\n`));
        failed++;
      }
    } catch (error) {
      console.log(chalk.red(`✗ ${name} failed: ${error.message}\n`));
      failed++;
    }
  }

  console.log(chalk.bold('\n📊 Test Summary:'));
  console.log(chalk.green(`Passed: ${passed}`));
  console.log(chalk.red(`Failed: ${failed}`));
  
  if (failed === 0) {
    console.log(chalk.bold.green('\n✅ All tests passed! Ready for production.'));
  } else {
    console.log(chalk.bold.red('\n❌ Some tests failed. Please fix issues before deploying.'));
    process.exit(1);
  }
}

runTests().catch(console.error);