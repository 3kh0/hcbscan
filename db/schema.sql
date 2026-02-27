CREATE TABLE IF NOT EXISTS "hcb.hackclub.com" (
  "Organization ID" TEXT PRIMARY KEY,
  "Name" TEXT,
  "Slug" TEXT,
  "Category" TEXT,
  "Balance" BIGINT DEFAULT 0,
  "Added" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orgs_name ON "hcb.hackclub.com" ("Name");
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON "hcb.hackclub.com" ("Slug");

CREATE TABLE IF NOT EXISTS "hcb.hackclub.com-users" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "avatar" TEXT,
  "orgs" JSONB
);

CREATE INDEX IF NOT EXISTS idx_users_name ON "hcb.hackclub.com-users" ("name");

CREATE TABLE IF NOT EXISTS "hcb.hackclub.com-acts" (
  "Activity ID" TEXT PRIMARY KEY,
  "Key" TEXT,
  "Created At" TIMESTAMPTZ,
  "User ID" TEXT,
  "User Name" TEXT,
  "User Photo" TEXT,
  "Organization ID" TEXT,
  "Organization Name" TEXT,
  "Organization Logo" TEXT,
  "Last Updated" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_acts_created_at ON "hcb.hackclub.com-acts" ("Created At" DESC);
CREATE INDEX IF NOT EXISTS idx_acts_org_id ON "hcb.hackclub.com-acts" ("Organization ID");
CREATE INDEX IF NOT EXISTS idx_acts_user_id ON "hcb.hackclub.com-acts" ("User ID");

CREATE TABLE IF NOT EXISTS "status-check" (
  "item" INTEGER PRIMARY KEY,
  "online" BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_status_item ON "status-check" ("item");

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_rw') THEN
    CREATE ROLE app_rw WITH LOGIN;
  END IF;
END
$$;

-- grant perms
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO app_rw', current_database());
END
$$;
GRANT USAGE ON SCHEMA public TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;
