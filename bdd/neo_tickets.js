const { Pool } = require('pg');
const s = require("../set");

const pool = new Pool({
  connectionString: s.DB,
  ssl: { rejectUnauthorized: false }
});

// Structure d'un ticket
class Ticket {
  constructor(bettor) {
    this.bettor = bettor;
    this.moderator = "";
    this.stake = 0;
    this.bets = [];
    this.odds = [];
    this.statuses = [];
    this.finalStatus = "⏳En cours";
  }

  calculatePotentialGains() {
    if (this.bets.length === 0) return 0;
    
    let totalOdds = 1;
    for (let i = 0; i < this.odds.length; i++) {
      totalOdds *= parseFloat(this.odds[i]);
    }
    return this.stake * totalOdds;
  }

  updateFinalStatus() {
    if (this.statuses.length === 0) {
      this.finalStatus = "⏳En cours";
      return;
    }

    if (this.statuses.includes("❌")) {
      this.finalStatus = "❌Perdu";
    } else if (this.statuses.length === this.bets.length && !this.statuses.includes("❌")) {
      this.finalStatus = "✅Gagné";
    } else {
      this.finalStatus = "⏳En cours";
    }
  }
}

// Initialisation de la base
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS neo_tickets (
        id SERIAL PRIMARY KEY,
        bettor TEXT UNIQUE,
        moderator TEXT,
        stake INTEGER,
        bets TEXT[],
        odds TEXT[],
        statuses TEXT[],
        final_status TEXT
      )
    `);
    console.log("✅ Base de données tickets initialisée");
  } catch (e) {
    console.error("❌ Erreur d'initialisation", e);
  } finally {
    client.release();
  }
}

// Opérations CRUD
async function getTicket(bettor) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM neo_tickets WHERE bettor = $1', [bettor]);
    if (res.rows.length === 0) return null;

    const data = res.rows[0];
    const ticket = new Ticket(data.bettor);
    ticket.moderator = data.moderator;
    ticket.stake = data.stake;
    ticket.bets = data.bets || [];
    ticket.odds = data.odds || [];
    ticket.statuses = data.statuses || [];
    ticket.finalStatus = data.final_status || "⏳En cours";
    
    return ticket;
  } finally {
    client.release();
  }
}

async function saveTicket(ticket) {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO neo_tickets (bettor, moderator, stake, bets, odds, statuses, final_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (bettor) DO UPDATE SET
        moderator = EXCLUDED.moderator,
        stake = EXCLUDED.stake,
        bets = EXCLUDED.bets,
        odds = EXCLUDED.odds,
        statuses = EXCLUDED.statuses,
        final_status = EXCLUDED.final_status
    `, [
      ticket.bettor,
      ticket.moderator,
      ticket.stake,
      ticket.bets,
      ticket.odds,
      ticket.statuses,
      ticket.finalStatus
    ]);
  } finally {
    client.release();
  }
}

async function deleteTicket(bettor) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM neo_tickets WHERE bettor = $1', [bettor]);
  } finally {
    client.release();
  }
}

async function deleteAllTickets() {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM neo_tickets');
  } finally {
    client.release();
  }
}

async function listTickets() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM neo_tickets');
    return res.rows;
  } finally {
    client.release();
  }
}

// Initialisation au démarrage
initDB();

module.exports = {
  Ticket,
  getTicket,
  saveTicket,
  deleteTicket,
  deleteAllTickets,
  listTickets
};
