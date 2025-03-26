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

        if (!arg || arg.length === 0) {
            return repondre(generateEmptyTicket());
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
                const status = ticket.statuts.includes('echec') ? '❌ Perdu' : 
                             ticket.statuts.includes('victoire') ? '✅ Gagné' : '⌛ En cours';
                message += `• *${ticket.parieur}* - Mise: ${ticket.mise} - ${status}\n`;
            });
            return repondre(message);
        }

        if (action === 'parieur' && arg[1] === '=') {
            const parieur = arg.slice(2).join(' ');
            await neoDB.createTicket(parieur);
            return repondre(`✅ Ticket créé pour ${parieur}`);
        }

        const parieur = arg[0];
        const ticketData = await neoDB.getTicket(parieur);
        
        if (!ticketData && action !== 'clear') {
            return repondre(`❌ Aucun ticket trouvé pour ${parieur}`);
        }

        if (arg[1] === 'modo' && arg[2] === '=') {
            const modo = arg.slice(3).join(' ');
            await neoDB.updateTicket(parieur, { modo });
            return repondre(`✅ Modérateur mis à jour: ${modo}`);
        }

        if (arg[1] === 'mise' && ['+', '-'].includes(arg[2])) {
            const operation = arg[2];
            const montant = parseFloat(arg[3]);
            const newMise = operation === '+' ? ticketData.mise + montant : ticketData.mise - montant;
            await neoDB.updateTicket(parieur, { mise: newMise });
            return repondre(`✅ Mise mise à jour: ${newMise}`);
        }

        if (arg[1]?.startsWith('cote') && ['+', '='].includes(arg[2])) {
            const coteIndex = parseInt(arg[1].replace('cote', '')) - 1;
            const coteValue = parseFloat(arg[3]) || 1;
            const pariNom = arg.slice(4).join(' ') || `Pari ${coteIndex + 1}`;
            
            const paris = Array.isArray(ticketData.paris) ? [...ticketData.paris] : [];
            const statuts = Array.isArray(ticketData.statuts) ? [...ticketData.statuts] : [];
            
            paris[coteIndex] = { nom: pariNom, cote: coteValue };
            if (!statuts[coteIndex]) statuts[coteIndex] = '';
            
            await neoDB.updateTicket(parieur, { paris, statuts });
            return repondre(`✅ Cote ${coteIndex + 1} mise à jour: ${pariNom} × ${coteValue}`);
        }

        if (arg[1]?.startsWith('pari') && arg[2] === 'statut') {
            const pariIndex = parseInt(arg[1].replace('pari', '')) - 1;
            const statut = arg[3];
            const statuts = [...ticketData.statuts];
            statuts[pariIndex] = statut;
            await neoDB.updateTicket(parieur, { statuts });
            const emoji = statut === 'victoire' ? '✅' : '❌';
            return repondre(`✅ Statut du pari ${pariIndex + 1} mis à jour: ${emoji}`);
        }

        if (arg.length === 1) {
            const ticketContent = await neoDB.generateTicketContent(ticketData);
            return repondre(ticketContent);
        }

        if (action === 'clear') {
            if (!superUser) return repondre('🔒 Action réservée aux administrateurs');
            if (arg[1]?.toLowerCase() === 'all') {
                await neoDB.deleteAllTickets();
                return repondre('✅ Tous les tickets ont été supprimés');
            } else {
                await neoDB.deleteTicket(arg[1]);
                return repondre(`✅ Ticket de ${arg[1]} supprimé`);
            }
        }

        return repondre("❌ Commande non reconnue");

    } catch (error) {
        console.error("Erreur:", error);
        repondre("❌ Une erreur est survenue: " + error.message);
    }
});
