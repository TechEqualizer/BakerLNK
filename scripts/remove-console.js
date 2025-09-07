#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const srcDir = './src';
const excludeDirs = ['node_modules', 'utils'];
const excludeFiles = ['logger.js'];

async function processFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    const originalContent = content;
    
    // Skip if it imports logger
    if (content.includes('import { logger }') || content.includes('logger.js')) {
      return { path: filePath, changed: false };
    }
    
    // Remove console.log statements (but keep warn and error)
    content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
    content = content.replace(/console\.info\([^)]*\);?\s*/g, '');
    content = content.replace(/console\.debug\([^)]*\);?\s*/g, '');
    
    if (content !== originalContent) {
      await writeFile(filePath, content);
      return { path: filePath, changed: true };
    }
    
    return { path: filePath, changed: false };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { path: filePath, error: error.message };
  }
}

async function processDirectory(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
      results.push(...await processDirectory(fullPath));
    } else if (entry.isFile() && 
               (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) &&
               !excludeFiles.includes(entry.name)) {
      results.push(await processFile(fullPath));
    }
  }
  
  return results;
}

console.log('🧹 Removing console statements from production code...\n');

processDirectory(srcDir).then(results => {
  const changed = results.filter(r => r.changed);
  const errors = results.filter(r => r.error);
  
  if (changed.length > 0) {
    console.log('✅ Modified files:');
    changed.forEach(r => console.log(`   - ${r.path}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(r => console.log(`   - ${r.path}: ${r.error}`));
  }
  
  console.log(`\n📊 Summary: ${changed.length} files modified, ${errors.length} errors`);
});