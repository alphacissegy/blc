const { zokou } = require("../framework/zokou");
const { saveUser, deleteUser, updateUser, getUserData } = require("../bdd/myneo");

zokou(
  {
    nomCom: "myneo",
    categorie: "Other",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, auteurMessage, superUser } = commandeOptions;

    let userId = auteurMessage;
    if (arg.length > 1) {
      userId = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`);
      if (!userId) return repondre("⚠️ Mentionne un utilisateur.");
    }

    try {
      let data = await getUserData(userId);
      if (!data) {
        return repondre("⚠️ Aucune donnée trouvée pour cet utilisateur.");
      }

      if (arg.length = 0) {

        const myn = `*🎮NEOVERSE🔷 ACCOUNT🪪* ▔▔▔▔▔▔▔▔▔▔▔▔▔ 
👤User: ${data.user} 
📳Téléphone: ${data.tel} 
🎮Points de jeux: ${data.points_jeu} 
🔷NEOcoins: ${data.nc}🔷 
🔶NEOpoints: ${data.np}🔶 
🎫Coupons: ${data.coupons}🎫 
🎁Gift Box: ${data.gift_box}🎁  
░░░░░░░ 
*🎮MY GAMES* ════════════ 
🌀All Stars: ${data.all_stars} 
⚽Blue Lock: ${data.blue_lock} 
💠Élysium: ${data.elysium}  
░░░░░░░ 
🔷NEO🔷 ════════════`;

        return await zk.sendMessage(dest, {
          image: { url: "https://files.catbox.moe/mgmrkp.jpg" },
          caption: myn
        });
      }

      if (!superUser) return repondre("⚠️ Seuls les membres Premium peuvent actualiser un joueur.");

      const modifiables = [
        "user", "tel", "points_jeu", "nc", "np", "coupons", "gift_box",
        "all_stars", "blue_lock", "elysium"
      ];

      let updates = {};

      for (let i = 1; i < arg.length;) {
        const field = arg[i]?.toLowerCase();
        const op = arg[i + 1];

        if (!modifiables.includes(field) || !["=", "+", "-"].includes(op)) {
          i++;
          continue;
        }

        const isNumeric = ["points_jeu", "nc", "np", "coupons", "gift_box"].includes(field);
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
        return repondre("⚠️ Format incorrect ou champ non valide. Exemple : +myNeo @user nc + 200 user = Damian KÏNGS⚜️");
      }

    } catch (err) {
      console.error("❌ Erreur ligne myNeo:", err);
      return repondre("❌ Une erreur est survenue.");
    }
  }
);

zokou(
  {
    nomCom: "myneo_s",
    categorie: "Other",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    if (!superUser) return repondre("⚠️ Seuls les membres de la NS peuvent enregistrer un joueur.");

    const mention = (arg[0]?.includes("@") && ${arg[0].replace("@", "")}@s.whatsapp.net);
    if (!mention) return repondre("⚠️ Mentionne un utilisateur.");

    const base = {
      user: "",
      tel: "",
      points_jeu: 0,
      nc: 0,
      np: 0,
      coupons: 0,
      gift_box: 0,
      all_stars: "",
      blue_lock: "+Team⚽",
      elysium: "+ElysiumMe💠"
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
    nomCom: "myneo_d",
    categorie: "Other",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, superUser } = commandeOptions;
    if (!superUser) return repondre("⚠️ Seuls les membres de la NS peuvent supprimer un joueur.");

    const mention = (arg[0]?.includes("@") && ${arg[0].replace("@", "")}@s.whatsapp.net);
    if (!mention) return repondre("⚠️ Mentionne un utilisateur à supprimer.");

    const message = await deleteUser(mention);
    repondre(message);
  }
);
