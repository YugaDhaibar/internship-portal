const Database = require("better-sqlite3");

const db = new Database("internship.db");

// Create internships table
db.exec(`
    CREATE TABLE IF NOT EXISTS internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT NOT NULL,
        stipend INTEGER DEFAULT 0,
        duration TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = db;