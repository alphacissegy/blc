const { Pool } = require("pg");
const s = require("../set");

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
        "user" TEXT DEFAULT 'aucun',
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
async function getUserData(id) {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM myneo WHERE id = $1", [id]);
    return res.rows[0];
  } catch (err) {
    console.error("❌ Erreur récupération utilisateur:", err);
    return null;
  } finally {
    client.release();
  }
}

// 📌 Enregistrement d’un utilisateur (avec ou sans données personnalisées)
async function saveUser(id, data = {}) {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM myneo WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      return "⚠️ Ce joueur est déjà enregistré.";
    }

    const {
      user = "aucun",
      tel = id.replace("@s.whatsapp.net", ""),
      points_jeu = 0,
      nc = 0,
      np = 0,
      coupons = 0,
      gift_box = 0,
      all_stars = "aucun",
      blue_lock = "+Team⚽",
      elysium = "+ElysiumMe💠"
    } = data;

    await client.query(
      `INSERT INTO myneo 
        (id, user, tel, points_jeu, nc, np, coupons, gift_box, all_stars, blue_lock, elysium)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, user, tel, points_jeu, nc, np, coupons, gift_box, all_stars, blue_lock, elysium]
    );

    return "✅ Joueur enregistré avec succès.";
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement:", error);
    return "❌ Une erreur est survenue lors de l'enregistrement.";
  } finally {
    client.release();
  }
}

// 📌 Suppression d’un utilisateur
async function deleteUser(id) {
  const client = await pool.connect();
  try {
    const result = await client.query("DELETE FROM myneo WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount > 0) {
      return "✅ Joueur supprimé avec succès.";
    }
    return "⚠️ Joueur introuvable.";
  } catch (error) {
    console.error("❌ Erreur lors de la suppression:", error);
    return "❌ Une erreur est survenue lors de la suppression.";
  } finally {
    client.release();
  }
}

// 📌 Mise à jour des champs de l’utilisateur
async function updateUser(id, updates) {
  const client = await pool.connect();
  try {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    if (keys.length === 0) return "⚠️ Aucun champ à mettre à jour.";

    const setQuery = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");
    await client.query(`UPDATE myneo SET ${setQuery} WHERE id = $1`, [id, ...values]);

    return "✅ Données mises à jour avec succès.";
  } catch (error) {
    console.error("❌ Erreur mise à jour utilisateur:", error);
    return "❌ Une erreur est survenue lors de la mise à jour.";
  } finally {
    client.release();
  }
}

module.exports = {
  saveUser,
  deleteUser,
  updateUser,
  getUserData,
};
