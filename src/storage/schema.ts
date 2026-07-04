// SQLite schema for durable local storage. One table per canonical entity so
// import metadata, row-level traceability, rules, and forecast assumptions are
// all queryable. Encryption is deferred to a later phase (ADR decision).

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY, bank TEXT, type TEXT, name TEXT, currency TEXT
);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY, name TEXT, behavior TEXT, parentId TEXT
);
CREATE TABLE IF NOT EXISTS category_rules (
  id TEXT PRIMARY KEY, pattern TEXT, isRegex INTEGER, priority INTEGER,
  targetCategoryId TEXT, merchant TEXT
);
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY, bank TEXT, accountId TEXT, fileName TEXT, importedAt TEXT,
  parserVersion TEXT, rowCount INTEGER, reportedBalanceCents INTEGER, reportedBalanceDate TEXT
);
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY, accountId TEXT, bank TEXT, bookingDate TEXT, valueDate TEXT,
  label TEXT, rawLabel TEXT, merchant TEXT, amountCents INTEGER, currency TEXT,
  categoryId TEXT, rowHash TEXT, importBatchId TEXT, transferGroupId TEXT
);
CREATE TABLE IF NOT EXISTS recurring_rules (
  id TEXT PRIMARY KEY, accountId TEXT, label TEXT, categoryId TEXT, amountCents INTEGER,
  cadence TEXT, startDate TEXT, endDate TEXT
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, accountId TEXT, date TEXT, label TEXT, amountCents INTEGER, categoryId TEXT
);
CREATE INDEX IF NOT EXISTS idx_tx_rowhash ON transactions(rowHash);
CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(accountId);
`;
