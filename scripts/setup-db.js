#!/usr/bin/env node

/**
 * Setup script to create database tables in Supabase
 * 
 * Option 1: Using psql (recommended)
 *   export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'
 *   node scripts/setup-db.js
 * 
 * Option 2: Manual setup
 *   node scripts/setup-db.js
 *   (Will show you the SQL to run in Supabase dashboard)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read SQL file
const sqlPath = path.join(__dirname, '../supabase-setup.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

function checkPsql() {
  try {
    execSync('which psql', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function setupWithPsql() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('❌ DATABASE_URL not set\n');
    console.log('To use psql, set the DATABASE_URL environment variable:');
    console.log('  export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"');
    console.log('\nGet your connection string from:');
    console.log('  Supabase Dashboard → Settings → Database → Connection string\n');
    return false;
  }

  try {
    console.log('🚀 Setting up database using psql...\n');
    execSync(`psql "${dbUrl}" -f "${sqlPath}"`, { stdio: 'inherit' });
    console.log('\n✅ Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Error running psql:', error.message);
    return false;
  }
}

function showManualInstructions() {
  console.log('📋 SQL to run in Supabase Dashboard:\n');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
  console.log('\n📍 Steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Click "SQL Editor" in the left sidebar');
  console.log('4. Click "New query"');
  console.log('5. Paste the SQL above');
  console.log('6. Click "Run" (or press Cmd/Ctrl + Enter)\n');
  console.log('💡 Tip: Install PostgreSQL client to automate this:');
  console.log('   macOS: brew install postgresql');
  console.log('   Then: export DATABASE_URL="your-connection-string"');
  console.log('   Then: node scripts/setup-db.js\n');
}

// Main execution
console.log('🔧 Supabase Database Setup\n');

const hasPsql = checkPsql();
const hasDbUrl = !!process.env.DATABASE_URL;

if (hasPsql && hasDbUrl) {
  const success = setupWithPsql();
  if (!success) {
    showManualInstructions();
  }
} else {
  if (hasPsql && !hasDbUrl) {
    console.log('💡 psql is available but DATABASE_URL is not set.\n');
  } else if (!hasPsql) {
    console.log('💡 psql not found. Showing manual setup instructions.\n');
  }
  showManualInstructions();
}
