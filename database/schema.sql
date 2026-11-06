-- Suthra Punjab Beat QR database schema (Neon/PostgreSQL)
-- Apply this file to the Neon database before switching the app to shared storage.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_number TEXT NOT NULL,
  union_council TEXT NOT NULL,
  tehsil TEXT NOT NULL,
  district TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  map_url TEXT,
  workers JSONB NOT NULL DEFAULT '[]'::jsonb,
  vehicle TEXT,
  tm_name TEXT,
  tm_phone TEXT,
  fmo_name TEXT,
  fmo_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS beats_identity_unique
  ON beats (LOWER(beat_number), LOWER(union_council), LOWER(tehsil), LOWER(district));

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
  beat_number TEXT NOT NULL,
  category TEXT NOT NULL,
  citizen_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  comments TEXT,
  photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Resolved','Rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS complaints_beat_number_idx ON complaints(beat_number);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
  beat_number TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at DESC);
