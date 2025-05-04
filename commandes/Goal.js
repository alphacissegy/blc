async function goal(zk, dest, repondre, texte) {
    if (!texte.toLowerCase().startsWith("🔷⚽duel action de but🥅")) return;

    const tirMatch = texte.match(/🥅Tir\s*=\s*(\d+)\s*(\d+(?:\.\d+)?)m\s*(\d+(?:\.\d+)?)m/i);
    const gardienMatch = texte.match(/🥅Gardien\s*=\s*(\d+)/i);
    const zoneMatch = texte.match(/🥅Zone\s*=\s*([\w\s]+)/i);
    const directionMatch = texte.match(/🥅Direction\s*=\s*(\w+)/i);
    const distanceMatch = texte.match(/🥅Distance\s*=\s*([\d.]+)m/i);

    if (!tirMatch || !gardienMatch || !zoneMatch || !directionMatch || !distanceMatch) {
        return repondre("⚠️ Format incorrect. Assure-toi que la fiche est bien remplie.");
    }

    const tirPuissance = parseInt(tirMatch[1], 10);
    const hauteur = parseFloat(tirMatch[2]);
    const decalage = parseFloat(tirMatch[3]);
    const gardien = parseInt(gardienMatch[1], 10);
    const zone = zoneMatch[1].trim().toLowerCase();
    const direction = directionMatch[1].trim().toLowerCase();
    const distance = parseFloat(distanceMatch[1]);

    let resultat;

    // Cas d’échec automatique : hauteur ou décalage hors limites
    if (hauteur >= 2 || decalage >= 4) {
        resultat = "arrêt";
    } else if (distance <= 5) {
        if (tirPuissance > gardien) {
            resultat = Math.random() < 1.0 ? "but" : "arrêt";
        } else if (tirPuissance === gardien) {
            resultat = Math.random() < 0.5 ? "but" : "arrêt";
        } else {
            resultat = Math.random() < 0.2 ? "but" : "arrêt";
        }
    } else if (distance > 5 && distance <= 10) {
        if (tirPuissance > gardien) {
            resultat = Math.random() < 0.6 ? "but" : "arrêt";
        } else if (tirPuissance === gardien) {
            resultat = Math.random() < 0.3 ? "but" : "arrêt";
        } else {
            resultat = Math.random() < 0.1 ? "but" : "arrêt";
        }
    } else if (distance > 10 && distance <= 20) {
        // Tir spécial requis à cette distance
        if (tirPuissance > gardien) {
            resultat = "but";
        } else {
            resultat = "arrêt";
        }
    }
    
    await zk.sendMessage(dest, { 
        video: { url: "https://files.catbox.moe/z64kuq.mp4" }, 
        caption: "",
        gifPlayback: true 
    });

    if (resultat === "but") {
        let messageBut = "*🥅:✅GOOAAAAAL!!!⚽⚽⚽ ▱▱▱▱\n*";

        const commentaires = {
            droite: {
                lucarne: [
                    "*🎙️: UNE ŒUVRE D'ART ! La lucarne droite est pulvérisée par cette frappe venue d'ailleurs !",
                    "*🎙️: COMME UN MISSILE GUIDÉ ! Le ballon se niche dans la lucarne droite à vitesse incroyable - le gardien est sonné !*",
                    "*🎙️: TOUT CE QU'IL Y A DE PLUS BEAU ! Ce ballon dans la lucarne droite mériterait d'être encadré !*",
                    "*🎙️: LA PERFECTION ABSOLUE ! Frappe à ras du poteau droit, impossible à arrêter !*",
                    "*🎙️: UN CHEF-D'ŒUVRE ! La lucarne droite vient de vivre un moment historique avec ce bijou !*"
                ],
                coin: [
                    "*🎙️: PRÉCISION CHIRURGICALE ! Le petit filet droit est trouvé comme par magie !*",
                    "*🎙️: LE GARDIEN HUMAINÉ ! Une frappe enroulée qui se love dans le petit coin droit !*",
                    "*🎙️: COMME UN GANT ! Le ballon épouse parfaitement les filets du petit côté droit !*",
                    "*🎙️: UNE FINESSE RARE ! Le tireur a déposé le ballon délicatement dans le petit filet droit !*",
                    "*🎙️: TOUT EN DÉLICATESSE ! Un placement millimétré dans le coin droit - magnifique !*"
                ],
                miHauteur: [
                    "*🎙️: UNE FLÈCHE ! Frappe croisée à ras de terre qui file au fond des filets droits !*",
                    "*🎙️: DÉPART INCENDIE ! Le ballon traverse la surface à toute vitesse côté droit !*",
                    "*🎙️: COMME UN COUP DE CISEAUX ! Une frappe sèche qui tranche la défense droite !*",
                    "*🎙️: UNE BOMBE ! Le gardien a plongé mais ne pouvait rien contre cette puissance !*",
                    "*🎙️: EFFET MAÎTRISÉ ! Le ballon trompe le gardien avec un rebond imprévisible à droite !*"
                ]
            },
            gauche: {
                lucarne: [
                    "*🎙️: QUEL BEAUTÉ ! La lucarne gauche vient d'être frappée par la foudre !*",
                    "*🎙️: DINGUE ! Ce ballon dans la lucarne gauche à fait trembler les filets !*",
                    "*🎙️: À LA MARGE DE L'IMPOSSIBLE ! Un angle fermé en lucarne gauche - sublime !*",
                    "*🎙️: UNE FRAPPE POUR LES ÉTOILES ! La lucarne gauche n'a jamais vu ça !*",
                    "*🎙️: LE GARDIEN PEUT RENTRER ! Ce bijou dans la lucarne gauche est déjà au musée !*"
                ],
                coin: [
                    "*🎙️: UN VÉRITABLE BIJOU ! Le petit filet gauche vient d'être sublimé !*",
                    "*🎙️: FINITION D'EXCEPTION ! Le ballon se love dans le petit coin gauche !*",
                    "*🎙️: DU GRAND ART ! Un placement divin dans les filets gauches !*",
                    "*🎙️: COMME UNE CARESSE ! Le ballon effleure le filet gauche avec délicatesse !*",
                    "*🎙️: PRÉCISION D'HORLOGER ! Le petit coin gauche est trouvé avec maestria !*"
                ],
                miHauteur: [
                    "*🎙️: UNE FRAPPE ASSASSINE ! Le ballon transperce la défense côté gauche !*",
                    "*🎙️: FROID COMME UN GLACON ! Le tireur a placé sa frappe à gauche sans pitié !*",
                    "*🎙️: EFFET DIABOLIQUE ! Le ballon change de trajectoire en plein vol côté gauche !*",
                    "*🎙️: UNE VRAIE ARME ! Frappe lourde qui explose dans le filet gauche !*",
                    "*🎙️: DÉPART EXPRESS ! Le gardien n'a même pas vu passer le ballon à sa gauche !*"
                ]
            },
            milieu: {
                haut: [
                    `*🎙️: UN CANON ! La barre transversale à ${hauteur}m vient de trembler !*`,
                    `*🎙️: DINGUE ! Ce ballon passe à ${hauteur}m - le gardien était impuissant !*`,
                    `*🎙️: COMME UN JAVELOT ! Frappe aérienne parfaite à ${hauteur}m de hauteur !*`,
                    `*🎙️: UN MOMENT DE PUR GÉNIE ! Le ballon frôle la barre à ${hauteur}m !*`,
                    `*🎙️: À LA LIMITE DU POSSIBLE ! Une frappe à ${hauteur}m qui laisse sans voix !*`
                ],
                miHauteur: [
                    "*🎙️: UNE FRAPPE PARFAITE ! Le ballon file à mi-hauteur et se loge parfaitement au centre du but !*",
                    "*🎙️: UN TIR IMPOSSIBLE À DÉVIER ! Frappe précise et maîtrisée à mi-hauteur, le gardien n'a rien pu faire !*",
                    "*🎙️: CETTE FRAPPE EST IMPRESSIONNANTE ! Au centre du but, à mi-hauteur - parfaitement exécutée !*",
                    "*🎙️: UN COUP DE GÉNIE ! Le ballon se dirige parfaitement au centre du but à une hauteur idéale !*",
                    "*🎙️: LA CIBLE EST ATTEINTE ! Le ballon frappe le centre du but à mi-hauteur et fait trembler les filets !*"
                ],
                bas: [
                    "*🎙️: QUELLE VOLONTÉ ! Une frappe au ras du sol qui surprend le gardien !*",
                    "*🎙️: IMPRESSIONNANT ! Le ballon passe entre les jambes du gardien et termine au fond des filets !*",
                    "*🎙️: MAGISTRAL ! Une frappe basse que même un chat ne pourrait arrêter !*",
                    "*🎙️: UN CHOC ! Le gardien n'a pas eu le temps de réagir, trop rapide !*"
                ]
            }
        };

        let commentaire;
        if (direction === "droite" || direction === "gauche") {
            const zoneKey = zone === "mi-hauteur" ? "miHauteur" : zone;
            const listeCommentaires = commentaires[direction][zoneKey];
            commentaire = listeCommentaires[Math.floor(Math.random() * listeCommentaires.length)];
        } else if (direction === "milieu") {
            const zoneKey = zone === "haut" ? "haut" : zone === "bas" ? "bas" : "miHauteur";
            commentaire = commentaires[direction][zoneKey][Math.floor(Math.random() * commentaires[direction][zoneKey].length)];
        }

        messageBut += commentaire;

        const videosBute = [
            "https://files.catbox.moe/chcn2d.mp4",
            "https://files.catbox.moe/t04dmz.mp4",
            "https://files.catbox.moe/8t1eya.mp4"
        ];
        const videosBut = videosBute[Math.floor(Math.random() * videosBute.length)];

        await zk.sendMessage(dest, { 
            video: { url: videosBut }, 
            caption: messageBut,
            gifPlayback: true 
        });
    } else if (resultat === "arrêt") {
        const messagesArret = [
            "*🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien boxe le ballon⚽ à l'extérieur, Sortie de BUT !*",
            "*🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien repousse le ballon dans la surface de réparation à 3m à gauche des buts*",
            "*🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien repousse le ballon dans la surface de réparation à 3m devant les buts*",
            "*🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien repousse le ballon dans la surface de réparation à 3m à droite des buts*"
        ];
        const messageArret = messagesArret[Math.floor(Math.random() * messagesArret.length)];
        await zk.sendMessage(dest, { caption: messageArret, text: messageArret });
    }
}

module.exports = goal;
