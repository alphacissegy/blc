const map_fa = [
    { km: 48, lieu: "Av. Kings `[Museum🗿]`", image: "https://files.catbox.moe/pq36ml.jpg" },
    { km: 47, lieu: "Av. Federal `[NC Bank🏦]`", image: "https://files.catbox.moe/ip1zib.jpg" },
    { km: 46, lieu: "Av. Collins `[Parking🚘]`", image: "https://example.com/images/parking.jpg" },
    { km: 45, lieu: "Av. Telsa `[Metro🚄]`", image: "https://example.com/images/metro.jpg" },
    { km: 44, lieu: "Av. Fain `[GrandHôtel🏨]`", image: "https://example.com/images/hotel.jpg" },
    { km: 43, lieu: "Av. SAT `[Blue fish🐠🍽️]`", image: "https://example.com/images/restaurant.jpg" },
    { km: 42, lieu: "Av. Fortuna `[JacobsCo🔑]`", image: "https://example.com/images/office.jpg" },
    { km: 41, lieu: "Av. Temple `[Business&🏢]`", image: "https://example.com/images/business.jpg" },
    { km: 40, lieu: "Av. Rocknorth 🚔", image: "https://example.com/images/police.jpg" },
    { km: 39, lieu: "Av. Freetown `[Hôpital🏨]`", image: "https://example.com/images/hospital.jpg" },
    { km: 38, lieu: "Av. Swan `[Memorata👛🛍️]`", image: "https://example.com/images/shopping.jpg" },
    { km: 37, lieu: "Av. Sparks `[Apparts🏠]`", image: "https://example.com/images/apartments.jpg" },
    { km: 36, lieu: "Av. Eternity `[Store🛒]`", image: "https://example.com/images/store.jpg" },
    { km: 35, lieu: "Av. Sunning `[Neo Tech🩻]`", image: "https://example.com/images/tech.jpg" },
    { km: 34, lieu: "Av. Liberty `[LCD cars🚘]`", image: "https://example.com/images/cars.jpg" },
    { km: 33, lieu: "Av. Métro `[Station🚅🌍]`", image: "https://example.com/images/metro_station.jpg" },
    { km: 32, lieu: "Av. Montana `[Parking🚘]`", image: "https://example.com/images/parking2.jpg" },
    { km: 31, lieu: "Av. Arktown 🚔", image: "https://example.com/images/police2.jpg" },
    { km: 30, lieu: "Av. Sharp `[Bank ATM🏪]`", image: "https://example.com/images/atm.jpg" },
    { km: 29, lieu: "Av. Eywood `[StarGym🏋🏽‍♂️]`", image: "https://example.com/images/gym.jpg" },
    { km: 28, lieu: "Av. Véronica `[Carshop🛠️]`", image: "https://example.com/images/carshop.jpg" },
    { km: 27, lieu: "Av. Loksfort `[EFood🍕]`", image: "https://example.com/images/food.jpg" },
    { km: 26, lieu: "Av. Nevada `[Casino🎰]`", image: "https://example.com/images/casino.jpg" },
    { km: 25, lieu: "Av. Fairy `[EVOstyle👕🛍️]`", image: "https://example.com/images/fashion.jpg" },
    { km: 24, lieu: "Av. Dixies `[Store🛒]`", image: "https://example.com/images/store2.jpg" },
    { km: 23, lieu: "Av. Staples `[Cinema🍿🎞️]`", image: "https://example.com/images/cinema.jpg" },
    { km: 22, lieu: "Av. Liberty Town", image: "https://example.com/images/liberty_town.jpg" },
    { km: 21, lieu: "Av. Lux `[ClubVenus🪩🍸]`", image: "https://example.com/images/club.jpg" },
    { km: 20, lieu: "Av. Freeland `[GameHome🕹️]`", image: "https://example.com/images/gaming.jpg" },
    { km: 19, lieu: "Av. Shine `[MGStage🎤🪩]`", image: "https://example.com/images/stage.jpg" },
    { km: 18, lieu: "Av. Red miles `[Metro🚄]`", image: "https://example.com/images/metro2.jpg" },
    { km: 17, lieu: "Av. Xnes `[Apparts 🏠]`", image: "https://example.com/images/apartments2.jpg" },
    { km: 16, lieu: "Av. Tropica `[Store🛒]`", image: "https://example.com/images/store3.jpg" },
    { km: 15, lieu: "Av. Santana `[Stadium🏟️]`", image: "https://example.com/images/stadium.jpg" },
    { km: 14, lieu: "Av. Blue Bay `[Parking🚘]`", image: "https://example.com/images/parking3.jpg" },
    { km: 13, lieu: "Av. Santa Veronica🦩", image: "https://example.com/images/santa_veronica.jpg" },
    { km: 12, lieu: "Av. Seas `[Playground🏀]`", image: "https://example.com/images/playground.jpg" },
    { km: 11, lieu: "Av. Haleywood `[Metro🚄]`", image: "https://example.com/images/metro3.jpg" },
    { km: 10, lieu: "Av. Miles `[Joytown🎢🎠]`", image: "https://example.com/images/joytown.jpg" },
    { km: 9, lieu: "Av. Los Flores🦩", image: "https://example.com/images/los_flores.jpg" },
    { km: 8, lieu: "Av. Reds `[Paradise👠🔞]`", image: "https://example.com/images/paradise.jpg" },
    { km: 7, lieu: "Av. Maryland `[Races🏁]`", image: "https://example.com/images/races.jpg" },
    { km: 6, lieu: "Av. Westshore sea", image: "https://example.com/images/westshore.jpg" },
    { km: 5, lieu: "Av. Seattle `[Apparts🏠]`", image: "https://example.com/images/apartments3.jpg" },
    { km: 4, lieu: "Av. Lust `[Red Club🔞💋]`", image: "https://example.com/images/red_club.jpg" },
    { km: 3, lieu: "Av. Playa🌴 `[Havanah🍹]`", image: "https://example.com/images/playa.jpg" },
    { km: 2, lieu: "La Marina🌴 `[TheBay🏖️]`", image: "https://example.com/images/marina.jpg" },
    { km: 1, lieu: "Long Beach🌴 `[Plage🚤]`", image: "https://example.com/images/beach.jpg" }
];

