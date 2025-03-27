const { zokou } = require('../framework/zokou');
const neoDB = require('../bdd/neo_tickets');

zokou({ nomCom: 'ticketbet', reaction: '🎫', categorie: 'NEO_GAMES🎰' }, async (dest, zk, { repondre, arg, ms, superUser }) => {
    try {
        if (!arg || arg.length === 0) {
            const ticketVierge = `.            *⌬𝗡Ξ𝗢𝘃𝗲𝗿𝘀𝗲 𝗕𝗘𝗧🎰*
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
            return repondre(ticketVierge);
        }

        const action = arg[0].toLowerCase();

        if (action === 'list') {
            if (!superUser) return repondre('🔒 Réservé aux admins');
            const searchTerm = arg[1];
            const tickets = searchTerm 
                ? await neoDB.searchTickets(searchTerm)
                : await neoDB.getAllTickets();
            if (tickets.length === 0) return repondre('Aucun ticket trouvé');
            let message = `📋 *Liste des Tickets* (${tickets.length})\n▔▔▔▔▔▔▔▔▔▔▔▔\n`;
            tickets.forEach(ticket => {
                message += `• *${ticket.parieur}* - Mise: ${ticket.mise}\n`;
            });
            return repondre(message);
        }

        if (action === 'parieur' && arg[1] === '=') {
            const parieur = arg.slice(2).join(' ');
            await neoDB.createTicket(parieur);
            return repondre(`Ticket créé pour ${parieur}`);
        }

        const parieur = arg[0];
        const ticketData = await neoDB.getTicket(parieur);
        
        if (!ticketData && action !== 'clear') {
            return repondre(`Aucun ticket trouvé pour ${parieur}`);
        }

        if (arg[1] === 'modo' && arg[2] === '=') {
            const modo = arg.slice(3).join(' ');
            await neoDB.updateTicket(parieur, { modo });
            return repondre(`Modérateur mis à jour: ${modo}`);
        }

        if (arg[1] === 'mise' && ['+', '-'].includes(arg[2])) {
            const operation = arg[2];
            const montant = parseFloat(arg[3]);
            const newMise = operation === '+' ? ticketData.mise + montant : ticketData.mise - montant;
            await neoDB.updateTicket(parieur, { mise: newMise });
            return repondre(`Mise mise à jour: ${newMise}`);
        }

        if (arg[1].startsWith('pari') && arg[2] === '=') {
            const pariNum = arg[1].replace('pari', '');
            if (!['1','2','3','4'].includes(pariNum)) return repondre('Numéro de pari invalide (1-4)');
            const pariNom = arg.slice(3).join(' ');
            await neoDB.updateTicket(parieur, { [`pari${pariNum}`]: pariNom });
            return repondre(`Pari ${pariNum} mis à jour: ${pariNom}`);
        }

        if (arg[1].startsWith('cote') && arg[2] === '=') {
            const pariNum = arg[1].replace('cote', '');
            if (!['1','2','3','4'].includes(pariNum)) return repondre('Numéro de cote invalide (1-4)');
            const cote = parseFloat(arg[3]);
            if (isNaN(cote)) return repondre('La cote doit être un nombre');
            await neoDB.updateTicket(parieur, { [`cote${pariNum}`]: cote });
            return repondre(`Cote ${pariNum} mise à jour: ${cote}`);
        }

        if (arg[1].startsWith('pari') && arg[2] === 'statut') {
            const pariNum = arg[1].replace('pari', '');
            if (!['1','2','3','4'].includes(pariNum)) return repondre('Numéro de pari invalide (1-4)');
            const statut = arg[3];
            if (!['victoire','echec',''].includes(statut)) return repondre('Statut invalide (victoire/echec)');
            await neoDB.updateTicket(parieur, { [`statut${pariNum}`]: statut });
            const emoji = statut === 'victoire' ? '✅' : '❌';
            return repondre(`Statut du pari ${pariNum} mis à jour: ${emoji}`);
        }

        if (arg.length === 1) {
            const ticketContent = await neoDB.generateTicketContent(ticketData);
            return repondre(ticketContent);
        }

        if (action === 'clear') {
            if (!superUser) return repondre('Action réservée aux administrateurs');
            if (arg[1].toLowerCase() === 'all') {
                await neoDB.deleteAllTickets();
                return repondre('Tous les tickets ont été supprimés');
            } else {
                await neoDB.deleteTicket(arg[1]);
                return repondre(`Ticket de ${arg[1]} supprimé`);
            }
        }

        repondre("Commande non reconnue. Syntaxe:\n" +
                 "- ticketbet (affiche ticket vierge)\n" +
                 "- ticketbet [parieur] pari[1-4] = [nom du pari]\n" +
                 "- ticketbet [parieur] cote[1-4] = [cote]");

    } catch (error) {
        console.error("Erreur:", error);
        repondre("Une erreur est survenue: " + error.message);
    }
});
