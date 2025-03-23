
async function goal (zk, dest, repondre, texte) {
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
    const placementMatch = texte.toLowerCase().match(/🥅placement\s*=\s*(\w+)/);

    if (!tirMatch || !reflexesMatch || !vitesseMatch || !zoneMatch || !distanceMatch || !staminaMatch || !placementMatch) {
      return repondre("⚠️ Format incorrect. Assure-toi que la fiche est bien formatée.");
    }

    const tir = parseInt(tirMatch[1], 10);
    const reflexes = parseInt(reflexesMatch[1], 10);
    const vitesse = parseInt(vitesseMatch[1], 10);
    const zone = zoneMatch[1].trim();
    const distance = parseFloat(distanceMatch[1]);
    const hauteur = parseFloat(hauteurMatch[1]);
    const stamina = parseInt(staminaMatch[1], 10);
    const placement = placementMatch[1].toLowerCase();

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
      } else if (distance >= 1.70 && distance <= 2.00) {
      resultat = statsTir > reflexes ? "but" : "arrêt";
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
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await zk.sendMessage(dest, {
                        text: frames[i],
                        edit: imageMessage.key,
                    });
                }

    if (resultat === "but") {
      let messageBut;
      if (placement === "bas") {
        messageBut = `🥅:✅GOOAAAAAL!!!⚽⚽⚽ ▱▱▱▱\nExcellent but dans le petit filet ${zone} !`;
      } else if (placement === "haut") {
        messageBut = `🥅:✅GOOAAAAAL!!!⚽⚽⚽ ▱▱▱▱\nExcellent but dans la lucarne ${zone} !`;
      } else {
        messageBut = `🥅:✅GOOAAAAAL!!!⚽⚽⚽ ▱▱▱▱\nBut magnifique dans la ${zone} !`;
      }

      const videosBute = [
        "https://files.catbox.moe/chcn2d.mp4",
        "https://files.catbox.moe/t04dmz.mp4",
        "https://files.catbox.moe/8t1eya.mp4",
      ];
      const videosBut = videosBute[Math.floor(Math.random() * videosBute.length)];

      await zk.sendMessage(dest, { video: { url: videosBut }, caption: messageBut, gifPlayback: true });
    } else if (resultat === "arrêt") {
      const messagesArret = [
        "🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien boxe le ballon⚽ à l'extérieur, Sortie de BUT !",
        "🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien repousse le ballon dans la surface de réparation à 3m à gauche des buts",
        "🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien repousse le ballon dans la surface de réparation à 3m devant les buts",
        "🥅:❌MISSED GOAL!!! ▱▱▱▱\nLe gardien repousse le ballon dans la surface de réparation à 3m à droite des buts",
      ];
      const messageArret = messagesArret[Math.floor(Math.random() * messagesArret.length)];

      const videosArrete = [
        "https://files.catbox.moe/88lylr.mp4",
      ];
      const videosArret = videosArrete[Math.floor(Math.random() * videosArrete.length)];

      await zk.sendMessage(dest, { video: { url: videosArret }, caption: messageArret, gifPlayback: true });
    }
}

module.exports = goal;
