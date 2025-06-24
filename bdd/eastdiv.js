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

      // 1. Ajouter la colonne id
      await pool.query(`
        ALTER TABLE allstars_divs_fiches ADD COLUMN id INTEGER;
      `);

      // 2. Assigner des ID uniques avec row_number
      await pool.query(`
        WITH numbered AS (
          SELECT ctid, ROW_NUMBER() OVER () AS rn
          FROM allstars_divs_fiches
        )
        UPDATE allstars_divs_fiches
        SET id = numbered.rn
        FROM numbered
        WHERE allstars_divs_fiches.ctid = numbered.ctid;
      `);

      // 3. Définir la colonne comme PRIMARY KEY
      await pool.query(`
        ALTER TABLE allstars_divs_fiches ADD PRIMARY KEY (id);
      `);

      // 4. Créer une séquence
      await pool.query(`
        CREATE SEQUENCE allstars_divs_fiches_id_seq START WITH 1 OWNED BY allstars_divs_fiches.id;
      `);

      // 5. Attacher la séquence à la colonne id
      await pool.query(`
        ALTER TABLE allstars_divs_fiches
        ALTER COLUMN id SET DEFAULT nextval('allstars_divs_fiches_id_seq');
      `);

      console.log("✅ Colonne 'id' ajoutée et initialisée avec succès !");
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
