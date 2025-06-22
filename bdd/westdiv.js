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

async function createAllStarsDivsFichesTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS allstars_divs_fiches (
        id SERIAL PRIMARY KEY,
        pseudo TEXT DEFAULT 'aucun',
        division TEXT DEFAULT 'aucun',
        classe TEXT DEFAULT 'aucun',
        rang TEXT DEFAULT 'aucun',
        golds INTEGER DEFAULT 0,
        neocoins INTEGER DEFAULT 0,
        gift_box INTEGER DEFAULT 0,
        coupons INTEGER DEFAULT 0,
        np INTEGER DEFAULT 0,
        talent INTEGER DEFAULT 0,
        talent2 INTEGER DEFAULT 0,
        victoires INTEGER DEFAULT 0,
        defaites INTEGER DEFAULT 0,
        trophees INTEGER DEFAULT 0,
        tos INTEGER DEFAULT 0,
        awards INTEGER DEFAULT 0,
        cards TEXT DEFAULT 'aucun',
        globes INTEGER DEFAULT 0,
        pos TEXT DEFAULT 'aucun',
        force INTEGER DEFAULT 0,
        close_combat INTEGER DEFAULT 0,
        precision INTEGER DEFAULT 0,
        speed INTEGER DEFAULT 0,
        source TEXT DEFAULT 'inconnu'
      );
    `);
    console.log("✅ Table allstars_divs_fiches créée avec succès");
  } catch (error) {
    console.error("❌ Erreur création allstars_divs_fiches :", error);
  } finally {
    client.release();
  }
}

async function transferDivisionToAllStars(tableSourceName) {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM ${tableSourceName}`);
    const rows = res.rows;
    let inserted = 0;

    for (const row of rows) {
      const {
        pseudo, division, classe, rang, golds,
        neocoins, gift_box, coupons, np, talent,
        talent2, victoires, defaites, trophees,
        tos, awards, cards, globes, pos, force,
        close_combat, precision, speed
      } = row;

      const hasNonDefault = [
        pseudo, division, classe, rang, cards, pos
      ].some(val => val !== 'aucun') ||
      [
        golds, neocoins, gift_box, coupons, np,
        talent, talent2, victoires, defaites, trophees,
        tos, awards, globes, force, close_combat,
        precision, speed
      ].some(val => val !== 0);

      if (!hasNonDefault) continue;

      await client.query(`
        INSERT INTO allstars_divs_fiches (
          pseudo, division, classe, rang, golds,
          neocoins, gift_box, coupons, np, talent,
          talent2, victoires, defaites, trophees,
          tos, awards, cards, globes, pos, force,
          close_combat, precision, speed, source
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24
        )
      `, [
        pseudo, division, classe, rang, golds,
        neocoins, gift_box, coupons, np, talent,
        talent2, victoires, defaites, trophees,
        tos, awards, cards, globes, pos, force,
        close_combat, precision, speed, tableSourceName
      ]);

      inserted++;
    }

    console.log(`✅ ${inserted} ligne(s) insérées depuis ${tableSourceName}`);
  } catch (error) {
    console.error(`❌ Erreur lors du transfert depuis ${tableSourceName}:`, error.message);
  } finally {
    client.release();
  }
}

async function transferAllDivisions() {
await createAllStarsDivsFichesTable(); // s'assure que la table existe

  const divisions = ['westdiv', 'northdiv', 'centraldiv', 'eastdiv'];
  for (const tableName of divisions) {
    await transferDivisionToAllStars(tableName);
  }
}

transferAllDivisions();
