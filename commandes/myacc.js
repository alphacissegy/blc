const { zokou } = require("../framework/zokou");
const { saveUser, deleteUser, getUserData, updatePlayers, updateStats, resetStats } = require("../bdd/lineup_db");

zokou(
  {
    nomCom: "lineup⚽",
    categorie: "Gestion",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, auteurMessage } = commandeOptions;
    const userId = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`) || auteurMessage;
    const data = await getUserData(userId);
    if (!data) return repondre("⚠️ Joueur introuvable.");

    if (arg.length <= 1) {
      await zk.sendMessage(dest, { 
            video: { url: "https://files.catbox.moe/z64kuq.mp4" }, 
            caption: "",
            gifPlayback: true 
        });
      const lineup = `░░ *👥SQUAD⚽🥅*: ${data.nom}
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▱▱▱▱
1  👤(AG) ${data.joueur1} : ${data.stat1}%🫀
2  👤(AC) ${data.joueur2} : ${data.stat2}%🫀
3  👤(AD) ${data.joueur3} : ${data.stat3}%🫀
4  👤(MG) ${data.joueur4} : ${data.stat4}%🫀
5  👤(MC) ${data.joueur5} : ${data.stat5}%🫀
6  👤(MD) ${data.joueur6} : ${data.stat6}%🫀
7  👤(DG) ${data.joueur7} : ${data.stat7}%🫀
8  👤(DC) ${data.joueur8} : ${data.stat8}%🫀
9  👤(DD) ${data.joueur9} : ${data.stat9}%🫀
10 👤(GB) ${data.joueur10} : ${data.stat10}%🫀
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▱▱▱▱
*🔷BENCH🥅*:
11 👤${data.joueur11}
12 👤${data.joueur12}
13 👤${data.joueur13}
14 👤${data.joueur14}
15 👤${data.joueur15}

⚽🔷*BLUE LOCK NEO🥅*▱▱▱`;
      return await zk.sendMessage(dest, {
          image: { url: "https://files.catbox.moe/p94q3m.jpg" },
          caption: lineup
        });
    }
    
    // Analyse des arguments pour mise à jour
    let updates = {};
    for (let i = 0; i < arg.length; i += 3) {
      if (/^j\d+$/.test(arg[i]) && arg[i + 1] === "=") {
        const playerIndex = arg[i].slice(1); // Extrait le numéro du joueur
        if (playerIndex >= 1 && playerIndex <= 15) {
          updates[`joueur${playerIndex}`] = arg[i + 2];
        }
      }
    }
    
    if (Object.keys(updates).length > 0) {
      const message = await updatePlayers(userId, updates);
      return repondre(message);
    } else {
      return repondre("⚠️ Format incorrect. Utilise: +lineup j1 = Nom j2 = Nom...");
    }
  }
);

// 📌 Commande SAVE
zokou(
  {
    nomCom: "save",
    categorie: "Gestion",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    if (!superUser) return repondre("⚠️ Seuls les membres de la NS peuvent enregistrer un joueur.");

    const mention = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
    if (!mention || arg.length < 2) {
      return repondre("⚠️ Mentionne un utilisateur et ajoute son nom.");
    }
    const userId = mention;
    const nomJoueur = arg.slice(1).join(" ");
    const message = await saveUser(userId, nomJoueur);
    repondre(message);
  }
);

zokou(
  {
    nomCom: "delete",
    categorie: "Gestion",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    if (!superUser) return repondre("⚠️ Seuls les membres de la NS peuvent supprimer un joueur.");

    const mention = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
    if (!mention) {
      return repondre("⚠️ Mentionne un utilisateur à supprimer.");
    }
    const userId = mention;
    const message = await deleteUser(userId);
    repondre(message);
  }
);

const { zokou } = require('../framework/zokou');
const { getData } = require('../bdd/westdiv');
const s = require("../set");
const dbUrl = s.DB;
const { Pool } = require('pg');

function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function add_fiche(nom_joueur, data_id, image_oc) {
    zokou(
        { nomCom: nom_joueur, categorie: 'WEST🦁🔵' },
        async (dest, zk, commandeOptions) => {
            const { ms, repondre, arg, superUser } = commandeOptions;
            let client;

            try {
                const data = await getData(data_id);
                const [joueur, object, signe, valeur, ...texte] = arg;

                if (!arg.length) {
                    const mesg = `*🎮NEOVERSE🔷 ACCOUNT🪪*
▔▔▔▔▔▔▔▔▔▔▔▔▔
👤User: ${data.user}
📳Téléphone: ${data.tel}
🎮Points de jeux: ${data.points_jeu} 🎮
🔷NEOcoins: ${data.nc}🔷
🔶NEOpoints: ${data.np}🔶
🎫Coupons: ${data.coupons}🎫
🎁Gift Box (claim🥳) : ${data.gift_box}🎁
░░░░░░░ *🔷MY GAMES🎮*
════════════
🌀All stars: ${data.alfiche}
⚽Blue Lock: +Team⚽
💠Élysium: +ElysiumMe💠

░░░░░░░ 🔷NEO🔷
════════════`;
                    zk.sendMessage(dest, { image: { url: "https://files.catbox.moe/mgmrkp.jpg" }, caption: mesg }, { quoted: ms });
                } else {
                    const proConfig = { connectionString: dbUrl, ssl: { rejectUnauthorized: false } };
                    const pool = new Pool(proConfig);
                    client = await pool.connect();

                    if (superUser) {
                        const updates = await processUpdates(arg, data_id, client);
                        await updatePlayerData(updates, client, data_id);

                        const messages = updates.map(update => `⚙ Object: ${update.object}\n💵 Ancienne Valeur: ${update.oldValue}\n💵 Nouvelle Valeur: ${update.newValue}`).join('\n\n');
                        await repondre(`Données du joueur mises à jour:\n\n${messages}`);
                    } else {
                        repondre('Seul les Membres de la NS peuvent modifier cette fiche');
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour:", error);
                repondre('Une erreur est survenue. Veuillez réessayer');
            } finally {
                if (client) client.release();
            }
        }
    );
}

async function processUpdates(arg, data_id, client) {
    const colonnesJoueur = {
        pseudo: "e1", division: "e2", classe: "e3", rang: "e4", golds: "e5", 
        neocoins: "e6", gift_box: "e7", coupons: "e8", np: "e9", talent: "e10",
        victoires: "e12", defaites: "e13", trophees: "e14", tos: "e15", awards: "e16",
        cards: "e17", globes: "e22", pos: "e23", talent: "e24", force: "e25", 
        close_combat: "e26", precision: "e27", speed: "e28"
    };

    const updates = [];
    let i = 0;

    while (i < arg.length) {
        const [object, signe, valeur] = [arg[i], arg[i+1], arg[i+2]];
        const colonneObjet = colonnesJoueur[object];
        let texte = [];
        i += 2;

        while (i < arg.length && !colonnesJoueur[arg[i]]) {
            texte.push(arg[i]);
            i++;
        }

        const { oldValue, newValue } = await calculateNewValue(colonneObjet, signe, valeur, texte, data_id, client);
        updates.push({ colonneObjet, newValue, oldValue, object, texte });
    }

    return updates;
}

async function calculateNewValue(colonneObjet, signe, valeur, texte, data_id, client) {
    const query = `SELECT ${colonneObjet} FROM westdiv WHERE id = ${data_id}`;
    const result = await client.query(query);
    const oldValue = result.rows[0][colonneObjet];
    let newValue;
    
    if (signe === '+' || signe === '-') {
        newValue = eval(`${oldValue} ${signe} ${valeur}`);
    } else if (signe === '=' || signe === 'add' || signe === 'supp') {
        if (signe === '=') newValue = texte.join(' ');
        else if (signe === 'add') newValue = oldValue + ' ' + texte.join(' ');
        else if (signe === 'supp') newValue = oldValue.replace(new RegExp(`\\b${normalizeText(texte.join(' '))}\\b`, 'gi'), '').trim();
    }

    return { oldValue, newValue };
}

async function updatePlayerData(updates, client, data_id) {
    await client.query('BEGIN');
    for (const update of updates) {
        const query = `UPDATE westdiv SET ${update.colonneObjet} = $1 WHERE id = ${data_id}`;
        await client.query(query, [update.newValue]);
    }
    await client.query('COMMIT');
}
