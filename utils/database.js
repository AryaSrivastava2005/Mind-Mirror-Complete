const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const dbPath = process.env.DATA_FILE || path.join(__dirname, "..", "data", "db.json");
function readDatabase() {
  if (!fs.existsSync(dbPath)) writeDatabase({ users: [], results: [] });
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  if (!Array.isArray(db.users) || !Array.isArray(db.results)) throw new Error("Invalid database format");
  return db;
}
function writeDatabase(db) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const temp = dbPath + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(db, null, 2), { mode: 0o600 });
  fs.renameSync(temp, dbPath);
}
module.exports = { readDatabase, writeDatabase, createId: prefix => `${prefix}_${randomUUID()}` };
