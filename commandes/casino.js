const { zokou } = require('../framework/zokou');
const fs = require('fs');
const users = require('../Id_ext/northdiv');
const s = require("../set");
const dbUrl = s.DB;

const generateRandomNumbers = (min, max, count) => {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(numbers);
};

const generateRewards = () => {
  const rewards = ['5🔷', '10.000 G🧭', '5🎟'];
  return rewards.sort(() => 0.5 - Math.random()).slice(0, 3);
};

zokou(
  {
    nomCom: 'roulette',
    reaction: '🎰',
    categorie: 'NEO_GAMES🎰'
  },
  async (origineMessage, zk, commandeOptions) => {
    const { ms, repondre, auteurMessage, auteurMsgRepondu, msgRepondu, arg } = commandeOptions;
    try {
      // Vérifier si le message provient des groupes spécifiés
      const authorizedChats = [
  '120363024647909493@g.us',
  '120363307444088356@g.us',
  '22651463203@s.whatsapp.net',
  '22605463559@s.whatsapp.net'
];
      if (authorizedChats.includes(origineMessage)) {
      const user = users.find(item => item.id === auteurMessage);
        let client;
        if (user) {
          const proConfig = {
            connectionString: dbUrl,
            ssl: {
              rejectUnauthorized: false,
            },
          };

          const { Pool } = require('pg');
          const pool = new Pool(proConfig);
          client = await pool.connect();
          // Exécuter la requête pour récupérer les valeurs souhaitées
          const result_np = await client.query(user.get_np);
          const result_nc = await client.query(user.get_neocoins);
          const result_golds = await client.query(user.get_golds);
          const result_coupons = await client.query(user.get_coupons);
          let valeur_np = parseInt(result_np.rows[0][user.cln_np]);
          let valeur_nc = parseInt(result_nc.rows[0][user.cln_neocoins]);
          let valeur_golds = parseInt(result_golds.rows[0][user.cln_golds]);
          let valeur_coupons = parseInt(result_coupons.rows[0][user.cln_coupons]);
 let numbers = generateRandomNumbers(0, 50, 50);
          let winningNumbers = generateRandomNumbers(0, 50, 3);
          let rewards = generateRewards();
          //repondre(winningNumbers.join(', '));
          let msga = `*🎰𝗧𝗘𝗡𝗧𝗘𝗭 𝗩𝗢𝗧𝗥𝗘 𝗖𝗛𝗔𝗡𝗖𝗘🥳 !!*🎉🎉
▭▬▭▬▭▬▭▬▭▬▭▬════░▒▒▒▒░░▒░
                           
Bienvenue dans la Roulette, choisissez un chiffre parmis les *5️⃣0️⃣*. Si vous choisissez le bon chiffre alors vous gagnez une récompense 🎁. *⚠️Vous avez 2 chances pour choisir le bon numéro*. 
🎊▔▔🎊▔🎊▔🎊▔▔🎊▔▔🎊▔🎊▔🎊
*\`${numbers.join(', ')}\`*. ▱▱▱ ▱▱▱ ▱▱▱ ▱▱▱
🎊▔▔🎊▔🎊▔🎊▔▔🎊▔▔🎊▔🎊▔🎊
             🎁5🔷  🎁10.000 🧭  🎁5🎫  
⚠️Vous pouvez booster votre récompense avec des NC🔷 avant le début du jeu, vous devez donc préciser au maître du jeu que vous voulez utiliser un Boost de tant. 
×2 = 5🔷
x5 = 10🔷
x10 = 20🔷
×20 = 50🔷

*🎊Voulez-vous tenter votre chance ?* (1min)
✅: \`Oui\`
❌: \`Non\`
                                          ══░▒▒▒▒░░▒░`; // Texte complet

          await zk.sendMessage(origineMessage, { video: { url: 'https://files.catbox.moe/amtfgl.mp4' }, caption: msga, gifPlayback: true }, { quoted: ms });

          const getConfirmation = async (attempt = 1) => {
            if (attempt > 3) {
              await repondre('*❌ Jeu annulé : trop de tentatives.*');
              throw new Error('TooManyAttempts');
            }

            try {
              const rep = await zk.awaitForMessage({
                sender: auteurMessage,
                chatJid: origineMessage,
                timeout: 60000 // 60 secondes
              });

              let response;
              try {
                response = rep.message.extendedTextMessage.text;
              } catch {
                response = rep.message.conversation;
              }

              if (response.toLowerCase() === 'oui') {
                return true;
              } else if (response.toLowerCase() === 'non') {
                await repondre('Jeu annulé.');
                throw new Error('GameCancelledByUser');
              } else {
                await repondre('Veuillez répondre par Oui ou Non.');
                return await getConfirmation(attempt + 1);
              }
            } catch (error) {
              if (error.message === 'Timeout') {
                await repondre('*❌ Délai d\'attente expiré*');
                throw error;
              } else {
                throw error;
              }
            }
          };

          let confirmation;
          try {
            confirmation = await getConfirmation();
            if (valeur_np < 1) {
              return  repondre('Nombre de Neo points insuffisant');
            } else {
              await client.query(user.upd_neocoins, [valeur_nc - 1]);   
              //repondre('nc retiré');
            }
          } catch (error) {
            return; // Gestion de l'erreur, jeu annulé
          }

          const getChosenNumber = async (isSecondChance = false, attempt = 1) => {
            if (attempt > 3) {
              await repondre('*❌ Jeu annulé : trop de tentatives.*');
              throw new Error('TooManyAttempts');
            }

            let msg = isSecondChance 
              ? '🎊😃: *Vous avez une deuxième chance ! Choisissez un autre numéro. Vous avez 1 min ⚠️* (Répondre à ce message)'
              : '🎊😃: *Choisissez un numéro. Vous avez 1 min ⚠️* (Répondre à ce message)';
            let lien = isSecondChance 
              ? 'https://files.catbox.moe/amtfgl.mp4'
              : 'https://files.catbox.moe/amtfgl.mp4';

            await zk.sendMessage(origineMessage, { video: { url: lien }, caption: msg, gifPlayback: true }, { quoted: ms });

            try {
              const rep = await zk.awaitForMessage({
                sender: auteurMessage,
                chatJid: origineMessage,
                timeout: 60000 // 60 secondes
              });

              let chosenNumber;
              try {
                chosenNumber = rep.message.extendedTextMessage.text;
              } catch {
                chosenNumber = rep.message.conversation;
              }

              chosenNumber = parseInt(chosenNumber);

              if (isNaN(chosenNumber) || chosenNumber < 0 || chosenNumber > 50) {
                await repondre('Veuillez choisir un des numéros proposés.');
                return await getChosenNumber(isSecondChance, attempt + 1);
              }

              return chosenNumber;
            } catch (error) {
              if (error.message === 'Timeout') {
                await repondre('*❌ Délai d\'attente expiré*');
                throw error;
              } else {
                throw error;
              }
            }
          };

          const checkWinningNumber = async (isSecondChance = false, number) => {
            if (winningNumbers.includes(number)) {
              let rewardIndex = winningNumbers.indexOf(number);
              let reward = rewards[rewardIndex];
              let msgc = `🎰FÉLICITATIONS ! 🥳🥳 vous avez gagner +${reward} 🎁🎊
══░▒▒▒▒░░▒░`; // Message de victoire
              let lienc = 'https://files.catbox.moe/vfv2hk.mp4';

              switch (reward) {
                case '5🔷':
                  await client.query(user.upd_neocoins, [valeur_nc + 5]);
                  break;
                case '10.000 G🧭':
                  await client.query(user.upd_golds, [valeur_golds + 10000]);
                  break;
                case '5🎟':
                  await client.query(user.upd_coupons, [valeur_coupons + 5]);
                  break;
                default:
                  await repondre('Récompense inconnue');
              }

              return { success: true, message: msgc, image: lienc };
            } else {
              if (isSecondChance) {
                // Message d'échec final après la deuxième tentative
                let msgd = `🎰❌❌SORRY ! 😖😣 Mauvais numéro💔💔💔💔. T'abandonne ? 😝
══░▒▒▒▒░░▒░`;
                let liend = 'https://files.catbox.moe/hmhs29.mp4';
                return { success: false, message: msgd, image: liend };
              } else {
                // Ne rien envoyer après le premier échec
                return { success: false, message: null, image: null };
              }
            }
          };

          try {
            const chosenNumber1 = await getChosenNumber();
            const result1 = await checkWinningNumber(false, chosenNumber1);

            if (result1.success) {
              await zk.sendMessage(origineMessage, { video: { url: result1.image }, caption: result1.message, gifPlayback: true }, { quoted: ms });
            } else {
              // Si échec à la première tentative, proposer une deuxième chance
              if (result1.message) {
                await zk.sendMessage(origineMessage, { video: { url: result1.image }, caption: result1.message, gifPlayback: true }, { quoted: ms });
              }

              try {
                const chosenNumber2 = await getChosenNumber(true);
                const result2 = await checkWinningNumber(true, chosenNumber2);

                if (result2.success) {
                  await zk.sendMessage(origineMessage, { video: { url: result2.image }, caption: result2.message, gifPlayback: true }, { quoted: ms });
                } else {
                  if (result2.message) {
                    await zk.sendMessage(origineMessage, { video: { url: result2.image }, caption: result2.message, gifPlayback: true }, { quoted: ms });
                  }
                }
              } catch (error) {
                return; // Erreur ou délai expiré lors de la deuxième chance
              }
            }
          } catch (error) {
            return; // Gestion de l'erreur ou délai expiré
          }
        } else { repondre("Votre identifiant n'existe pas") 
        }
        } else {
          return repondre("Commande non autorisée pour ce chat.");
      }
    } catch (error) {
      console.error('Erreur', error);
    }
  }
);
