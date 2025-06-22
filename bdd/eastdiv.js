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

const colonnesJoueur = {
  pseudo: "e1",
  division: "e2",
  classe: "e3",
  rang: "e4",
  golds: "e5",
  neocoins: "e6",
  gift_box: "e7",
  coupons: "e8",
  np: "e9",
  talent: "e10",
  victoires: "e12",
  defaites: "e13",
  trophees: "e14",
  tos: "e15",
  awards: "e16",
  cards: "e17",
  globes: "e22",
  pos: "e23",
  talent2: "e24",
  force: "e25",
  close_combat: "e26",
  precision: "e27",
  speed: "e28"
};

async function renameColumns() {
  const client = await pool.connect();
  try {
    for (const [newName, oldName] of Object.entries(colonnesJoueur)) {
      const query = `ALTER TABLE eastdiv RENAME COLUMN ${oldName} TO ${newName};`;
      try {
        await client.query(query);
        console.log(`✅ ${oldName} renommé en ${newName}`);
      } catch (err) {
        console.warn(`⚠️ Impossible de renommer ${oldName} en ${newName} : ${err.message}`);
      }
    }
  } finally {
    client.release();
  }
}

renameColumns();
