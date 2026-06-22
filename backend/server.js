require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 4000;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data.sqlite');
const SCORE_SALT = process.env.SCORE_SALT || 'synapse-local-salt';

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to open DB', err);
  } else {
    console.log('Connected to SQLite DB:', DB_FILE);
  }
});

// Initialize a small table to be able to report a row count
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)`);
  db.run(`INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)`, ['created_at', new Date().toISOString()]);
  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      score INTEGER NOT NULL,
      playtime REAL NOT NULL,
      deflects INTEGER NOT NULL,
      nutrients INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  // Add level column to existing table if missing. Ignore error if it already exists.
  db.run(`ALTER TABLE leaderboard ADD COLUMN level INTEGER NOT NULL DEFAULT 1`, () => {});
});

function normalizeName(name) {
  const normalized = String(name || 'Pilot').trim().replace(/\s+/g, ' ').slice(0, 18);
  return normalized || 'Pilot';
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function scoreHash({ name, level, score, playtime, deflects, nutrients }) {
  return crypto
    .createHash('sha256')
    .update(`${name}:${level}:${score}:${playtime.toFixed(2)}:${deflects}:${nutrients}:${SCORE_SALT}`)
    .digest('hex');
}

function validateScore(body) {
  const name = normalizeName(body.name);
  const level = Math.floor(toNumber(body.level || 1));
  const score = Math.floor(toNumber(body.score));
  const playtime = toNumber(body.playtime);
  const deflects = Math.floor(toNumber(body.deflects));
  const nutrients = Math.floor(toNumber(body.nutrients));
  const hash = String(body.hash || '');

  if (
    !Number.isFinite(level) ||
    !Number.isFinite(score) ||
    !Number.isFinite(playtime) ||
    !Number.isFinite(deflects) ||
    !Number.isFinite(nutrients)
  ) {
    return { ok: false, error: 'Invalid numeric score payload.' };
  }

  if (level < 1 || level > 4 || score < 0 || playtime < 1 || deflects < 0 || nutrients < 0) {
    return { ok: false, error: 'Score payload is outside accepted bounds.' };
  }

  const expectedHash = scoreHash({ name, level, score, playtime, deflects, nutrients });
  if (hash !== expectedHash) {
    return { ok: false, error: 'Score hash mismatch.' };
  }

  const plausibleMax = 650 + playtime * 95 + deflects * 120 + nutrients * 90;
  if (score > plausibleMax) {
    return { ok: false, error: 'Score is not plausible for submitted playtime.' };
  }

  return { ok: true, entry: { name, level, score, playtime, deflects, nutrients } };
}

function rowToEntry(row) {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    score: row.score,
    playtime: row.playtime,
    deflects: row.deflects,
    nutrients: row.nutrients,
    createdAt: row.created_at
  };
}

app.get('/status', (req, res) => {
  db.get('SELECT COUNT(*) AS count FROM leaderboard', (err, row) => {
    const dbInfo = {
      connected: !err,
      rows: row ? row.count : 0,
      file: DB_FILE
    };
    if (err) {
      return res.status(500).json({ status: 'error', error: err.message, db: dbInfo });
    }
    res.json({ status: 'ok', db: dbInfo });
  });
});

app.get('/leaderboard', (req, res) => {
  const level = Number(req.query.level) || 1;
  db.all(
    `SELECT id, name, level, score, playtime, deflects, nutrients, created_at
     FROM leaderboard
     WHERE level = ?
     ORDER BY score DESC, playtime DESC, id ASC
     LIMIT 10`,
    [level],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ leaderboard: rows.map(rowToEntry) });
    }
  );
});

app.post('/leaderboard', (req, res) => {
  const validation = validateScore(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  const entry = validation.entry;
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO leaderboard (name, level, score, playtime, deflects, nutrients, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [entry.name, entry.level, entry.score, entry.playtime, entry.deflects, entry.nutrients, createdAt],
    function insertScore(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        entry: rowToEntry({
          id: this.lastID,
          ...entry,
          created_at: createdAt
        })
      });
    }
  );
});

app.get('/', (req, res) => res.json({ message: 'Hello from backend' }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
