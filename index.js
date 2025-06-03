const fs = require("fs");
const pino = require("pino");
const path = require("path");
const { exec } = require("child_process");
const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  getContentType,
  jidDecode,
  delay,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const boom = require("@hapi/boom");
const conf = require("./set");
const session = conf.SESSION_ID || "";
let evt = require(__dirname + "/framework/zokou");
let { reagir } = require(__dirname + "/framework/app");
const axios = require("axios");
const FileType = require("file-type");
const prefixe = conf.PREFIXE || "/";
const latence = require("./commandes/decompte");
const stats = require("./commandes/stats");
const loca_test = require("./Elysium/Fallen_Angels/FA");
const stats_lineup = require("./commandes/lineup");
const goal = require("./commandes/Goal");
const getLid = require("./framework/cache");

async function ovlAuth(session) {
  let sessionId;
  try {
    if (session.startsWith("Ovl-MD_") && session.endsWith("_SESSION-ID")) {
      sessionId = session.slice(7, -11);
    }
    const response = await axios.get("https://pastebin.com/raw/" + sessionId);
    const data = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
    const filePath = path.join(__dirname, "auth", "creds.json");
    if (!fs.existsSync(filePath) || (fs.existsSync(filePath) && session !== "ovl")) {
      console.log("Connexion au bot en cours");
      await fs.writeFileSync(filePath, data, "utf8");
    }
  } catch (e) {
    console.log("Session invalide: " + (e.message || e));
  }
}

ovlAuth(session);

