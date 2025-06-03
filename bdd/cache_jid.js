require("dotenv").config();
const { Pool } = require("pg");
const s = require("../set");

const dbUrl = s.DB;
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

// Création de la table jid_lid
async function createJidLidTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS jid_lid (
        id serial PRIMARY KEY,
        jid text UNIQUE NOT NULL,
        lid text UNIQUE NOT NULL
      );
    `);
    console.log("Table 'jid_lid' créée ou déjà existante.");
  } catch (e) {
    console.error("Erreur création table jid_lid :", e);
  } finally {
    client.release();
  }
}

// Ajout ou mise à jour d'une paire jid <=> lid
async function upsertJidLid(jid, lid) {
  if (!jid || !lid) return false;
  const client = await pool.connect();
  try {
    // INSERT ... ON CONFLICT pour upsert
    const query = `
      INSERT INTO jid_lid (jid, lid) VALUES ($1, $2)
      ON CONFLICT (jid) DO UPDATE SET lid = EXCLUDED.lid
      RETURNING *;
    `;
    const res = await client.query(query, [jid, lid]);
    return res.rows[0];
  } catch (e) {
    console.error("Erreur upsert jid_lid :", e);
    return null;
  } finally {
    client.release();
  }
}

// Récupérer lid à partir de jid
async function getLidFromJid(jid) {
  if (!jid) return null;
  const client = await pool.connect();
  try {
    const query = `SELECT lid FROM jid_lid WHERE jid = $1`;
    const res = await client.query(query, [jid]);
    if (res.rows.length === 0) return null;
    return res.rows[0].lid;
  } catch (e) {
    console.error("Erreur getLidFromJid :", e);
    return null;
  } finally {
    client.release();
  }
}

// Récupérer jid à partir de lid
async function getJidFromLid(lid) {
  if (!lid) return null;
  const client = await pool.connect();
  try {
    const query = `SELECT jid FROM jid_lid WHERE lid = $1`;
    const res = await client.query(query, [lid]);
    if (res.rows.length === 0) return null;
    return res.rows[0].jid;
  } catch (e) {
    console.error("Erreur getJidFromLid :", e);
    return null;
  } finally {
    client.release();
  }
}

module.exports = {
  createJidLidTable,
  upsertJidLid,
  getLidFromJid,
  getJidFromLid,
};
