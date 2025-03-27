async function goal(zk, dest, repondre, texte) {
    if (!texte.toLowerCase().startsWith("🔷⚽duel action de but🥅\n▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔")) {
        return;
    }

    const tirMatch = texte.toLowerCase().match(/🥅tir\s*=\s*(\d+)/);
    const reflexesMatch = texte.toLowerCase().match(/🥅reflexes\s*=\s*(\d+)/);
    const vitesseMatch = texte.toLowerCase().match(/🥅vitesse\s*=\s*(\d+)/);
    const zoneMatch = texte.toLowerCase().match(/🥅zone\s*=\s*([\w\s]+)/);
    const distanceMatch = texte.toLowerCase().match(/🥅distance\s*=\s*([\d.]+)m/);
    const hauteurMatch = texte.toLowerCase().match(/🥅hauteur\s*=\s*([\d.]+)m/);
    const staminaMatch = texte.toLowerCase().match(/🥅stamina\s*=\s*(\d+)%/);
    const directionMatch = texte.toLowerCase().match(/🥅direction\s*=\s*(\w+)/);

    if (!tirMatch || !reflexesMatch || !vitesseMatch || !zoneMatch || !distanceMatch || !staminaMatch || !directionMatch) {
        return repondre("⚠️ Format incorrect. Assure-toi que la fiche est bien formatée.");
    }

    const tir = parseInt(tirMatch[1], 10);
    const reflexes = parseInt(reflexesMatch[1], 10);
    const vitesse = parseInt(vitesseMatch[1], 10);
    const zone = zoneMatch[1].trim().toLowerCase();
    const distance = parseFloat(distanceMatch[1]);
    const hauteur = parseFloat(hauteurMatch[1]);
    const stamina = parseInt(staminaMatch[1], 10);
    const direction = directionMatch[1].toLowerCase();

    let qualiteTir = "🔶 Moyenne";
    if (stamina >= 30) {
        qualiteTir = "✅ Parfaite";
    }

    const statsTir = qualiteTir === "✅ Parfaite" ? tir : tir - 10;

    let resultat;

    if (hauteur < 1.70) {
        resultat = "arrêt";
    } else if (hauteur > 2.00) {
        resultat = "arrêt";
    } else if (distance <= 5) {
        const difference = statsTir - reflexes;
        if (difference < -5) {
            resultat = "arrêt";
        } else if (difference >= -5 && difference < 0) {
            resultat = Math.random() < 0.1 ? "but" : "arrêt";
        } else if (difference === 0) {
            resultat = Math.random() < 0.5 ? "but" : "arrêt";
        } else if (difference > 0 && difference <= 5) {
            resultat = Math.random() < 0.8 ? "but" : "arrêt";
        } else if (difference > 5) {
            resultat = "but";
        }
    } else if (distance > 5 && distance <= 10) {
        const difference = statsTir - vitesse;
        if (difference < -5) {
            resultat = "arrêt";
        } else if (difference >= -5 && difference < 0) {
            resultat = Math.random() < 0.1 ? "but" : "arrêt";
        } else if (difference === 0) {
            resultat = Math.random() < 0.3 ? "but" : "arrêt";
        } else if (difference > 0 && difference <= 5) {
            resultat = Math.random() < 0.6 ? "but" : "arrêt";
        } else if (difference > 5) {
            resultat = Math.random() < 0.9 ? "but" : "arrêt";
        }
    } else if (distance > 10) {
        const difference = statsTir - vitesse;
        resultat = difference >= 10 ? "but" : "arrêt";
    }

    if (direction === "milieu" || direction === "bas") {
        resultat = "arrêt";
    }

    const frames = [
        "▱▱▱▱▱▱▱▱▱▱ 🔷0%",
        "▰▱▱▱▱▱▱▱▱▱ 🔷10%",
        "▰▰▱▱▱▱▱▱▱▱ 🔷20%",
        "▰▰▰▱▱▱▱▱▱▱ 🔷30%",
        "▰▰▰▰▱▱▱▱▱▱ 🔷40%",
        "▰▰▰▰▰▱▱▱▱▱ 🔷50%",
        "▰▰▰▰▰▰▱▱▱▱ 🔷60%",
        "▰▰▰▰▰▰▰▱▱▱ 🔷70%",
        "▰▰▰▰▰▰▰▰▱▱ 🔷80%",
        "▰▰▰▰▰▰▰▰▰▱ 🔷90%",
        "▰▰▰▰▰▰▰▰▰▰ 🔷100%",
    ];

    let imageMessage = await zk.sendMessage(dest, { text: frames[0] });

    for (let i = 1; i < frames.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await zk.sendMessage(dest, {
            text: frames[i],
            edit: imageMessage.key,
        });
    }

    if (resultat === "but") {
        let messageBut = "🥅:✅GOOAAAAAL!!!⚽⚽⚽ ▱▱▱▱\n";
        
        const commentaires = {
            droite: {
                lucarne: [
                    "UNE ŒUVRE D'ART ! La lucarne droite est pulvérisée par cette frappe venue d'ailleurs !",
                    "COMME UN MISSILE GUIDÉ ! Le ballon se niche dans la lucarne droite à vitesse incroyable - le gardien est sonné !",
                    "TOUT CE QU'IL Y A DE PLUS BEAU ! Ce ballon dans la lucarne droite mériterait d'être encadré !",
                    "LA PERFECTION ABSOLUE ! Frappe à ras du poteau droit, impossible à arrêter !",
                    "UN CHEF-D'ŒUVRE ! La lucarne droite vient de vivre un moment historique avec ce bijou !"
                ],
                coin: [
                    "PRÉCISION CHIRURGICALE ! Le petit filet droit est trouvé comme par magie !",
                    "LE GARDIEN HUMAINÉ ! Une frappe enroulée qui se love dans le petit coin droit !",
                    "COMME UN GANT ! Le ballon épouse parfaitement les filets du petit côté droit !",
                    "UNE FINESSE RARE ! Le tireur a déposé le ballon délicatement dans le petit filet droit !",
                    "TOUT EN DÉLICATESSE ! Un placement millimétré dans le coin droit - magnifique !"
                ],
                miHauteur: [
                    "UNE FLÈCHE ! Frappe croisée à ras de terre qui file au fond des filets droits !",
                    "DÉPART INCENDIE ! Le ballon traverse la surface à toute vitesse côté droit !",
                    "COMME UN COUP DE CISEAUX ! Une frappe sèche qui tranche la défense droite !",
                    "UNE BOMBE ! Le gardien a plongé mais ne pouvait rien contre cette puissance !",
                    "EFFET MAÎTRISÉ ! Le ballon trompe le gardien avec un rebond imprévisible à droite !"
                ]
            },
            gauche: {
                lucarne: [
                    "QUEL BEAUTÉ ! La lucarne gauche vient d'être frappée par la foudre !",
                    "DINGUE ! Ce ballon dans la lucarne gauche à fait trembler les filets !",
                    "À LA MARGE DE L'IMPOSSIBLE ! Un angle fermé en lucarne gauche - sublime !",
                    "UNE FRAPPE POUR LES ÉTOILES ! La lucarne gauche n'a jamais vu ça !",
                    "LE GARDIEN PEUT RENTRER ! Ce bijou dans la lucarne gauche est déjà au musée !"
                ],
                coin: [
                    "UN VÉRITABLE BIJOU ! Le petit filet gauche vient d'être sublimé !",
                    "FINITION D'EXCEPTION ! Le ballon se love dans le petit coin gauche !",
                    "DU GRAND ART ! Un placement divin dans les filets gauches !",
                    "COMME UNE CARESSE ! Le ballon effleure le filet gauche avec délicatesse !",
                    "PRÉCISION D'HORLOGER ! Le petit coin gauche est trouvé avec maestria !"
                ],
                miHauteur: [
                    "UNE FRAPPE ASSASSINE ! Le ballon transperce la défense côté gauche !",
                    "FROID COMME UN GLACON ! Le tireur a placé sa frappe à gauche sans pitié !",
                    "EFFET DIABOLIQUE ! Le ballon change de trajectoire en plein vol côté gauche !",
                    "UNE VRAIE ARME ! Frappe lourde qui explose dans le filet gauche !",
                    "DÉPART EXPRESS ! Le gardien n'a même pas vu passer le ballon à sa gauche !"
                ]
            },
            haut: [
                `UN CANON ! La barre transversale à ${hauteur}m vient de trembler !`,
                `DINGUE ! Ce ballon passe à ${hauteur}m - le gardien était impuissant !`,
                `COMME UN JAVELOT ! Frappe aérienne parfaite à ${hauteur}m de hauteur !`,
                `UN MOMENT DE PUR GÉNIE ! Le ballon frôle la barre à ${hauteur}m !`,
                `À LA LIMITE DU POSSIBLE ! Une frappe à ${hauteur}m qui laisse sans voix !`
            ]
        };

        let commentaire;
        if (direction === "droite" || direction === "gauche") {
            const zoneKey = zone === "mi-hauteur" ? "miHauteur" : zone;
            const listeCommentaires = commentaires[direction][zoneKey];
            commentaire = listeCommentaires[Math.floor(Math.random() * listeCommentaires.length)];
        } else if (direction === "haut") {
            commentaire = commentaires.haut[Math.floor(Math.random() * commentaires.haut.length)];
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
            "🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien boxe le ballon⚽ à l'extérieur, Sortie de BUT !",
            "🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien repousse le ballon dans la surface de réparation à 3m à gauche des buts",
            "🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien repousse le ballon dans la surface de réparation à 3m devant les buts",
            "🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien repousse le ballon dans la surface de réparation à 3m à droite des buts"
        ];
        const messageArret = messagesArret[Math.floor(Math.random() * messagesArret.length)];

        const videosArrete = [
            "https://files.catbox.moe/88lylr.mp4"
        ];
        const videosArret = videosArrete[Math.floor(Math.random() * videosArrete.length)];

        await zk.sendMessage(dest, { video: { url: videosArret }, caption: messageArret, gifPlayback: true });
    }
}

module.exports = goal;
