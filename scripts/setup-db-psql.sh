#!/bin/bash

# Setup script using psql (PostgreSQL client)
# This requires the database connection string from Supabase
# 
# Get it from: Supabase Dashboard → Settings → Database → Connection string
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/../supabase-setup.sql"

echo "🚀 Setting up Supabase database tables using psql..."
echo ""

# Check if connection string is provided
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo ""
  echo "Usage:"
  echo "  export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'"
  echo "  ./scripts/setup-db-psql.sh"
  echo ""
  echo "Get your connection string from:"
  echo "  Supabase Dashboard → Settings → Database → Connection string"
  exit 1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  echo "❌ Error: psql is not installed"
  echo ""
  echo "Install PostgreSQL client:"
  echo "  macOS: brew install postgresql"
  echo "  Ubuntu: sudo apt-get install postgresql-client"
  exit 1
fi

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Error: SQL file not found at $SQL_FILE"
  exit 1
fi

echo "📋 Running SQL script..."
psql "$DATABASE_URL" -f "$SQL_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Database setup completed successfully!"
  echo ""
  echo "You can now use the app to add people and conferences."
else
  echo ""
  echo "❌ Error: Database setup failed"
  exit 1
fi