async function main() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  try {
    const zk = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      browser: Browsers.macOS("Safari"),
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      }
    });

    zk.ev.on("messages.upsert", async (m) => {
      if (m.type !== "notify") return;
      const ms = m.messages?.[0];
      if (!ms.message) return;

      const decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
          const decode = jidDecode(jid) || {};
          return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
        }
        return jid;
      };

      async function JidToLid(j) {
        try {
          if (!j) return null;
          const lid = await getLid(j, zk);
          return lid || j;
        } catch (e) {
          console.error("Erreur JID -> LID :", e.message);
          return j;
        }
      }

      const mtype = getContentType(ms.message);
      const texte = mtype === "conversation"
        ? ms.message.conversation
        : mtype === "imageMessage"
        ? ms.message.imageMessage?.caption
        : mtype === "videoMessage"
        ? ms.message.videoMessage?.caption
        : mtype === "extendedTextMessage"
        ? ms.message.extendedTextMessage?.text
        : mtype === "buttonsResponseMessage"
        ? ms.message.buttonsResponseMessage?.selectedButtonId
        : mtype === "listResponseMessage"
        ? ms.message.listResponseMessage?.singleSelectReply?.selectedRowId
        : mtype === "messageContextInfo"
        ? (ms.message.buttonsResponseMessage?.selectedButtonId || ms.message.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text)
        : "";

      const origineMessage = ms.key.remoteJid;
      const i = decodeJid(zk.user.id);
      const idBot = await JidToLid(decodeJid(zk.user.id));
      const servBot = idBot.split("@")[0];
      const verifGroupe = origineMessage?.endsWith("@g.us");
      const infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
      const nomGroupe = verifGroupe ? infosGroupe.subject : "";
      const msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
      const auteurMsgRepondu = await JidToLid(decodeJid(ms.message.extendedTextMessage?.contextInfo?.participant));
      const mr = ms.message.extendedTextMessage?.contextInfo?.mentionedJid;
      const utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
      const auteurMessage = verifGroupe
        ? await JidToLid(ms.key.participant)
        : await JidToLid(ms.key.fromMe ? idBot : ms.key.remoteJid);
      const membreGroupe = verifGroupe ? ms.key.participant : "";
      const nomAuteurMessage = ms.pushName;
      const { getAllSudoNumbers } = require("./bdd/sudo");
      const fatao = "22651463203";
      const sudo = await getAllSudoNumbers();
      const superuserjid = [i, fatao, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
      const superUserNumbers = await Promise.all(superuserjid.map((j) => JidToLid(j)));
      const allAllowedNumbers = await JidToLid(superUserNumbers.concat(sudo));
      const superUser = allAllowedNumbers.includes(auteurMessage);
      const devjid = await JidToLid([fatao].map((t) => t.replace(/[^0-9]/g, "") + "@s.whatsapp.net"));
      const dev = devjid.includes(auteurMessage);

      const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
      const verifCom = texte ? texte.startsWith(prefixe) : false;
      const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;

      function groupeAdmin(membres) {
        return membres.filter((m) => m.admin != null).map((m) => m.id);
      }

      function mybotpic() {
        const indiceAleatoire = Math.floor(Math.random() * liens.length);
        return liens[indiceAleatoire];
      }

      const mbre = verifGroupe ? await infosGroupe.participants : "";
      const admins = verifGroupe ? groupeAdmin(mbre) : "";
      const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
      const verifOvlAdmin = verifGroupe ? admins.includes(idBot) : false;

      const commandeOptions = {
        superUser,
        verifGroupe,
        mbre,
        membreGroupe,
        verifAdmin,
        infosGroupe,
        nomGroupe,
        auteurMessage,
        nomAuteurMessage,
        idBot,
        verifOvlAdmin,
        prefixe,
        arg,
        texte,
        repondre,
        groupeAdmin,
        msgRepondu,
        auteurMsgRepondu,
        ms,
        origineMessage,
        mybotpic,
        JidToLid
      };
        console.log(`NEOverse_md
${verifGroupe ? `Message provenant du groupe : ${nomGroupe}\n` : ''}Message envoyé par : [${nomAuteurMessage} : ${auteurMessage.split('@lid')[0]}]
Type de message : ${mtype}
Contenu du message.....
${texte}`);

      function repondre(message) {
        zk.sendMessage(origineMessage, { text: message }, { quoted: ms });
      }

      if (verifCom) {
        const cd = evt.cm.find((zokou) => zokou.nomCom === com);
        if (cd) {
          try {
            reagir(origineMessage, zk, ms, cd.reaction);
            cd.fonction(origineMessage, zk, commandeOptions);
          } catch (e) {
            console.log("😡😡 " + e);
            zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
          }
        }
      }

      const params = { zk, texte, origineMessage, repondre, ms };
      loca_test({ texte, repondre, zk, origineMessage });
      latence({ zk, texte, origineMessage });
      stats(texte, repondre);
      stats_lineup(texte, repondre);
      goal(zk, origineMessage, repondre, texte);
    });

    zk.ev.on("connection.update", async (con) => {
            const { connection, lastDisconnect } = con;
            if (connection === "connecting") {
                console.log("🌐connexion à whatsapp");
            } else if (connection === 'open')  {
                console.log("✅connexion etablit; Le bot est en ligne 🌐\n\n");
                delay(300) ;
                console.log("Chargement des commandes ...\n");
                fs.readdirSync(path.join(__dirname, "commandes")).forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == ".js") {
                        try {
                            require(path.join(__dirname, "commandes", fichier));
                            console.log(fichier + " installé avec succès");
                        } catch (e) {
                            console.log(` une erreur est survenu lors du chargement du fichier ${fichier} : ${e}`);
                        }
                    }
                    delay(300);
                });
                delay(700);
                let cmsg = `╭──❏ *🄽🄴🄾_🅆🄰-🄱🄾🅃*  ❏
│ ✿ Prefixe : [ ${prefixe} ]
│ ✿  Mode :
│ ✿ Commandes:︎ ${evt.cm.length}
╰═════════════⊷`;
                await zk.sendMessage(zk.user.id, { text: cmsg });
            } else if (connection == "close") {
                let raisonDeconnexion = new boom.Boom(lastDisconnect?.error)?.output.statusCode;
                if (raisonDeconnexion === DisconnectReason.badSession) {
                    console.log('Session id érronée veuiller obtenir une nouvelle session_id via Qr-code/Pairing-code svp ...');
                } else if (raisonDeconnexion === DisconnectReason.connectionClosed) {
                    console.log('!!! connexion fermée, reconnexion en cours ...');
                    main();
                } else if (raisonDeconnexion === DisconnectReason.connectionLost) {
                    console.log('connexion au serveur perdue😞 ,,, reconnexion en cours ...♻️');
                    main();
                } else if (raisonDeconnexion === DisconnectReason.connectionReplaced) {
                    console.log('connexion réplacée ,,, une sesssion est déjà ouverte veuillez la fermer svp !!!');
                } else if (raisonDeconnexion === DisconnectReason.loggedOut) {
                    console.log('veuillez obtenir une nouvelle session_id via Qr-code/Pairing-code svp');
                } else if (raisonDeconnexion === DisconnectReason.restartRequired) {
                    console.log('redémarrage du bot en cours ♻️');
                    main();
                } else {
                    console.log('une erreur est survenu:', raisonDeconnexion);
                    exec("pm2 restart all");
                }
                console.log("hum " + connection);
            }
        });

        zk.ev.on('group-participants.update', async (data) => {
    const parseID = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
        }
        return jid;
    };

    const groupPic = 'https://files.catbox.moe/ehnubw.jpg';
    try {
         if (data.action === 'add' && data.id == '120363031940789145@g.us' && conf.WELCOME == 'oui') {
            const newMembers = data.participants.map(m => `@${m.split("@")[0]}`).join('\n');
            const mek = `🎉 🔷 *🎉WELCOME 𝗮̀ 🔷𝗡Ξ𝗢𝘃𝗲𝗿𝘀𝗲🎉* 🎮
░▒▒▒▒░░▒░▔▔▔▔▔▔▔▔▔▔▔▔▔
Bienvenue à vous *${newMembers}* 😃💙👋🏻, ceci est le salon de Recrutement des nouveaux joueurs ! Une fois avoir lu et terminé les conditions d'intégration, vous serez ajoutés dans le Salon principal. #NEONation💙 #Welcome💙👋🏻🙂. 

🔷🎮 *𝖢𝖮𝖭𝖣𝖨𝖳𝖨𝖮𝖭𝖲 𝖭𝖤𝖮𝗏𝖾𝗋𝗌𝖾*
░▒▒▒▒░░▒░▔▔▔▔▔▔▔▔▔▔▔▔▔
❓Voici comment s'enregistrer à NEOverse👇🏼:

👉🏽 *ÉTAPE 1️⃣*: Votre Pseudo (Nom de joueur + Pays + Numéro de téléphone)
👉🏽 *ÉTAPE 2️⃣:* Envoyer une photo de profil de votre avatar (de préférence un perso anime comme Blue Lock, etc.). 
👉🏽 *ÉTAPE 3️⃣* : Follow les deux chaînes ci-dessous 
👉🏽 *ÉTAPE 4️⃣*: Attendez votre première carte de jeu avant de demander l'intégration : https://chat.whatsapp.com/LrKSRoxMcPi133sCtQB8Hf. 

*🌍NOS LIENS*👇👇👇
▔▔▔▔▔▔▔▔▔▔▔▔▔
👉🏽🪀 *Chaîne* : /whatsapp.com/channel/0029VaN9Z2yL2AU55DSahC23

👉🏽 *🛍️RP Store* : /whatsapp.com/channel/0029VaS9ngkFHWqAHps0BL3f

░░░░░░░░░░░░░░░░░░░
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
💙𝗡Ξ𝗢🙂🏆🎉`;
            await zk.sendMessage(data.id, { image: { url: groupPic }, caption: mek, mentions: data.participants });
        }
    } catch (error) {
        console.error("Erreur lors de la gestion des participants :", error);
    }
        });
    zk.ev.on("creds.update", saveCreds);
      //Autres fonction
            zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
    try {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        
        console.log(`Téléchargement du message de type: ${messageType}`);

        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        let type = await FileType.fromBuffer(buffer);
        if (!type) {
            throw new Error("Type de fichier non reconnu");
        }

        let trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
        let filePath = path.resolve('./', trueFileName);

        await fs.promises.writeFile(filePath, buffer);
        console.log(`Fichier sauvegardé à: ${filePath}`);

        return filePath;
    } catch (error) {
        console.error('Erreur lors du téléchargement et de la sauvegarde du fichier:', error);
        throw error; // Rethrow pour que l'appelant puisse gérer l'erreur s'il le souhaite
    }
};

