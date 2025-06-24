const { Pool } = require("pg");
const s = require("../set");

const dbUrl = s.DB;

const proConfig = {
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
};

const pool = new Pool(proConfig);

async function addSerialPrimaryKey() {
  try {
    const checkColumnSQL = `
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'allstars_divs_fiches' AND column_name = 'id'
    `;

    const result = await pool.query(checkColumnSQL);
    if (result.rowCount === 0) {
      console.log("➕ Colonne 'id' absente. Ajout en cours...");

      // Étape 1 : Ajouter colonne sans clé primaire
      await pool.query(`ALTER TABLE allstars_divs_fiches ADD COLUMN id SERIAL;`);

      // Étape 2 : Définir comme PRIMARY KEY si pas déjà défini
      await pool.query(`ALTER TABLE allstars_divs_fiches ADD PRIMARY KEY (id);`);

      console.log("✅ Colonne 'id' ajoutée avec succès comme PRIMARY KEY.");
    } else {
      console.log("✅ Colonne 'id' existe déjà.");
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'ajout de la colonne id :", err.message);
  } finally {
    await pool.end();
  }
}

addSerialPrimaryKey();
