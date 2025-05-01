const { zokou } = require("../framework/zokou");
const { saveUser, deleteUser, updateUser, getUserData } = require("../bdd/team");

zokou(
  {
    nomCom: "team⚽",
    categorie: "Other",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, auteurMessage, superUser } = commandeOptions;

    let userId = auteurMessage;
    if (arg.length >= 1) {
      userId = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
      if (!userId) return repondre("⚠️ Mentionne un utilisateur.");
    }

    try {
      let data = await getUserData(userId);
      if (!data) return repondre("⚠️ Aucune donnée trouvée pour cet utilisateur.");

      if (arg.length <= 1) {
        const fiche = `░░ *👤PLAYER🥅⚽*: ${data.users}
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
*🛡️Team:* ${data.team}
*⬆️Points de jeu:* ${data.points_jeu} XP
*🎖️Rang:* ${data.rank}
*💰Argent:* ${data.argent} 💶
*🏆Puissance d'équipe:* ${data.puissance}⏫
*🎖️Classement d'équipe:* ${data.classement}

░░ *📊RECORDS⚽🥅*
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
⚽Wins: ${data.wins}   ❌Loss: ${data.loss}   🫱🏼‍🫲🏽Draws: ${data.draws}
🏆Championnats: ${data.championnats}    🏆NEL: ${data.nel}

🥅 +Lineup⚽: ⚠️pour voir la formation
🌍+player⚽: ⚠️pour voir son Hero
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ 
         ⚽🔷 *BLUE LOCK NEO🥅*▱▱▱`;

        return await zk.sendMessage(dest, {
          image: { url: "https://files.catbox.moe/2patx3.jpg" },
          caption: fiche,
        });
      }

      if (!superUser) return repondre("⚠️ Seuls les membres de la NS peuvent actualiser une team.");

      const modifiables = [
        "users", "team", "points_jeu", "rank",
        "argent", "puissance", "classement", "wins", "loss", "draws", "championnats", "nel"
      ];

      let updates = {};

      for (let i = 1; i < arg.length;) {
        const field = arg[i]?.toLowerCase();
        const op = arg[i + 1];

        if (!modifiables.includes(field) || !["=", "+", "-"].includes(op)) {
          i++;
          continue;
        }

        const isNumeric = [
          "points_jeu", "argent", "puissance",
          "wins", "loss", "draws", "championnats", "nel"
        ].includes(field);

        let value;

        if (op === "=" && !isNumeric) {
          let valParts = [];
          let j = i + 2;
          while (j < arg.length && !modifiables.includes(arg[j].toLowerCase())) {
            valParts.push(arg[j]);
            j++;
          }
          value = valParts.join(" ");
          i = j;
        } else {
          value = arg[i + 2];
          i += 3;
        }

        if (value !== undefined) {
          if (isNumeric) {
            const val = parseInt(value);
            if (!isNaN(val)) {
              if (op === "=") updates[field] = val;
              else if (op === "+") updates[field] = data[field] + val;
              else if (op === "-") updates[field] = data[field] - val;
            }
          } else {
            if (op === "=") updates[field] = value;
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        const message = await updateUser(userId, updates);
        return repondre(message);
      } else {
        return repondre("⚠️ Format incorrect ou champ non valide. Exemple : +team @user wins + 2 team = BlueLock Elite");
      }

    } catch (err) {
      console.error("❌ Erreur ligne team:", err);
      return repondre("❌ Une erreur est survenue.");
    }
  }
);

zokou(
  {
    nomCom: "team_s",
    categorie: "Other",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    if (!superUser) return repondre("⚠️ Seuls les membres de la NS peuvent enregistrer un joueur.");

    const mention = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
    if (!mention) return repondre("⚠️ Mentionne un utilisateur.");

    const base = {
      users: "aucun",
      team: "aucun",
      points_jeu: 0,
      rank: "aucun",
      argent: 0,
      puissance: 0,
      classement: "aucun",
      wins: 0,
      loss: 0,
      draws: 0,
      championnats: 0,
      nel: 0,
    };

    for (let i = 1; i < arg.length; i += 2) {
      const key = arg[i]?.toLowerCase();
      const val = arg[i + 1];
      if (key in base) {
        base[key] = isNaN(val) ? val : parseInt(val);
      }
    }

    const message = await saveUser(mention, base);
    repondre(message);
  }
);

zokou(
  {
    nomCom: "team_d",
    categorie: "Other",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    if (!superUser) return repondre("⚠️ Seuls les membres de la NS peuvent supprimer un joueur.");

    const mention = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
    if (!mention) return repondre("⚠️ Mentionne un utilisateur à supprimer.");

    const message = await deleteUser(mention);
    repondre(message);
  }
);
