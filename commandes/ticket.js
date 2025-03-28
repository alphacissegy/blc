const { zokou } = require('../framework/zokou');
const neoDB = require('../bdd/neo_tickets');

zokou({ nomCom: 'ticketbet', reaction: '🎫', categorie: 'NEO_GAMES🎰' }, async (dest, zk, { repondre, arg, ms, superUser }) => {
    try {
        if (!arg || arg.length === 0) {
            const ticketVierge = `.            *⌬NΞOverse BET🎰*
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
                  *🔷NΞOGaming🎮*`;
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

        if (action === 'clear') {
            if (!superUser) return repondre('Action réservée aux administrateurs');
            if (arg[1]?.toLowerCase() === 'all') {
                await neoDB.deleteAllTickets();
                return repondre('Tous les tickets ont été supprimés');
            } else {
                await neoDB.deleteTicket(arg[1]);
                return repondre(`Ticket de ${arg[1]} supprimé`);
            }
        }

        const parieur = arg[0];
        let ticketData = await neoDB.getTicket(parieur);

        if (arg[1]?.toLowerCase() === 'parieur' && arg[2] === '=') {
            const newParieur = arg.slice(3).join(' ');
            if (ticketData) return repondre(`Le parieur ${parieur} existe déjà`);
            ticketData = await neoDB.createTicket(newParieur);
            return repondre(`Ticket créé pour ${newParieur}`);
        }

        if (!ticketData) {
            if (arg[1] === '=') {
                ticketData = await neoDB.createTicket(parieur);
                return repondre(`Ticket créé pour ${parieur}`);
            }
            return repondre(`Aucun ticket trouvé pour ${parieur}. Créez-le d'abord avec "ticketbet ${parieur} ="`);
        }

        if (!arg[1]) {
            const ticketContent = await neoDB.generateTicketContent(ticketData);
            return repondre(ticketContent);
        }

        const field = arg[1].toLowerCase();
        const operator = arg[2];

        if (operator !== '=') {
            return repondre("Syntaxe incorrecte. Utilisez: ticketbet [parieur] [champ] = [valeur]");
        }

        const value = arg.slice(3).join(' ');
        const updates = {};

        if (field === 'modo') {
            updates.modo = value;
        } else if (field === 'mise') {
            updates.mise = parseFloat(value) || 0;
        } else if (field.startsWith('pari') && ['1','2','3','4'].includes(field[4])) {
            updates[field] = value;
        } else if (field.startsWith('cote') && ['1','2','3','4'].includes(field[4])) {
            updates[field] = parseFloat(value) || 1;
        } else if (field.startsWith('statut') && ['1','2','3','4'].includes(field[6])) {
            if (!['victoire','echec',''].includes(value.toLowerCase())) {
                return repondre('Statut invalide (victoire/echec)');
            }
            updates[`statut${field[6]}`] = value.toLowerCase();
        } else {
            return repondre("Champ invalide. Champs valides: modo, mise, pari1-4, cote1-4, statut1-4");
        }

        await neoDB.updateTicket(parieur, updates);
        return repondre(`${field} mis à jour pour ${parieur}`);

    } catch (error) {
        console.error("Erreur:", error);
        repondre("Une erreur est survenue: " + error.message);
    }
});
