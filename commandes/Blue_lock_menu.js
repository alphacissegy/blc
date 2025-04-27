const { zokou } = require('../framework/zokou');

zokou(
  {
    nomCom: 'bluelock⚽',
    categorie: 'Other'
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;

    if (!arg || arg.length === 0) {
      try {
        const lienImage = 'https://files.catbox.moe/uistkq.jpg';
        const lienGif = 'https://files.catbox.moe/z64kuq.mp4';

        await zk.sendMessage(dest, {
          video: { url: lienGif },
          gifPlayback: true,
          caption: ""
        });

        await zk.sendMessage(dest, {
          image: { url: lienImage },
          caption: ""
        });
      } catch (error) {
        console.error("Erreur lors de l'animation :", error);
        await zk.sendMessage(dest, { text: "Une erreur s'est produite. 😢" });
      }
    }
  }
);

zokou(
  {
    nomCom: 'modechampions⚽',
    categorie: 'Other'
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;

    if (!arg || arg.length === 0) {
      try {
        const lienGif = 'https://files.catbox.moe/z64kuq.mp4';

        await zk.sendMessage(dest, {
          video: { url: lienGif },
          gifPlayback: true,
          caption: ""
        });

        await zk.sendMessage(dest, { image: { url: "https://files.catbox.moe/dhkxtt.jpg" }, caption: "" }, { quoted: ms });
        await zk.sendMessage(dest, { image: { url: "https://files.catbox.moe/juvrgg.jpg" }, caption: "" }, { quoted: ms });
      } catch (error) {
        console.error("Erreur lors de modechampions :", error);
        await zk.sendMessage(dest, { text: "Une erreur est survenue. 😢" });
      }
    }
  }
);

zokou(
  {
    nomCom: 'modehero⚽',
    categorie: 'Other'
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;

    if (!arg || arg.length === 0) {
      try {
        const lienGif = 'https://files.catbox.moe/z64kuq.mp4';

        await zk.sendMessage(dest, {
          video: { url: lienGif },
          gifPlayback: true,
          caption: ""
        });

        await zk.sendMessage(dest, { image: { url: "https://files.catbox.moe/zmzlwt.jpg" }, caption: "" }, { quoted: ms });
        await zk.sendMessage(dest, { image: { url: "https://files.catbox.moe/hku7ch.jpg" }, caption: "" }, { quoted: ms });
      } catch (error) {
        console.error("Erreur lors de modehero :", error);
        await zk.sendMessage(dest, { text: "Une erreur est survenue. 😢" });
      }
    }
  }
);

zokou(
  {
    nomCom: 'bluegame⚽',
    categorie: 'Other'
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;

    if (!arg || arg.length === 0) {
      try {
        const lienGif = 'https://files.catbox.moe/z64kuq.mp4';

        await zk.sendMessage(dest, {
          video: { url: lienGif },
          gifPlayback: true,
          caption: ""
        });

        const liens = [
          'https://files.catbox.moe/7szc67.jpg',
          'https://files.catbox.moe/58n7wd.jpg',
          'https://files.catbox.moe/ixehlk.jpg',
          'https://files.catbox.moe/58n7wd.jpg',
          'https://files.catbox.moe/0j8rx1.jpg'
        ];

        for (const lien of liens) {
          await zk.sendMessage(dest, { image: { url: lien }, caption: "" }, { quoted: ms });
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error("Erreur lors de bluegame :", error);
        await zk.sendMessage(dest, { text: "Une erreur est survenue. 😢" });
      }
    }
  }
);
