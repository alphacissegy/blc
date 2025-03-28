const { Pool } = require('pg');
const s = require("../set");
const dbUrl = s.DB;

class NeoTicketsDB {
    constructor() {
        this.pool = new Pool({ 
            connectionString: dbUrl, 
            ssl: { rejectUnauthorized: false } 
        });
        this.initDB();
    }

    async initDB() {
        const client = await this.pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS neo_tickets (
                    id SERIAL PRIMARY KEY,
                    parieur TEXT NOT NULL UNIQUE,
                    modo TEXT DEFAULT '',
                    mise NUMERIC DEFAULT 0,
                    pari1 TEXT DEFAULT '',
                    cote1 NUMERIC DEFAULT 1,
                    statut1 TEXT DEFAULT '',
                    pari2 TEXT DEFAULT '',
                    cote2 NUMERIC DEFAULT 1,
                    statut2 TEXT DEFAULT '',
                    pari3 TEXT DEFAULT '',
                    cote3 NUMERIC DEFAULT 1,
                    statut3 TEXT DEFAULT '',
                    pari4 TEXT DEFAULT '',
                    cote4 NUMERIC DEFAULT 1,
                    statut4 TEXT DEFAULT '',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
        } finally {
            client.release();
        }
    }

    async createTicket(parieur) {
        const res = await this.pool.query(
            'INSERT INTO neo_tickets (parieur) VALUES ($1) RETURNING *',
            [parieur]
        );
        return res.rows[0];
    }

    async getTicket(parieur) {
        const res = await this.pool.query(
            'SELECT * FROM neo_tickets WHERE LOWER(parieur) = LOWER($1)',
            [parieur]
        );
        return res.rows[0];
    }

    async updateTicket(parieur, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        for (const [field, value] of Object.entries(updates)) {
            fields.push(`${field} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }

        values.push(parieur);
        const query = `
            UPDATE neo_tickets 
            SET ${fields.join(', ')}, updated_at = NOW() 
            WHERE LOWER(parieur) = LOWER($${paramIndex}) 
            RETURNING *
        `;

        const res = await this.pool.query(query, values);
        return res.rows[0];
    }

    async deleteTicket(parieur) {
        await this.pool.query(
            'DELETE FROM neo_tickets WHERE LOWER(parieur) = LOWER($1)',
            [parieur]
        );
    }

    async deleteAllTickets() {
        await this.pool.query('DELETE FROM neo_tickets');
    }

    async calculateGains(mise, ticketData) {
        let totalCotes = 1;
        for (let i = 1; i <= 4; i++) {
            if (ticketData[`pari${i}`] && ticketData[`statut${i}`] === 'victoire') {
                totalCotes *= ticketData[`cote${i}`] || 1;
            }
        }
        return mise * totalCotes;
    }

    async generateTicketContent(ticketData) {
        let parisList = '';
        for (let i = 1; i <= 4; i++) {
            if (ticketData[`pari${i}`]) {
                const emoji = ticketData[`statut${i}`] === 'victoire' ? '✅' : 
                             ticketData[`statut${i}`] === 'echec' ? '❌' : '';
                parisList += `➤ ${emoji} ${ticketData[`pari${i}`]} × ${ticketData[`cote${i}`]}\n`;
            }
        }

        const statutGeneral = Object.keys(ticketData).some(key => key.startsWith('statut') && ticketData[key] === 'echec') 
                           ? 'Perdu' 
                           : Object.keys(ticketData).some(key => key.startsWith('statut') && ticketData[key] === 'victoire')
                             ? 'Gagné' 
                             : 'En attente';

        const gains = await this.calculateGains(ticketData.mise, ticketData);

        return `.            *⌬NΞOverse BET🎰*
▔▔▔▔▔▔▔▔▔▔▔▔░▒▒▒▒░░▒░

*👥Parieur*: ${ticketData.parieur}
*🛡️Modérateur*: ${ticketData.modo}
*💰Somme misée*: ${ticketData.mise}🧭
*📜Statut du ticket*: ${statutGeneral}

*📜Liste des paris placés*:
${parisList || '[Aucun pari]'}

*💰Gains Possibles*: ${gains}🧭
═══════════░▒▒▒▒░░▒░
                  *🔷NΞOGaming🎮*`;
    }

    async getAllTickets() {
        const res = await this.pool.query('SELECT parieur, mise FROM neo_tickets ORDER BY created_at DESC');
        return res.rows;
    }

    async searchTickets(searchTerm) {
        const res = await this.pool.query(
            'SELECT parieur, mise FROM neo_tickets WHERE parieur ILIKE $1 ORDER BY created_at DESC',
            [`%${searchTerm}%`]
        );
        return res.rows;
    }
}

module.exports = new NeoTicketsDB();
