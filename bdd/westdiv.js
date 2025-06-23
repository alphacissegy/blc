const { Pool } = require("pg");
const s = require("../set");

const dbUrl = s.DB;

const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(proConfig);

async function deleteIdsFrom44() {
  const client = await pool.connect();
  try {
    const res = await client.query("DELETE FROM allstars_divs_fiches WHERE id >= 44");
    console.log(`✅ Suppression réussie : ${res.rowCount} ligne(s) supprimée(s).`);
  } catch (err) {
    console.error("❌ Erreur lors de la suppression :", err);
  } finally {
    client.release();
  }
}

// Appel de la fonction
deleteIdsFrom44();