let lastPosition = null;

function loca_test({ texte, repondre }) {
    const normalizedText = typeof texte === 'string' ? texte.toLowerCase() : '';
    const commandPattern = "*`💠i n t e r f a c e`*\n▔▔▔▔▔▔▔▔▔▔▔▔▔■■■■■\n🌍position:".toLowerCase();

    if (normalizedText.startsWith(commandPattern)) {
        const regex = /🌍position:\s*(\d+)km\s*([>]{1,2})\s*(\d+)km/i;
        const match = normalizedText.match(regex);

        if (match) {
            const startPosition = parseInt(match[1], 10);
            const guillemets = match[2];
            const endPosition = parseInt(match[3], 10);

            if (startPosition === endPosition) {
                const currentLocation = map_fa.find(loc => loc.km === startPosition);
                const lieu = currentLocation ? currentLocation.lieu : "Position inconnue";
                repondre(`*`💠S Y S T È ME🌐`*\n▔▔▔▔▔▔▔▔▔▔▔▔▔■■■■■\n📍Position inchangée, vous êtes toujours à «${lieu}»\n■■■■■▔▔▔▔▔▔▔▔▔▔▔▔`);
                return;
            }

            const distance = Math.abs(endPosition - startPosition);

            if (guillemets === ">" && distance > 1) {
                repondre("*`💠S Y S T È ME🌐`*\n▔▔▔▔▔▔▔▔▔▔▔▔▔■■■■■\n▪️Vous ne pouvez pas parcourir autant de distance à pied 🚶‍♂️! Le maximum de Km à pieds est de 1km Max !\n■■■■■▔▔▔▔▔▔▔▔▔▔▔▔");
                return;
            } else if (guillemets === ">>" && distance > 4) {
                repondre("*`💠S Y S T È ME🌐`*\n▔▔▔▔▔▔▔▔▔▔▔▔▔■■■■■\n▪️Vous ne pouvez pas parcourir autant de distance en voiture 🚗! Le maximum de Km en voiture est de 4km Max !\n■■■■■▔▔▔▔▔▔▔▔▔▔▔▔");
                return;
            }

            let startLocation = map_fa.find(loc => loc.km === startPosition);
            let endLocation = map_fa.find(loc => loc.km === endPosition);

            let startName = startLocation ? startLocation.lieu : "Lieu inconnu";
            let endName = endLocation ? endLocation.lieu : "Lieu inconnu";

            const message = `*`💠S Y S T È ME🌐`*\n▔▔▔▔▔▔▔▔▔▔▔▔▔■■■■■\n📍Vous avez quitté «${startName}».\n📍Vous êtes désormais à «${endName}»\n■■■■■▔▔▔▔▔▔▔▔▔▔▔▔`;

            if (endLocation && endLocation.image) {
                repondre({
                    text: message,
                    image: { url: endLocation.image }
                });
            } else {
                repondre(message);
            }

            lastPosition = endPosition;
        }
    }
}

module.exports = loca_test;
