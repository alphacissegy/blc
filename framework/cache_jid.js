const groupCache = new Map();

/**
 * Associe un JID à un LID (en cache + récupération via ovl si besoin)
 */
async function getLid(jid, ovl) {
    try {
        if (!jid || typeof jid !== "string") return null;
        if (jid.endsWith("@lid")) return jid;
        if (groupCache.has(jid)) return groupCache.get(jid);

        const result = await ovl.onWhatsApp(jid);
        if (!result || !result[0]?.lid) return null;

        const lid = result[0].lid;
        groupCache.set(jid, lid);
        groupCache.set(lid, jid); // ajout du reverse
        return lid;
    } catch (e) {
        console.error("Erreur dans getLid:", e.message);
        return null;
    }
}

/**
 * Récupère le JID associé à un LID (si connu dans le cache)
 */
function getJidFromLid(lid) {
    if (!lid || typeof lid !== "string") return null;
    return groupCache.get(lid) || null;
}

module.exports = {
    getLid,
    getJidFromLid
};
