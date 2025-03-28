const { zokou } = require('../framework/zokou');
const { 
  Ticket,
  getTicket,
  saveTicket,
  deleteTicket,
  deleteAllTickets,
  listTickets
} = require('./neo_tickets');

zokou({ 
  nomCom: 'ticketbet', 
  reaction: '🎫', 
  categorie: 'NEO_GAMES🎰' 
}, async (dest, zk, { repondre, arg, ms }) => {
  // Template par défaut
  if (!arg || arg.length === 0) {
    const template = `.            *⌬𝗡Ξ𝗢𝘃𝗲𝗿𝘀𝗲 𝗕𝗘𝗧🎰*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░

*👥Parieur*: [Nom du parieur]
*🛡️Modérateur*: [Nom du modérateur]
*💰Somme misée*: [Montant de la mise]🧭

*📜Liste des paris placés*:
➤ [Valeur du pari 1] × [Cote du pari 1]
➤ [Valeur du pari 2] × [Cote du pari 2]
➤ [Valeur du pari 3] × [Cote du pari 3]

*💰Gains Possibles*: [Montant des gains possibles]🧭
═══════════░▒▒▒▒░░▒░
                  *🔷𝗡Ξ𝗢𝗚𝗮𝗺𝗶𝗻𝗴🎮*`;
    return repondre(template);
  }

  const args = arg.join(' ').split(' ');
  const command = args[0].toLowerCase();

  // Création de ticket
  if (command === 'parieur' && args[1] === '=' && args[2]) {
    const bettor = args.slice(2).join(' ');
    const ticket = new Ticket(bettor);
    await saveTicket(ticket);
    return repondre(`✅ Ticket créé pour ${bettor}`);
  }

  // Liste des tickets
  if (command === 'list') {
    const tickets = await listTickets();
    let message = `.            *⌬NΞOverse BET🎰*\n▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░\n\n*📋Liste des tickets* (${tickets.length})\n▔▔▔▔▔▔▔▔▔▔▔▔\n`;
    
    tickets.forEach(t => {
      message += `* ${t.bettor} - Mise: ${t.stake} - ${t.final_status}\n`;
    });

    message += `\n═══════════░▒▒▒▒░░▒░\n                  *🔷NΞOGaming🎮*`;
    return repondre(message);
  }

  // Suppression
  if (command === 'clear') {
    const target = args[1];
    if (target === 'all') {
      await deleteAllTickets();
      return repondre('🗑️ Tous les tickets supprimés');
    } else {
      await deleteTicket(target);
      return repondre(`🗑️ Ticket de ${target} supprimé`);
    }
  }

  // Gestion des tickets existants
  const ticket = await getTicket(command);
  if (!ticket) return repondre(`❌ Aucun ticket trouvé pour ${command}`);

  // Modification du modérateur
  if (args[1] === 'modo' && args[2] === '=' && args[3]) {
    ticket.moderator = args.slice(3).join(' ');
    await saveTicket(ticket);
    return repondre(`🛡️ Modérateur mis à jour`);
  }

  // Gestion de la mise
  if (args[1] === 'mise' && args[2] && args[3]) {
    const operator = args[2];
    const amount = parseInt(args[3]);

    if (isNaN(amount)) return repondre('❌ Montant invalide');

    switch (operator) {
      case '=': ticket.stake = amount; break;
      case '+': ticket.stake += amount; break;
      case '-': ticket.stake -= amount; break;
      default: return repondre('❌ Opérateur invalide (=/+/-)');
    }

    await saveTicket(ticket);
    return repondre(`💰 Mise mise à jour: ${ticket.stake}🧭`);
  }

  // Gestion des paris
  if (args[1].startsWith('pari') && !args[1].includes('statut')) {
    if (args[2] !== '=' || !args[3]) return repondre('❌ Syntaxe: ticketbet [parieur] pari[N] = [valeur]');

    const betIndex = parseInt(args[1].replace('pari', '')) - 1;
    const betValue = args.slice(3).join(' ');

    // Initialisation dynamique
    while (ticket.bets.length <= betIndex) {
      ticket.bets.push("");
      ticket.odds.push("1.00");
      ticket.statuses.push("⏳");
    }

    ticket.bets[betIndex] = betValue;
    await saveTicket(ticket);
    return repondre(`📜 Pari ${betIndex + 1} mis à jour`);
  }

  // Gestion des cotes
  if (args[1].startsWith('cote')) {
    if (args[2] !== '=' || !args[3]) return repondre('❌ Syntaxe: ticketbet [parieur] cote[N] = [valeur]');

    const oddIndex = parseInt(args[1].replace('cote', '')) - 1;
    const oddValue = args[3];

    if (isNaN(parseFloat(oddValue))) return repondre('❌ Cote invalide');

    while (ticket.odds.length <= oddIndex) {
      ticket.bets.push("");
      ticket.odds.push("1.00");
      ticket.statuses.push("⏳");
    }

    ticket.odds[oddIndex] = oddValue;
    await saveTicket(ticket);
    return repondre(`📊 Cote ${oddIndex + 1} mise à jour`);
  }

  // Gestion des statuts
  if (args[1].includes('statut')) {
    const betIndex = parseInt(args[1].replace('pari', '').replace('statut', '')) - 1;
    const status = args[2]?.toLowerCase();

    if (betIndex >= ticket.bets.length) return repondre('❌ Pari inexistant');
    if (!['victoire', 'echec'].includes(status)) return repondre('❌ Statut invalide (victoire/echec)');

    ticket.statuses[betIndex] = status === 'victoire' ? "✅" : "❌";
    ticket.updateFinalStatus();
    await saveTicket(ticket);
    return repondre(`🔄 Statut du pari ${betIndex + 1} mis à jour`);
  }

  // Affichage du ticket
  let message = `.            *⌬𝗡Ξ𝗢𝘃𝗲𝗿𝘀𝗲 𝗕𝗘𝗧🎰*\n▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░\n\n`;
  message += `*👥Parieur*: ${ticket.bettor}\n`;
  message += `*🛡️Modérateur*: ${ticket.moderator || "Non défini"}\n`;
  message += `*💰Somme misée*: ${ticket.stake}🧭\n`;
  
  if (ticket.statuses.length > 0) {
    message += `*📜Statut du ticket*: ${ticket.finalStatus}\n`;
  }

  message += `\n*📜Liste des paris placés*:\n`;
  
  if (ticket.bets.length === 0) {
    message += `➤ [Aucun pari enregistré]\n`;
  } else {
    ticket.bets.forEach((bet, i) => {
      message += `➤ ${bet} × ${ticket.odds[i]} ${ticket.statuses[i] || "⏳"}\n`;
    });
  }

  message += `\n*💰Gains Possibles*: ${ticket.calculatePotentialGains()}🧭\n`;
  message += `═══════════░▒▒▒▒░░▒░\n                  *🔷𝗡Ξ𝗢𝗚𝗮𝗺𝗶𝗻𝗴🎮*`;

  repondre(message);
});
