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
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'allstars_divs_fiches' AND column_name = 'id'
    `;

    const result = await pool.query(checkColumnSQL);

    if (result.rowCount === 0) {
      console.log("➕ Colonne 'id' absente. Ajout en cours...");

      // Étapes : 1. ajouter la colonne, 2. remplir avec une séquence, 3. définir comme clé primaire
      await pool.query(`
        ALTER TABLE allstars_divs_fiches ADD COLUMN id INTEGER;
      `);

      await pool.query(`
        UPDATE allstars_divs_fiches
        SET id = row_number() OVER ();
      `);

      await pool.query(`
        ALTER TABLE allstars_divs_fiches
        ADD PRIMARY KEY (id);
      `);

      await pool.query(`
        CREATE SEQUENCE allstars_divs_fiches_id_seq START WITH 1 OWNED BY allstars_divs_fiches.id;
      `);

      await pool.query(`
        ALTER TABLE allstars_divs_fiches
        ALTER COLUMN id SET DEFAULT nextval('allstars_divs_fiches_id_seq');
      `);

      console.log("✅ Colonne 'id' ajoutée avec succès et initialisée.");
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
