-- Suthra Punjab Beat QR Management - PostgreSQL schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS office_contacts (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name TEXT NOT NULL,
 phone TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('TM','FMO','Supervisor')),
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS office_contacts_role_idx ON office_contacts(role,is_active);

CREATE TABLE IF NOT EXISTS admin_users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name TEXT NOT NULL,
 email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL,
 role_label TEXT NOT NULL DEFAULT 'Operations Manager',
 permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beats (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 beat_number TEXT NOT NULL,
 union_council TEXT NOT NULL,
 tehsil TEXT NOT NULL,
 district TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active','Inactive')),
 map_url TEXT,
 assigned_vehicle TEXT,
 tm_contact_id UUID REFERENCES office_contacts(id) ON DELETE SET NULL,
 fmo_contact_id UUID REFERENCES office_contacts(id) ON DELETE SET NULL,
 supervisor_contact_id UUID REFERENCES office_contacts(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(beat_number,union_council,tehsil,district)
);

CREATE TABLE IF NOT EXISTS beat_workers (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
 full_name TEXT NOT NULL,
 photo_url TEXT,
 designation TEXT NOT NULL,
 shift TEXT NOT NULL,
 attendance_time TIME,
 sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS beat_workers_beat_idx ON beat_workers(beat_id,sort_order);

CREATE TABLE IF NOT EXISTS complaints (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
 beat_number TEXT NOT NULL,
 category TEXT NOT NULL,
 citizen_name TEXT NOT NULL,
 mobile TEXT NOT NULL,
 comments TEXT,
 photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
 status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','In Progress','Resolved','Rejected')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS complaints_created_idx ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS complaints_beat_idx ON complaints(beat_number);

CREATE TABLE IF NOT EXISTS feedback (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
 beat_number TEXT NOT NULL,
 rating SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 5),
 comments TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE,
 expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions(expires_at);
