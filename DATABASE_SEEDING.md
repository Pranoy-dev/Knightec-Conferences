# Database Seeding Guide

This guide explains how to add permanent database values (seed data) to Supabase.

## Methods for Adding Seed Data

### Method 1: SQL Editor (Quick & Simple) ✅ Recommended for Quick Setup

**Best for:** One-time setup, initial data population

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the SQL script
3. Click **Run** or press `Ctrl/Cmd + Enter`
4. Done!

**Example:**
```sql
INSERT INTO offices (name) VALUES
  ('Stockholm'),
  ('Gothenburg'),
  ('Malmö')
ON CONFLICT (name) DO NOTHING;
```

**Pros:**
- ✅ Fast and simple
- ✅ No additional setup needed
- ✅ Works immediately

**Cons:**
- ❌ Not version controlled
- ❌ Manual process
- ❌ Not repeatable across environments

---

### Method 2: Supabase Migrations (Best Practice) ✅ Recommended for Production

**Best for:** Version control, team collaboration, production deployments

#### Setup Supabase CLI (if not already installed):

```bash
npm install -g supabase
```

#### Initialize Supabase in your project:

```bash
cd knightecconf
supabase init
```

#### Link to your Supabase project:

```bash
supabase link --project-ref your-project-ref
```

#### Create a migration:

```bash
supabase migration new create_offices_table
```

This creates a file in `supabase/migrations/` with a timestamp.

#### Add your SQL to the migration file:

```sql
-- Create offices table
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert seed data
INSERT INTO offices (name) VALUES
  ('Stockholm'),
  ('Gothenburg'),
  ('Malmö')
ON CONFLICT (name) DO NOTHING;
```

#### Apply migration:

```bash
supabase db push
```

**Pros:**
- ✅ Version controlled (Git)
- ✅ Repeatable across environments
- ✅ Team collaboration
- ✅ Production-ready

**Cons:**
- ❌ Requires Supabase CLI setup
- ❌ More initial setup

---

### Method 3: Node.js Seed Scripts ✅ Recommended for Development

**Best for:** Development, testing, CI/CD pipelines

We've created seed scripts you can run:

```bash
# Seed offices
npm run seed-offices

# Seed categories
npm run populate-categories
```

**Pros:**
- ✅ Can be automated
- ✅ Easy to run multiple times
- ✅ Can be integrated into CI/CD
- ✅ Works with existing setup

**Cons:**
- ❌ Requires Node.js environment
- ❌ Not automatically run on deployment

---

## Recommended Approach

### For Initial Setup:
1. **Use SQL Editor** to quickly set up tables and initial data
2. Run the SQL scripts from `supabase-setup-offices.sql` and `scripts/populate-offices.sql`

### For Production/Team:
1. **Use Supabase Migrations** for version control
2. Store migration files in `supabase/migrations/`
3. Apply migrations using `supabase db push`

### For Development:
1. **Use seed scripts** (`npm run seed-offices`)
2. Can run multiple times safely
3. Easy to reset and re-seed

---

## Files Available

- `supabase-setup-offices.sql` - Creates offices table
- `scripts/populate-offices.sql` - SQL to populate offices
- `scripts/seed-offices.js` - Node.js script to seed offices
- `supabase/migrations/001_create_offices_table.sql` - Migration file (if using migrations)

---

## Important Notes

1. **ON CONFLICT DO NOTHING**: All seed scripts use `ON CONFLICT (name) DO NOTHING` to prevent duplicates
2. **Idempotent**: You can run seed scripts multiple times safely
3. **Unique Constraint**: Office names must be unique (enforced by database)
4. **Row Level Security**: Make sure RLS policies allow inserts

---

## Quick Start (SQL Editor Method)

1. Open Supabase Dashboard → SQL Editor
2. Run `supabase-setup-offices.sql` (creates table)
3. Run `scripts/populate-offices.sql` (adds offices)
4. Done! ✅