zk.awaitForMessage = async (options = {}) => {
  return new Promise((resolve, reject) => {
    if (typeof options !== 'object') return reject(new Error('Options must be an object'));
    if (typeof options.sender !== 'string') return reject(new Error('Sender must be a string'));
    if (typeof options.chatJid !== 'string') return reject(new Error('ChatJid must be a string'));
    if (options.timeout && typeof options.timeout !== 'number') return reject(new Error('Timeout must be a number'));
    if (options.filter && typeof options.filter !== 'function') return reject(new Error('Filter must be a function'));

    const timeout = options.timeout || undefined;
    const filter = options.filter || (() => true);
    let timeoutId;

    // listener async pour gérer await dans son corps
    const listener = async (data) => {
      try {
        const { type, messages } = data;
        if (type === "notify") {
          for (let message of messages) {
            const fromMe = message.key.fromMe;
            const chatId = message.key.remoteJid;
            const isGroup = chatId.endsWith('@g.us');
            const isStatus = chatId === 'status@broadcast';

            const sender = fromMe
              ? zk.user.id.replace(/:.*@/g, '@')
              : (isGroup || isStatus)
                ? message.key.participant.replace(/:.*@/g, '@')
                : chatId;

            // Normalisation uniquement pour le sender (utilisateur)
            const normalizedSender = await getLid(sender, zk);
            const normalizedExpectedSender = await getLid(options.sender, zk);

            if (
              normalizedSender === normalizedExpectedSender &&
              chatId === options.chatJid && // PAS de jidToLid ici
              filter(message)
            ) {
              zk.ev.off('messages.upsert', listener);
              if (timeoutId) clearTimeout(timeoutId);
              resolve(message);
              return;
            }
          }
        }
      } catch (error) {
        // En cas d'erreur dans le listener, on enlève l'écoute et rejette la promesse
        zk.ev.off('messages.upsert', listener);
        if (timeoutId) clearTimeout(timeoutId);
        reject(error);
      }
    };

    zk.ev.on('messages.upsert', listener);

    if (timeout) {
      timeoutId = setTimeout(() => {
        zk.ev.off('messages.upsert', listener);
        reject(new Error('Timeout'));
      }, timeout);
    }
  });
};

  } catch (error) {
    console.error("Erreur principale:", error);
  }
}

main();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Assurez-vous d'ajouter cette ligne pour définir le port

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ovl-bot web page</title>
        <style>
            /* Styles pour centrer le texte */
            body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
            }
            .content {
                text-align: center;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <div class="content">
            <h1>Neoverse_md_wa-bot Web-page</h1>
        </div>
    </body>
    </html>
      `);
});

app.listen(port, () => {
  console.log("Listening on port: " + port);
});
