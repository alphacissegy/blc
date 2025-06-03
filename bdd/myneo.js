const { Pool } = require("pg");
const s = require("../set");
const { getJidFromLid } = require("./cache_jid");

const pool = new Pool({
  connectionString: s.DB,
  ssl: { rejectUnauthorized: false },
});

// 📌 Création de la table `myneo`
async function createTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS myneo (
        id TEXT PRIMARY KEY,
        users TEXT DEFAULT 'aucun',
        tel TEXT DEFAULT 'aucun',
        points_jeu INTEGER DEFAULT 0,
        nc INTEGER DEFAULT 0,
        np INTEGER DEFAULT 0,
        coupons INTEGER DEFAULT 0,
        gift_box INTEGER DEFAULT 0,
        all_stars TEXT DEFAULT 'aucun',
        blue_lock TEXT DEFAULT '+Team⚽',
        elysium TEXT DEFAULT '+ElysiumMe💠'
      );
    `);
    console.log("✅ Table 'myneo' créée avec succès");
  } catch (error) {
    console.error("❌ Erreur création table:", error);
  } finally {
    client.release();
  }
}
createTable();

// 📌 Obtenir les données d’un utilisateur
async function getUserData(lid) {
  try {
    const jid = await getJidFromLid(lid);
    if (!jid) return null;

    const client = await pool.connect();
    const res = await client.query("SELECT * FROM myneo WHERE id = $1", [jid]);
    client.release();
    return res.rows[0] || null;
  } catch (error) {
    console.error("❌ Erreur récupération utilisateur:", error);
    return null;
  }
}

// 📌 Enregistrement d’un utilisateur (avec ou sans données personnalisées)
async function saveUser(lid, data = {}) {
  try {
    // 1. Récupérer le jid depuis lid
    const jid = await getJidFromLid(lid);
    if (!jid) {
      return `❌ Impossible de trouver le jid pour le lid : ${lid}`;
    }

    // 2. Connexion à la BDD
    const client = await pool.connect();

    // 3. Vérifier si l'utilisateur existe déjà
    const existing = await client.query("SELECT * FROM myneo WHERE id = $1", [jid]);
    if (existing.rows.length > 0) {
      client.release();
      return "⚠️ Ce joueur est déjà enregistré.";
    }

    // 4. Extraire les valeurs avec fallback
    const {
      users = "aucun",
      tel = jid.replace("@s.whatsapp.net", ""),
      points_jeu = 0,
      nc = 0,
      np = 0,
      coupons = 0,
      gift_box = 0,
      all_stars = "aucun",
      blue_lock = "+Team⚽",
      elysium = "+ElysiumMe💠"
    } = data;

    // 5. Insert dans la table
    await client.query(
      `INSERT INTO myneo
        (id, users, tel, points_jeu, nc, np, coupons, gift_box, all_stars, blue_lock, elysium)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [jid, users, tel, points_jeu, nc, np, coupons, gift_box, all_stars, blue_lock, elysium]
    );

    client.release();
    return "✅ Joueur enregistré avec succès.";
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement:", error);
    return "❌ Une erreur est survenue lors de l'enregistrement.";
  }
}
// 📌 Suppression d’un utilisateur
async function deleteUser(lid) {
  try {
    const jid = await getJidFromLid(lid);
    if (!jid) return "❌ Lid non trouvé.";

    const client = await pool.connect();
    const result = await client.query("DELETE FROM myneo WHERE id = $1 RETURNING *", [jid]);
    client.release();

    if (result.rowCount > 0) {
      return "✅ Joueur supprimé avec succès.";
    }
    return "⚠️ Joueur introuvable.";
  } catch (error) {
    console.error("❌ Erreur lors de la suppression:", error);
    return "❌ Une erreur est survenue lors de la suppression.";
  }
}

// 📌 Mise à jour des champs de l’utilisateur
async function updateUser(lid, updates) {
  try {
    const jid = await getJidFromLid(lid);
    if (!jid) return "❌ Lid non trouvé.";

    const client = await pool.connect();
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    if (keys.length === 0) {
      client.release();
      return "⚠️ Aucun champ à mettre à jour.";
    }

    const setQuery = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");
    await client.query(`UPDATE myneo SET ${setQuery} WHERE id = $1`, [jid, ...values]);

    client.release();
    return "✅ Données mises à jour avec succès.";
  } catch (error) {
    console.error("❌ Erreur mise à jour utilisateur:", error);
    return "❌ Une erreur est survenue lors de la mise à jour.";
  }
}

module.exports = {
  saveUser,
  deleteUser,
  updateUser,
  getUserData,
};
