#!/usr/bin/env node

console.log('🔍 Verifying BakerLink Development Setup...\n');

const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: 'Frontend package.json',
    check: () => fs.existsSync('./package.json'),
    message: '✅ Frontend package.json exists'
  },
  {
    name: 'Backend directory',
    check: () => fs.existsSync('./backend'),
    message: '✅ Backend directory exists'
  },
  {
    name: 'Backend package.json',
    check: () => fs.existsSync('./backend/package.json'),
    message: '✅ Backend package.json exists'
  },
  {
    name: 'Frontend .env',
    check: () => fs.existsSync('./.env'),
    message: '✅ Frontend .env exists'
  },
  {
    name: 'Backend .env',
    check: () => fs.existsSync('./backend/.env'),
    message: '✅ Backend .env exists'
  },
  {
    name: 'Prisma schema',
    check: () => fs.existsSync('./backend/prisma/schema.prisma'),
    message: '✅ Prisma schema exists'
  },
  {
    name: 'Express client',
    check: () => fs.existsSync('./src/lib/express-client/index.js'),
    message: '✅ Express client exists'
  },
  {
    name: 'Base44 SDK removed',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      return !packageJson.dependencies['@base44/sdk'];
    },
    message: '✅ Base44 SDK dependency removed'
  },
  {
    name: 'Frontend node_modules',
    check: () => fs.existsSync('./node_modules'),
    message: '✅ Frontend dependencies installed'
  },
  {
    name: 'Backend node_modules',
    check: () => fs.existsSync('./backend/node_modules'),
    message: '✅ Backend dependencies installed'
  },
  {
    name: 'Prisma client',
    check: () => fs.existsSync('./backend/node_modules/@prisma/client'),
    message: '✅ Prisma client generated'
  }
];

let allPassed = true;

checks.forEach(({ name, check, message }) => {
  try {
    if (check()) {
      console.log(message);
    } else {
      console.log(`❌ ${name} - FAILED`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${name} - ERROR: ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 ALL CHECKS PASSED!\n');
  console.log('Your BakerLink development environment is ready!');
  console.log('\nNext steps:');
  console.log('1. Create PostgreSQL database: createdb bakerlink');
  console.log('2. Setup database: npm run db:setup');
  console.log('3. Start development: npm run dev:full');
  console.log('\nThen visit: http://localhost:3000');
} else {
  console.log('❌ Some checks failed. Please review the issues above.');
  process.exit(1);
}

console.log('\n' + '='.repeat(50));