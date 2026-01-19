-- Populate offices for technology consultant organization
-- Run this script in your Supabase SQL Editor

-- Insert common offices (adjust based on your organization)
INSERT INTO offices (name) VALUES
  ('Stockholm'),
  ('Gothenburg'),
  ('Malmö'),
  ('Umeå'),
  ('Linköping'),
  ('Lund'),
  ('Uppsala'),
  ('Örebro'),
  ('Västerås'),
  ('Helsingborg'),
  ('Jönköping'),
  ('Norrköping'),
  ('Luleå'),
  ('Borås'),
  ('Sundsvall'),
  ('Gävle'),
  ('Östersund'),
  ('Karlstad'),
  ('Skellefteå'),
  ('Kristianstad')
ON CONFLICT (name) DO NOTHING;
