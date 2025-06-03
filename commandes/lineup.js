const { zokou } = require("../framework/zokou");
const { saveUser, deleteUser, getUserData, updatePlayers, updateStats, resetStats } = require("../bdd/lineup_db");

zokou(
  {
    nomCom: "lineup⚽",
    categorie: "Other",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, auteurMessage } = commandeOptions;
    const userId = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@lid`) || auteurMessage;
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
    categorie: "Other",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    if (!superUser) return repondre("⚠️ Seuls les membres de la NS peuvent enregistrer un joueur.");

    const mention = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@lid`);
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
    categorie: "Other",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    if (!superUser) return repondre("⚠️ Seuls les membres de la NS peuvent supprimer un joueur.");

    const mention = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@lid`);
    if (!mention) {
      return repondre("⚠️ Mentionne un utilisateur à supprimer.");
    }
    const userId = mention;
    const message = await deleteUser(userId);
    repondre(message);
  }
);

// 📌 Fonction principale pour traiter les commandes
async function stats_lineup(tex, repondre) {
  const texte = tex.trim().toLowerCase().split(/\s+/);

  if (texte.length === 4 && texte[0].startsWith("@")) {
    const userId = `${texte[0].replace("@", "")}@lid`;
    const joueurKey = texte[1].toLowerCase();

    if (!/^j\d+$/.test(joueurKey)) return null;

    const statKey = `stat${joueurKey.replace("j", "")}`;
    const signe = texte[2];
    const valeur = parseInt(texte[3], 10);

    if (isNaN(valeur) || valeur <= 0 || (signe !== "+" && signe !== "-")) {
      return null;
    }

    const updateMessage = await updateStats(userId, statKey, signe, valeur);
    return repondre(updateMessage);
  }  

  else if (texte.length === 2 && texte[1] === "reset_stats" && texte[0].startsWith("@")) {
    const userId = texte[0].replace("@", "") + "@lid";
    const resetMessage = await resetStats(userId);
    return repondre(resetMessage);
  } 

  return null;
}

module.exports = stats_lineup;
