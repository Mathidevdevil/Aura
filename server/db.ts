import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'aura.db');
export const db = new Database(dbPath);

// Enable WAL mode and foreign keys for performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      email_verified_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS oauth_identities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      provider_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(provider, provider_user_id)
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      family_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      is_revoked INTEGER NOT NULL DEFAULT 0,
      user_agent TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL, -- 'verify' | 'reset'
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event_type TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_refresh_family ON refresh_tokens(family_id);
    CREATE INDEX IF NOT EXISTS idx_email_token_hash ON email_tokens(token_hash);
  `);

  // Seed default demo user for seamless local testing
  const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@aura.local');
  if (!demoUser) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, status, email_verified_at, created_at)
      VALUES (?, ?, ?, ?, 'active', ?, ?)
    `).run(
      'user-demo-seed-001',
      'demo@aura.local',
      '$argon2id$v=19$m=65536,t=3,p=1$NcqgIHf2JQFBSiEI/F4bQw$Og8MeYFU4knIFpHyYRhrzfA92LWlLzDwLnT47hja1ko',
      'Mathi',
      new Date().toISOString(),
      new Date().toISOString()
    );
  }
}
