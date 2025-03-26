const { zokou } = require('../framework/zokou');
const neoDB = require('../bdd/neo_tickets');

zokou({ nomCom: 'ticketbet', reaction: '🎫', categorie: 'NEO_GAMES🎰' }, async (dest, zk, { repondre, arg, ms, superUser }) => {
    try {
        const generateEmptyTicket = () => {
            return `.            *⌬𝗡Ξ𝗢𝘃𝗲𝗿𝘀𝗲 𝗕𝗘𝗧🎰*
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
        };

        if (!arg || arg.length === 0) return repondre(generateEmptyTicket());

        if (arg[0] === 'parieur' && arg[1] === '=') {
            const parieur = arg.slice(2).join(' ');
            await neoDB.createTicket(parieur);
            return repondre(`✅ Ticket créé pour ${parieur}`);
        }

        const parieur = arg[0];
        const action = arg[1]?.toLowerCase();
        const subAction = arg[2];

        if (action?.startsWith('pari') && subAction === '=') {
            const pariIndex = parseInt(action.replace('pari', '')) - 1;
            const pariNom = arg.slice(3).join(' ');

            const ticket = await neoDB.getTicket(parieur) || { paris: [] };
            const paris = Array.isArray(ticket.paris) ? [...ticket.paris] : [];
            
            if (!paris[pariIndex]) paris[pariIndex] = {};
            paris[pariIndex].nom = pariNom;
            
            await neoDB.updateTicket(parieur, { paris });
            return repondre(`✅ Pari ${pariIndex + 1} défini : ${pariNom}`);
        }

        if (action?.startsWith('cote') && ['+', '='].includes(subAction)) {
            const coteIndex = parseInt(action.replace('cote', '')) - 1;
            const coteValue = parseFloat(arg[3]);

            const ticket = await neoDB.getTicket(parieur) || { paris: [] };
            const paris = Array.isArray(ticket.paris) ? [...ticket.paris] : [];
            
            if (!paris[coteIndex]) paris[coteIndex] = {};
            paris[coteIndex].cote = coteValue;
            
            await neoDB.updateTicket(parieur, { paris });
            return repondre(`✅ Cote ${coteIndex + 1} définie : ${coteValue}`);
        }

        if (action === 'modo' && subAction === '=') {
            const modo = arg.slice(3).join(' ');
            await neoDB.updateTicket(parieur, { modo });
            return repondre(`✅ Modérateur mis à jour : ${modo}`);
        }

        if (action === 'mise' && ['+', '-'].includes(subAction)) {
            const montant = parseFloat(arg[3]);
            const ticket = await neoDB.getTicket(parieur);
            if (!ticket) return repondre('❌ Ticket non trouvé');
            
            const newMise = subAction === '+' ? ticket.mise + montant : ticket.mise - montant;
            await neoDB.updateTicket(parieur, { mise: newMise });
            return repondre(`✅ Mise mise à jour : ${newMise}`);
        }

        if (action?.startsWith('pari') && arg[2] === 'statut') {
            const pariIndex = parseInt(action.replace('pari', '')) - 1;
            const statut = arg[3];
            const ticket = await neoDB.getTicket(parieur);
            
            if (!ticket) return repondre('❌ Ticket non trouvé');
            
            const statuts = [...(ticket.statuts || [])];
            statuts[pariIndex] = statut;
            
            await neoDB.updateTicket(parieur, { statuts });
            return repondre(`✅ Statut pari ${pariIndex + 1} mis à jour : ${statut}`);
        }

        if (action === 'list' && superUser) {
            const searchTerm = arg[2];
            const tickets = searchTerm 
                ? await neoDB.searchTickets(searchTerm)
                : await neoDB.getAllTickets();
                
            if (tickets.length === 0) return repondre('Aucun ticket trouvé');
            
            let message = `📋 Liste des Tickets (${tickets.length})\n▔▔▔▔▔▔▔▔▔▔▔▔\n`;
            tickets.forEach(ticket => {
                const status = ticket.statuts?.includes('echec') ? '❌ Perdu' : 
                             ticket.statuts?.includes('victoire') ? '✅ Gagné' : '⌛ En cours';
                message += `• ${ticket.parieur} - Mise: ${ticket.mise} - ${status}\n`;
            });
            return repondre(message);
        }

        if (action === 'clear' && superUser) {
            if (arg[2]?.toLowerCase() === 'all') {
                await neoDB.deleteAllTickets();
                return repondre('✅ Tous les tickets supprimés');
            } else {
                await neoDB.deleteTicket(arg[2]);
                return repondre(`✅ Ticket ${arg[2]} supprimé`);
            }
        }

        const ticketData = await neoDB.getTicket(parieur);
        if (!ticketData) return repondre('❌ Ticket non trouvé');
        
        const ticketContent = await neoDB.generateTicketContent(ticketData);
        return repondre(ticketContent);

    } catch (error) {
        console.error("Erreur:", error);
        repondre("❌ Erreur : " + error.message);
    }
});
