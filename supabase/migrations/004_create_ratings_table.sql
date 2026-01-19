-- Create ratings table
-- This table stores ratings for conferences (one-to-one relationship)

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID NOT NULL UNIQUE REFERENCES conferences(id) ON DELETE CASCADE,
  accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  skill_improvement_rating INTEGER CHECK (skill_improvement_rating >= 1 AND skill_improvement_rating <= 5),
  finding_partners_rating INTEGER CHECK (finding_partners_rating >= 1 AND finding_partners_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ratings_conference_id ON ratings(conference_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ratings ON ratings(accessibility_rating, skill_improvement_rating, finding_partners_rating) 
WHERE accessibility_rating IS NOT NULL OR skill_improvement_rating IS NOT NULL OR finding_partners_rating IS NOT NULL;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (drop first if exists)
DROP POLICY IF EXISTS "Allow all operations on ratings" ON ratings;
CREATE POLICY "Allow all operations on ratings" ON ratings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add reason_to_go column to conferences table (this stays in conferences)
ALTER TABLE conferences
ADD COLUMN IF NOT EXISTS reason_to_go TEXT;
