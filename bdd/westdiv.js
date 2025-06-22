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

  const divisions = ['westdiv', 'northdiv', 'centraldiv', 'eastdiv'];
  for (const tableName of divisions) {
    await transferDivisionToAllStars(tableName);
  }
}
