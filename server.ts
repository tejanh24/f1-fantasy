import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRIVERS_DATA = [
  { id: "verstappen", name: "Max Verstappen", constructor_id: "red_bull", price: 27.7, image: "https://media.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col-retina/image.png" },
  { id: "hadjar", name: "Isack Hadjar", constructor_id: "red_bull", price: 15.1, image: "https://placehold.co/400x400?text=Isack+Hadjar" },
  { id: "norris", name: "Lando Norris", constructor_id: "mclaren", price: 27.2, image: "https://media.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col-retina/image.png" },
  { id: "piastri", name: "Oscar Piastri", constructor_id: "mclaren", price: 25.5, image: "https://media.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col-retina/image.png" },
  { id: "leclerc", name: "Charles Leclerc", constructor_id: "ferrari", price: 22.8, image: "https://media.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col-retina/image.png" },
  { id: "hamilton", name: "Lewis Hamilton", constructor_id: "ferrari", price: 22.5, image: "https://media.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col-retina/image.png" },
  { id: "russell", name: "George Russell", constructor_id: "mercedes", price: 27.4, image: "https://media.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/2col-retina/image.png" },
  { id: "antonelli", name: "Kimi Antonelli", constructor_id: "mercedes", price: 23.2, image: "https://media.formula1.com/content/dam/fom-website/drivers/K/KIMANT01_Kimi_Antonelli/kimant01.png.transform/2col-retina/image.png" },
  { id: "sainz", name: "Carlos Sainz", constructor_id: "williams", price: 11.8, image: "https://media.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col-retina/image.png" },
  { id: "albon", name: "Alexander Albon", constructor_id: "williams", price: 11.6, image: "https://media.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/2col-retina/image.png" },
  { id: "alonso", name: "Fernando Alonso", constructor_id: "aston_martin", price: 10.0, image: "https://media.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col-retina/image.png" },
  { id: "stroll", name: "Lance Stroll", constructor_id: "aston_martin", price: 8.0, image: "https://media.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/2col-retina/image.png" },
  { id: "gasly", name: "Pierre Gasly", constructor_id: "alpine", price: 12.0, image: "https://media.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/2col-retina/image.png" },
  { id: "colapinto", name: "Franco Colapinto", constructor_id: "alpine", price: 6.2, image: "https://placehold.co/400x400?text=Franco+Colapinto" },
  { id: "ocon", name: "Esteban Ocon", constructor_id: "haas", price: 7.3, image: "https://media.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/2col-retina/image.png" },
  { id: "bearman", name: "Oliver Bearman", constructor_id: "haas", price: 7.4, image: "https://media.formula1.com/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/2col-retina/image.png" },
  { id: "perez", name: "Sergio Perez", constructor_id: "cadillac", price: 6.0, image: "https://media.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/2col-retina/image.png" },
  { id: "bottas", name: "Valtteri Bottas", constructor_id: "cadillac", price: 5.9, image: "https://placehold.co/400x400?text=Valtteri+Bottas" },
  { id: "hulkenberg", name: "Nico Hulkenberg", constructor_id: "audi", price: 6.8, image: "https://media.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/2col-retina/image.png" },
  { id: "bortoleto", name: "Gabriel Bortoleto", constructor_id: "audi", price: 6.4, image: "https://placehold.co/400x400?text=Gabriel+Bortoleto" },
  { id: "lawson", name: "Liam Lawson", constructor_id: "rb", price: 6.5, image: "https://media.formula1.com/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/2col-retina/image.png" },
  { id: "lindblad", name: "Arvid Lindblad", constructor_id: "rb", price: 6.2, image: "https://placehold.co/400x400?text=Arvid+Lindblad" },
];

const CONSTRUCTORS_DATA = [
  { id: "mclaren", name: "McLaren", price: 28.9, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren.png.transform/2col-retina/image.png" },
  { id: "ferrari", name: "Ferrari", price: 23.3, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari.png.transform/2col-retina/image.png" },
  { id: "red_bull", name: "Red Bull Racing", price: 28.2, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing.png.transform/2col-retina/image.png" },
  { id: "mercedes", name: "Mercedes", price: 29.3, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes.png.transform/2col-retina/image.png" },
  { id: "aston_martin", name: "Aston Martin", price: 10.3, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin.png.transform/2col-retina/image.png" },
  { id: "williams", name: "Williams", price: 12.0, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/williams.png.transform/2col-retina/image.png" },
  { id: "alpine", name: "Alpine", price: 12.5, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine.png.transform/2col-retina/image.png" },
  { id: "haas", name: "Haas F1 Team", price: 7.4, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-f1-team.png.transform/2col-retina/image.png" },
  { id: "cadillac", name: "Cadillac", price: 6.0, image: "https://placehold.co/400x200?text=Cadillac" },
  { id: "audi", name: "Audi", price: 6.6, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber.png.transform/2col-retina/image.png" },
  { id: "rb", name: "Racing Bulls", price: 6.3, image: "https://media.formula1.com/content/dam/fom-website/teams/2024/rb.png.transform/2col-retina/image.png" },
];

async function start() {
  console.log("[SERVER] Starting F1 Fantasy Server...");
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  let db: any;
  try {
    console.log("[SERVER] Initializing Database...");
    let url = process.env.TURSO_DATABASE_URL;
    let authToken = process.env.TURSO_AUTH_TOKEN;
    console.log("Url is " + url);

    // Common configuration mistake: Swapping URL and Token
    if (url && url.startsWith("eyJh")) {
      console.error("\n[SERVER] ❌ CONFIGURATION ERROR: TURSO_DATABASE_URL looks like a JWT token.");
      console.error("[SERVER] You likely pasted your Auth Token into the Database URL field.");
      
      if (authToken && (authToken.startsWith("libsql://") || authToken.startsWith("wss://") || authToken.startsWith("https://"))) {
        console.log("[SERVER] 🔄 Detected potential swap. Attempting to auto-correct...");
        const temp = url;
        url = authToken;
        authToken = temp;
      } else {
        console.error("[SERVER] Please check your environment variables.");
        console.error("[SERVER] TURSO_DATABASE_URL should start with 'libsql://', 'wss://', or 'https://'");
        console.error("[SERVER] TURSO_AUTH_TOKEN should be the long JWT string.\n");
        // Fallback to local file if configuration is broken to prevent crash loop
        console.warn("[SERVER] ⚠️ Falling back to local SQLite file due to configuration error.");
        url = "file:f1_fantasy.db";
        authToken = undefined;
      }
    }

    if (!url) {
      url = "file:f1_fantasy.db";
    }

    console.log(`[SERVER] Connecting to: ${url.startsWith("file:") ? "Local SQLite File" : "Turso Remote DB"}`);

    db = createClient({
      url,
      authToken,
    });

    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, name TEXT);
      CREATE TABLE IF NOT EXISTS leagues (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, invite_code TEXT UNIQUE, admin_id INTEGER);
      CREATE TABLE IF NOT EXISTS league_members (league_id INTEGER, user_id INTEGER, team_id INTEGER, PRIMARY KEY(league_id, user_id));
      
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        user_id INTEGER, 
        league_id INTEGER, 
        name TEXT,
        driver1_id TEXT, 
        driver2_id TEXT, 
        driver3_id TEXT, 
        driver4_id TEXT, 
        driver5_id TEXT, 
        constructor1_id TEXT, 
        constructor2_id TEXT, 
        turbo_driver_id TEXT,
        points INTEGER DEFAULT 0,
        is_complete INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS race_results (id INTEGER PRIMARY KEY AUTOINCREMENT, race_name TEXT, results_json TEXT, processed_at DATETIME DEFAULT CURRENT_TIMESTAMP);
      
      DROP TABLE IF EXISTS drivers;
      CREATE TABLE IF NOT EXISTS drivers (id TEXT PRIMARY KEY, name TEXT, constructor_id TEXT, price REAL, image TEXT);
      
      DROP TABLE IF EXISTS constructors;
      CREATE TABLE IF NOT EXISTS constructors (id TEXT PRIMARY KEY, name TEXT, price REAL, image TEXT);
      
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
      
      CREATE TABLE IF NOT EXISTS team_race_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER,
        race_id INTEGER,
        points INTEGER,
        FOREIGN KEY(team_id) REFERENCES teams(id),
        FOREIGN KEY(race_id) REFERENCES race_results(id)
      );

      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        race_name TEXT,
        pole_driver_id TEXT,
        p1_driver_id TEXT,
        p2_driver_id TEXT,
        p3_driver_id TEXT,
        fastest_lap_driver_id TEXT,
        points INTEGER DEFAULT 0,
        processed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, race_name)
      );

      CREATE TABLE IF NOT EXISTS races (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        date TEXT,
        round INTEGER
      );
    `);
    
    // Migrations for existing databases
    try { await db.execute("ALTER TABLE teams ADD COLUMN name TEXT DEFAULT 'My Team'"); } catch (e) {}
    try { await db.execute("ALTER TABLE teams ADD COLUMN turbo_driver_id TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE teams ADD COLUMN is_complete INTEGER DEFAULT 0"); } catch (e) {}
    try { 
      await db.execute("ALTER TABLE league_members ADD COLUMN team_id INTEGER"); 
      await db.execute("UPDATE league_members SET team_id = (SELECT id FROM teams WHERE teams.user_id = league_members.user_id AND teams.league_id = league_members.league_id LIMIT 1) WHERE team_id IS NULL");
    } catch (e) {}
    try { await db.execute("ALTER TABLE leagues ADD COLUMN is_locked INTEGER DEFAULT 0"); } catch (e) {}
    try { await db.execute("ALTER TABLE predictions ADD COLUMN race_id INTEGER"); } catch (e) {}
    try { await db.execute("ALTER TABLE races ADD COLUMN is_locked INTEGER DEFAULT 0"); } catch (e) {}
    try { await db.execute("ALTER TABLE races ADD COLUMN pole_driver_id TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE races ADD COLUMN p1_driver_id TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE races ADD COLUMN p2_driver_id TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE races ADD COLUMN p3_driver_id TEXT"); } catch (e) {}
    try { await db.execute("ALTER TABLE races ADD COLUMN fastest_lap_driver_id TEXT"); } catch (e) {}

    // Aggressive cleanup for race names and IDs
    try {
      // Trim all names
      await db.execute("UPDATE races SET name = TRIM(name)");
      await db.execute("UPDATE predictions SET race_name = TRIM(race_name)");
      
      // Backfill race_id with flexible matching
      await db.execute(`
        UPDATE predictions 
        SET race_id = (
          SELECT id FROM races 
          WHERE TRIM(races.name) = TRIM(predictions.race_name) 
             OR LOWER(TRIM(races.name)) = LOWER(TRIM(predictions.race_name))
          LIMIT 1
        )
        WHERE race_id IS NULL
      `);
      
      // Also backfill race_name if it's missing but race_id exists
      await db.execute(`
        UPDATE predictions
        SET race_name = (SELECT name FROM races WHERE id = predictions.race_id)
        WHERE (race_name IS NULL OR race_name = '') AND race_id IS NOT NULL
      `);
    } catch (e) {
      console.error("Migration error:", e);
    }

    // Populate Races
    const RACES_2026 = [
      { name: "Australian Grand Prix", date: "2026-03-08", round: 1 },
      { name: "Chinese Grand Prix", date: "2026-03-15", round: 2 },
      { name: "Japanese Grand Prix", date: "2026-03-29", round: 3 },
      { name: "Bahrain Grand Prix", date: "2026-04-12", round: 4 },
      { name: "Saudi Arabian Grand Prix", date: "2026-04-19", round: 5 },
      { name: "Miami Grand Prix", date: "2026-05-03", round: 6 },
      { name: "Canadian Grand Prix", date: "2026-05-24", round: 7 },
      { name: "Monaco Grand Prix", date: "2026-06-07", round: 8 },
      { name: "Spanish Grand Prix", date: "2026-06-14", round: 9 },
      { name: "Austrian Grand Prix", date: "2026-06-28", round: 10 },
      { name: "British Grand Prix", date: "2026-07-05", round: 11 },
      { name: "Belgian Grand Prix", date: "2026-07-19", round: 12 },
      { name: "Hungarian Grand Prix", date: "2026-07-26", round: 13 },
      { name: "Dutch Grand Prix", date: "2026-08-23", round: 14 },
      { name: "Italian Grand Prix", date: "2026-09-06", round: 15 },
      { name: "Madrid Grand Prix", date: "2026-09-13", round: 16 },
      { name: "Azerbaijan Grand Prix", date: "2026-09-27", round: 17 },
      { name: "Singapore Grand Prix", date: "2026-10-11", round: 18 },
      { name: "United States Grand Prix", date: "2026-10-25", round: 19 },
      { name: "Mexico City Grand Prix", date: "2026-11-01", round: 20 },
      { name: "Sao Paulo Grand Prix", date: "2026-11-08", round: 21 },
      { name: "Las Vegas Grand Prix", date: "2026-11-21", round: 22 },
      { name: "Qatar Grand Prix", date: "2026-11-29", round: 23 },
      { name: "Abu Dhabi Grand Prix", date: "2026-12-06", round: 24 }
    ];

    for (const r of RACES_2026) {
      await db.execute({
        sql: "INSERT OR IGNORE INTO races (name, date, round) VALUES (?, ?, ?)",
        args: [r.name.trim(), r.date, r.round]
      });
    }

    // Data cleanup: ensure all race names are trimmed
    await db.execute("UPDATE races SET name = TRIM(name)");
    await db.execute("UPDATE predictions SET race_name = TRIM(race_name)");

    console.log("[SERVER] Populating Races table...");
    for (const race of RACES_2026) {
      await db.execute({
        sql: "INSERT INTO races (name, date, round) VALUES (?, ?, ?) ON CONFLICT(name) DO UPDATE SET date=excluded.date, round=excluded.round",
        args: [race.name, race.date, race.round]
      });
    }

    // Backfill race_id in predictions
    console.log("[SERVER] Backfilling race_id in predictions...");
    await db.execute(`
      UPDATE predictions 
      SET race_id = (SELECT id FROM races WHERE TRIM(races.name) = TRIM(predictions.race_name) OR LOWER(races.name) = LOWER(predictions.race_name) LIMIT 1)
      WHERE race_id IS NULL
    `);
    
    // Initialize settings if not exists
    const lockSetting = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: ['teams_locked'] });
    if (lockSetting.rows.length === 0) {
      await db.execute({ sql: "INSERT INTO settings (key, value) VALUES (?, ?)", args: ['teams_locked', 'false'] });
    }

    console.log("[SERVER] Database initialized.");

    const driverCount = await db.execute("SELECT COUNT(*) as count FROM drivers");
    if ((driverCount.rows[0] as any).count < 22) {
      console.log("[SERVER] Seeding Database...");
      await db.execute("DELETE FROM drivers");
      await db.execute("DELETE FROM constructors");
      
      for (const d of DRIVERS_DATA) {
        await db.execute({ sql: "INSERT INTO drivers (id, name, constructor_id, price, image) VALUES (?, ?, ?, ?, ?)", args: [d.id, d.name, d.constructor_id, d.price, d.image] });
      }
      for (const c of CONSTRUCTORS_DATA) {
        await db.execute({ sql: "INSERT INTO constructors (id, name, price, image) VALUES (?, ?, ?, ?)", args: [c.id, c.name, c.price, c.image] });
      }
      console.log("[SERVER] Database seeded.");
    }
  } catch (e) {
    console.error("[SERVER] Database initialization failed:", e);
  }

  // API Routes
  
  // Settings Routes
  app.get("/api/settings/lock", async (req, res) => {
    try {
      const rs = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: ['teams_locked'] });
      const row = rs.rows[0] as any;
      res.json({ locked: row ? row.value === 'true' : false });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/races", async (req, res) => {
    try {
      const rs = await db.execute("SELECT * FROM races ORDER BY round ASC");
      res.json(rs.rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch races" });
    }
  });

  app.post("/api/races/:id/lock", async (req, res) => {
    try {
      const { locked } = req.body;
      await db.execute({
        sql: "UPDATE races SET is_locked = ? WHERE id = ?",
        args: [locked ? 1 : 0, req.params.id]
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update race lock status" });
    }
  });

  app.post("/api/races/:id/results", async (req, res) => {
    try {
      const { poleDriverId, p1DriverId, p2DriverId, p3DriverId, fastestLapDriverId } = req.body;
      await db.execute({
        sql: "UPDATE races SET pole_driver_id = ?, p1_driver_id = ?, p2_driver_id = ?, p3_driver_id = ?, fastest_lap_driver_id = ? WHERE id = ?",
        args: [poleDriverId, p1DriverId, p2DriverId, p3DriverId, fastestLapDriverId, req.params.id]
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to save race results" });
    }
  });

  app.post("/api/settings/lock", async (req, res) => {
    const { locked } = req.body;
    try {
      await db.execute({ sql: "UPDATE settings SET value = ? WHERE key = ?", args: [String(locked), 'teams_locked'] });
      res.json({ success: true, locked });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Admin Routes
  app.get("/api/admin/leagues", async (req, res) => {
    try {
      const rs = await db.execute("SELECT * FROM leagues");
      res.json(rs.rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch leagues" });
    }
  });

  app.post("/api/admin/leagues/:leagueId/lock", async (req, res) => {
    const { isLocked } = req.body;
    try {
      await db.execute({ sql: "UPDATE leagues SET is_locked = ? WHERE id = ?", args: [isLocked ? 1 : 0, req.params.leagueId] });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update league lock status" });
    }
  });

  app.delete("/api/admin/leagues/:id", async (req, res) => {
    try {
      await db.execute({ sql: "DELETE FROM leagues WHERE id = ?", args: [req.params.id] });
      await db.execute({ sql: "DELETE FROM league_members WHERE league_id = ?", args: [req.params.id] });
      await db.execute({ sql: "DELETE FROM teams WHERE league_id = ?", args: [req.params.id] });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete league" });
    }
  });

  app.delete("/api/admin/teams/:id", async (req, res) => {
    try {
      await db.execute({ sql: "DELETE FROM teams WHERE id = ?", args: [req.params.id] });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete team" });
    }
  });

  app.get("/api/drivers", async (req, res) => {
    try {
      const rs = await db.execute("SELECT * FROM drivers");
      if (rs.rows.length > 0) return res.json(rs.rows);
    } catch (e) {
      console.error("DB fetch failed, using fallback", e);
    }
    res.json(DRIVERS_DATA);
  });
  
  app.get("/api/constructors", async (req, res) => {
    try {
      const rs = await db.execute("SELECT * FROM constructors");
      if (rs.rows.length > 0) return res.json(rs.rows);
    } catch (e) {
      console.error("DB fetch failed, using fallback", e);
    }
    res.json(CONSTRUCTORS_DATA);
  });

  app.post("/api/login", async (req, res) => {
    const { email, name } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
      let rs = await db.execute({ sql: "SELECT * FROM users WHERE LOWER(email) = ?", args: [normalizedEmail] });
      let user = rs.rows[0] as any;
      
      if (!user) {
        const result = await db.execute({ sql: "INSERT INTO users (email, name) VALUES (?, ?)", args: [normalizedEmail, name] });
        user = { id: Number(result.lastInsertRowid), email: normalizedEmail, name };
      } else if (user.name !== name) {
        // Update the name if they log in with the same email but a different name
        await db.execute({ sql: "UPDATE users SET name = ? WHERE id = ?", args: [name, user.id] });
        user.name = name;
      }
      res.json(user);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/leagues/:userId", async (req, res) => {
    try {
      const rs = await db.execute({ sql: "SELECT l.* FROM leagues l JOIN league_members lm ON l.id = lm.league_id WHERE lm.user_id = ?", args: [req.params.userId] });
      res.json(rs.rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch leagues" });
    }
  });

  app.post("/api/leagues", async (req, res) => {
    const { name, adminId, teamId } = req.body;
    
    try {
      // If teamId is provided, validate it
      if (teamId) {
        const teamRs = await db.execute({ sql: "SELECT * FROM teams WHERE id = ? AND user_id = ?", args: [teamId, adminId] });
        const team = teamRs.rows[0] as any;
        if (!team || !team.driver1_id || !team.driver2_id || !team.driver3_id || !team.driver4_id || !team.driver5_id || !team.constructor1_id || !team.constructor2_id) {
          return res.status(400).json({ error: "Selected team is incomplete." });
        }
      }

      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const result = await db.execute({ sql: "INSERT INTO leagues (name, invite_code, admin_id) VALUES (?, ?, ?)", args: [name, inviteCode, adminId] });
      const leagueId = Number(result.lastInsertRowid);
      
      // Only add to league_members if a team was provided
      if (teamId) {
        await db.execute({ sql: "INSERT INTO league_members (league_id, user_id, team_id) VALUES (?, ?, ?)", args: [leagueId, adminId, teamId] });
      }
      
      res.json({ id: leagueId, inviteCode });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to create league" });
    }
  });

  app.post("/api/leagues/join", async (req, res) => {
    const { inviteCode, userId, teamId } = req.body;
    if (!teamId) return res.status(400).json({ error: "A complete team is required to join a league." });

    try {
      // Check if team is complete
      const teamRs = await db.execute({ sql: "SELECT * FROM teams WHERE id = ? AND user_id = ?", args: [teamId, userId] });
      const team = teamRs.rows[0] as any;
      if (!team || !team.driver1_id || !team.driver2_id || !team.driver3_id || !team.driver4_id || !team.driver5_id || !team.constructor1_id || !team.constructor2_id) {
        return res.status(400).json({ error: "Selected team is incomplete." });
      }

      const rs = await db.execute({ sql: "SELECT id, is_locked FROM leagues WHERE invite_code = ?", args: [inviteCode] });
      const league = rs.rows[0] as any;
      if (!league) return res.status(404).json({ error: "League not found" });
      if (league.is_locked === 1) return res.status(403).json({ error: "This league is locked and cannot be joined." });
      
      // Also check global lock
      const lockRs = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: ['teams_locked'] });
      const globalLock = lockRs.rows[0] as any;
      if (globalLock && globalLock.value === 'true') {
        return res.status(403).json({ error: "All leagues are currently locked." });
      }

      await db.execute({ sql: "INSERT INTO league_members (league_id, user_id, team_id) VALUES (?, ?, ?)", args: [league.id, userId, teamId] });
      res.json({ success: true, leagueId: league.id });
    } catch (e: any) {
      console.error(e);
      if (e.message && e.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "You are already in this league" });
      } else {
        res.status(500).json({ error: "Failed to join league" });
      }
    }
  });

  app.post("/api/leagues/:leagueId/lock", async (req, res) => {
    const { isLocked, adminId } = req.body;
    try {
      const rs = await db.execute({ sql: "SELECT admin_id FROM leagues WHERE id = ?", args: [req.params.leagueId] });
      const league = rs.rows[0] as any;
      if (!league) return res.status(404).json({ error: "League not found" });
      if (league.admin_id !== adminId) return res.status(403).json({ error: "Only the league admin can lock teams." });

      await db.execute({ sql: "UPDATE leagues SET is_locked = ? WHERE id = ?", args: [isLocked ? 1 : 0, req.params.leagueId] });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to update league lock status" });
    }
  });

  app.get("/api/leagues/:leagueId/standings", async (req, res) => {
    try {
      const rs = await db.execute({
        sql: `
        SELECT u.id as user_id, u.name, t.points, 
               t.driver1_id, t.driver2_id, t.driver3_id, t.driver4_id, t.driver5_id, 
               t.constructor1_id, t.constructor2_id, t.turbo_driver_id, t.is_complete 
        FROM league_members lm
        JOIN teams t ON lm.team_id = t.id 
        JOIN users u ON lm.user_id = u.id 
        WHERE lm.league_id = ? 
        ORDER BY t.points DESC
      `,
        args: [req.params.leagueId]
      });
      res.json(rs.rows);
    } catch (e) {
      console.error("Error fetching standings:", e);
      res.status(500).json({ error: "Failed to fetch standings" });
    }
  });

  app.get("/api/users/:userId/teams", async (req, res) => {
    try {
      const rs = await db.execute({ sql: "SELECT * FROM teams WHERE user_id = ?", args: [req.params.userId] });
      res.json(rs.rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    const { id, userId, name, driver1Id, driver2Id, driver3Id, driver4Id, driver5Id, constructor1Id, constructor2Id, turboDriverId } = req.body;
    
    // Calculate completeness
    const isComplete = driver1Id && driver2Id && driver3Id && driver4Id && driver5Id && constructor1Id && constructor2Id && turboDriverId ? 1 : 0;

    try {
      // Check global lock status
      const lockRs = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: ['teams_locked'] });
      const lockSetting = lockRs.rows[0] as any;
      if (lockSetting && lockSetting.value === 'true') {
        return res.status(403).json({ error: "Leagues are globally locked by admin" });
      }

      if (id) {
        // Check if team is in any locked leagues
        const lockedLeaguesRs = await db.execute({
          sql: "SELECT COUNT(*) as c FROM league_members lm JOIN leagues l ON lm.league_id = l.id WHERE lm.team_id = ? AND l.is_locked = 1",
          args: [id]
        });
        if (Number(lockedLeaguesRs.rows[0].c) > 0) {
          return res.status(403).json({ error: "This team is currently in a locked league and cannot be edited." });
        }

        // Update existing team
        await db.execute({ 
          sql: "UPDATE teams SET name = ?, driver1_id = ?, driver2_id = ?, driver3_id = ?, driver4_id = ?, driver5_id = ?, constructor1_id = ?, constructor2_id = ?, turbo_driver_id = ?, is_complete = ? WHERE id = ? AND user_id = ?", 
          args: [name || 'My Team', driver1Id, driver2Id, driver3Id, driver4Id, driver5Id, constructor1Id, constructor2Id, turboDriverId, isComplete, id, userId] 
        });
        res.json({ success: true, id });
      } else {
        // Check count
        const countRs = await db.execute({ sql: "SELECT COUNT(*) as c FROM teams WHERE user_id = ?", args: [userId] });
        if (Number(countRs.rows[0].c) >= 5) {
          return res.status(400).json({ error: "Maximum of 5 teams allowed." });
        }
        
        // Insert new team
        const rs = await db.execute({ 
          sql: "INSERT INTO teams (user_id, name, driver1_id, driver2_id, driver3_id, driver4_id, driver5_id, constructor1_id, constructor2_id, turbo_driver_id, is_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
          args: [userId, name || 'My Team', driver1Id, driver2Id, driver3Id, driver4Id, driver5Id, constructor1Id, constructor2Id, turboDriverId, isComplete] 
        });
        res.json({ success: true, id: Number(rs.lastInsertRowid) });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to save team" });
    }
  });

  app.delete("/api/teams/:teamId", async (req, res) => {
    try {
      const teamId = req.params.teamId;
      
      // Check lock status
      const lockRs = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: ['teams_locked'] });
      const lockSetting = lockRs.rows[0] as any;
      if (lockSetting && lockSetting.value === 'true') {
        return res.status(403).json({ error: "Teams are locked by admin" });
      }

      // Check if team is in any leagues
      const inLeagueRs = await db.execute({ sql: "SELECT COUNT(*) as c FROM league_members WHERE team_id = ?", args: [teamId] });
      if (Number(inLeagueRs.rows[0].c) > 0) {
        return res.status(400).json({ error: "Cannot delete a team that is currently in a league." });
      }

      await db.execute({ sql: "DELETE FROM team_race_points WHERE team_id = ?", args: [teamId] });
      await db.execute({ sql: "DELETE FROM teams WHERE id = ?", args: [teamId] });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete team" });
    }
  });

  app.get("/api/teams/:userId/:leagueId", async (req, res) => {
    try {
      const rs = await db.execute({ 
        sql: "SELECT t.* FROM league_members lm JOIN teams t ON lm.team_id = t.id WHERE lm.user_id = ? AND lm.league_id = ?", 
        args: [req.params.userId, req.params.leagueId] 
      });
      res.json(rs.rows[0] || null);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  app.get("/api/predictions/user/:userId/id/:raceId", async (req, res) => {
    try {
      const rs = await db.execute({
        sql: "SELECT * FROM predictions WHERE user_id = ? AND race_id = ?",
        args: [req.params.userId, req.params.raceId]
      });
      res.json(rs.rows[0] || null);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch prediction" });
    }
  });

  app.get("/api/predictions/user/:userId/:raceName", async (req, res) => {
    try {
      const rs = await db.execute({
        sql: "SELECT * FROM predictions WHERE user_id = ? AND race_name = ?",
        args: [req.params.userId, req.params.raceName]
      });
      res.json(rs.rows[0] || null);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch prediction" });
    }
  });

  app.post("/api/predictions", async (req, res) => {
    const { userId, raceName, raceId: bodyRaceId, poleDriverId, p1DriverId, p2DriverId, p3DriverId, fastestLapDriverId } = req.body;
    try {
      // Look up race_id if not provided or to verify
      let raceId = bodyRaceId;
      if (!raceId) {
        const raceRs = await db.execute({ 
          sql: "SELECT id, is_locked FROM races WHERE TRIM(name) = ? OR LOWER(name) = LOWER(?) OR name = ?", 
          args: [raceName.trim(), raceName.trim(), raceName] 
        });
        raceId = raceRs.rows[0]?.id || null;
        if (raceRs.rows[0]?.is_locked) {
          return res.status(403).json({ error: "This race is locked for predictions." });
        }
      } else {
        const raceRs = await db.execute({
          sql: "SELECT is_locked FROM races WHERE id = ?",
          args: [raceId]
        });
        if (raceRs.rows[0]?.is_locked) {
          return res.status(403).json({ error: "This race is locked for predictions." });
        }
      }

      await db.execute({
        sql: `INSERT INTO predictions (user_id, race_name, race_id, pole_driver_id, p1_driver_id, p2_driver_id, p3_driver_id, fastest_lap_driver_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(user_id, race_name) DO UPDATE SET
              race_id = excluded.race_id,
              pole_driver_id = excluded.pole_driver_id,
              p1_driver_id = excluded.p1_driver_id,
              p2_driver_id = excluded.p2_driver_id,
              p3_driver_id = excluded.p3_driver_id,
              fastest_lap_driver_id = excluded.fastest_lap_driver_id`,
        args: [userId, raceName.trim(), raceId, poleDriverId, p1DriverId, p2DriverId, p3DriverId, fastestLapDriverId]
      });
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to save prediction" });
    }
  });

  app.get("/api/predictions/leaderboard/id/:raceId", async (req, res) => {
    try {
      const raceId = Number(req.params.raceId);
      console.log(`[SERVER] API HIT: /api/predictions/leaderboard/id/${raceId}`);
      
      const rs = await db.execute({
        sql: `
          SELECT 
            p.user_id,
            u.name, 
            COALESCE(p.points, 0) as points,
            p.pole_driver_id,
            p.p1_driver_id,
            p.p2_driver_id,
            p.p3_driver_id,
            p.fastest_lap_driver_id,
            p.processed,
            p.race_name,
            p.race_id
          FROM predictions p
          LEFT JOIN users u ON p.user_id = u.id
          WHERE p.race_id = ? 
             OR p.race_name = (SELECT name FROM races WHERE id = ?)
             OR TRIM(p.race_name) = (SELECT TRIM(name) FROM races WHERE id = ?)
          ORDER BY COALESCE(p.points, 0) DESC, u.name ASC
        `,
        args: [raceId, raceId, raceId]
      });

      if (rs.rows.length === 0) {
        // Provide debug info even for ID route if empty
        const raceInfo = await db.execute({ sql: "SELECT name FROM races WHERE id = ?", args: [raceId] });
        const allPredictions = await db.execute("SELECT DISTINCT race_name, race_id FROM predictions LIMIT 5");
        return res.json({
          _debug: {
            queriedRaceId: raceId,
            raceNameInDb: raceInfo.rows[0]?.name || 'Unknown',
            availablePredictions: allPredictions.rows
          },
          leaderboard: []
        });
      }

      res.json(rs.rows);
    } catch (e) {
      console.error("[SERVER] Leaderboard ID error:", e);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/predictions/leaderboard/:raceName", async (req, res) => {
    try {
      const raceName = req.params.raceName;
      console.log(`[DEBUG] Fetching leaderboard for race: '${raceName}'`);
      
      // Look up race_id first for better matching
      const raceRs = await db.execute({ 
        sql: "SELECT id FROM races WHERE TRIM(name) = ? OR LOWER(name) = LOWER(?) OR name = ?", 
        args: [raceName.trim(), raceName.trim(), raceName] 
      });
      const raceId = raceRs.rows[0]?.id || null;
      console.log(`[DEBUG] Found raceId: ${raceId} for name: '${raceName}'`);

      // Query with multiple matching strategies
      let rs = await db.execute({
        sql: `
          SELECT 
            p.user_id,
            u.name, 
            COALESCE(p.points, 0) as points,
            p.pole_driver_id,
            p.p1_driver_id,
            p.p2_driver_id,
            p.p3_driver_id,
            p.fastest_lap_driver_id,
            p.processed,
            p.race_name,
            p.race_id
          FROM predictions p
          LEFT JOIN users u ON p.user_id = u.id
          WHERE p.race_name = ? 
             OR (p.race_id IS NOT NULL AND p.race_id = ?)
             OR TRIM(p.race_name) = ?
             OR LOWER(p.race_name) = LOWER(?)
          ORDER BY COALESCE(p.points, 0) DESC, u.name ASC
        `,
        args: [raceName, raceId, raceName.trim(), raceName.trim()]
      });

      console.log(`[DEBUG] Leaderboard found ${rs.rows.length} rows`);

      // If empty, return some debug info in the response
      if (rs.rows.length === 0) {
        const allPredictions = await db.execute("SELECT DISTINCT race_name, race_id FROM predictions LIMIT 10");
        return res.json({
          _debug: {
            queriedRaceName: raceName,
            foundRaceId: raceId,
            availablePredictions: allPredictions.rows
          },
          leaderboard: []
        });
      }

      res.json(rs.rows);
    } catch (e) {
      console.error("[DEBUG] Error fetching leaderboard:", e);
      res.status(500).json({ error: "Failed to fetch race leaderboard" });
    }
  });

  app.get("/api/predictions/global-leaderboard", async (req, res) => {
    try {
      const rs = await db.execute(`
        SELECT u.name, SUM(p.points) as total_points
        FROM predictions p
        JOIN users u ON p.user_id = u.id
        GROUP BY p.user_id
        ORDER BY total_points DESC
      `);
      res.json(rs.rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/race-results", async (req, res) => {
    try {
      const rs = await db.execute("SELECT * FROM race_results ORDER BY processed_at DESC");
      res.json(rs.rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch race results" });
    }
  });

  app.post("/api/admin/process-race", async (req, res) => {
    const { raceName, poleDriverId, fastestLapDriverId, finishers, dnfs, raceId: bodyRaceId } = req.body;
    
    if (!db) return res.status(500).json({ error: "Database not available" });

    try {
      const tx = await db.transaction("write");
      try {
        let currentRaceResultId = bodyRaceId;

        // 1. Insert or Update Race Result
        const resultsJson = JSON.stringify({ poleDriverId, fastestLapDriverId, finishers, dnfs });
        if (currentRaceResultId) {
          await tx.execute({ 
            sql: "UPDATE race_results SET race_name = ?, results_json = ? WHERE id = ?", 
            args: [raceName, resultsJson, currentRaceResultId] 
          });
          // Clear old points for this race
          await tx.execute({ sql: "DELETE FROM team_race_points WHERE race_id = ?", args: [currentRaceResultId] });
        } else {
          const result = await tx.execute({ 
            sql: "INSERT INTO race_results (race_name, results_json) VALUES (?, ?)", 
            args: [raceName, resultsJson] 
          });
          currentRaceResultId = Number(result.lastInsertRowid);
        }

        // Find the race ID from the schedule (races table)
        const raceRs = await tx.execute({
          sql: "SELECT id FROM races WHERE TRIM(name) = TRIM(?) OR LOWER(name) = LOWER(TRIM(?)) LIMIT 1",
          args: [raceName, raceName]
        });
        const scheduleRaceId = raceRs.rows[0]?.id || null;

        if (scheduleRaceId) {
          // Update the races table with the results
          await tx.execute({
            sql: "UPDATE races SET pole_driver_id = ?, p1_driver_id = ?, p2_driver_id = ?, p3_driver_id = ?, fastest_lap_driver_id = ? WHERE id = ?",
            args: [poleDriverId, finishers[0], finishers[1], finishers[2], fastestLapDriverId, scheduleRaceId]
          });
        }

        // 2. Calculate Points
        const driverPoints: Record<string, number> = {};
        finishers.forEach((driverId: string, index: number) => {
          let points = index < 10 ? 10 - index : 0;
          if (index < 10 && driverId === fastestLapDriverId) points += 5;
          if (driverId === poleDriverId) points += 5;
          driverPoints[driverId] = points;
        });
        dnfs.forEach((driverId: string) => { driverPoints[driverId] = -5; });

        const allDriversRs = await tx.execute("SELECT id, constructor_id FROM drivers");
        const allDrivers = allDriversRs.rows as any[];
        
        const constructorPoints: Record<string, number> = {};
        allDrivers.forEach(d => { 
          constructorPoints[d.constructor_id] = (constructorPoints[d.constructor_id] || 0) + (driverPoints[d.id] || 0); 
        });

        // 3. Award Points to Teams
        const teamsRs = await tx.execute("SELECT * FROM teams");
        const teams = teamsRs.rows as any[];
        
        for (const team of teams) {
          let p = (driverPoints[team.driver1_id] || 0) + 
                  (driverPoints[team.driver2_id] || 0) + 
                  (driverPoints[team.driver3_id] || 0) + 
                  (driverPoints[team.driver4_id] || 0) + 
                  (driverPoints[team.driver5_id] || 0) + 
                  (constructorPoints[team.constructor1_id] || 0) + 
                  (constructorPoints[team.constructor2_id] || 0);
          
          // Add Turbo Driver Bonus
          if (team.turbo_driver_id && driverPoints[team.turbo_driver_id]) {
            p += driverPoints[team.turbo_driver_id]; // Double the points
          }
          
          await tx.execute({ 
            sql: "INSERT INTO team_race_points (team_id, race_id, points) VALUES (?, ?, ?)", 
            args: [team.id, currentRaceResultId, p] 
          });
        }

        // 4. Update Total Points for All Teams
        await tx.execute(`
          UPDATE teams 
          SET points = (
            SELECT COALESCE(SUM(points), 0) 
            FROM team_race_points 
            WHERE team_race_points.team_id = teams.id
          )
        `);

        // 5. Calculate Prediction Points
        const predictionsRs = await tx.execute({
          sql: `SELECT * FROM predictions 
                WHERE TRIM(race_name) = TRIM(?) 
                   OR (race_id IS NOT NULL AND race_id = ?)`,
          args: [raceName, scheduleRaceId]
        });
        const predictions = predictionsRs.rows as any[];

        for (const pred of predictions) {
          let points = 0;
          let correctCount = 0;

          // Pole
          if (pred.pole_driver_id === poleDriverId) { points += 10; correctCount++; }
          
          // P1
          if (pred.p1_driver_id === finishers[0]) { points += 25; correctCount++; }

          // P2
          if (pred.p2_driver_id === finishers[1]) { points += 18; correctCount++; }

          // P3
          if (pred.p3_driver_id === finishers[2]) { points += 15; correctCount++; }

          // Fastest Lap
          if (pred.fastest_lap_driver_id === fastestLapDriverId) { points += 10; correctCount++; }

          // Perfect Weekend
          if (correctCount === 5) points += 50;

          await tx.execute({
            sql: "UPDATE predictions SET points = ?, processed = 1 WHERE id = ?",
            args: [points, pred.id]
          });
        }

        await tx.commit();
        res.json({ success: true });
      } catch (e) {
        try { await tx.rollback(); } catch (err) { console.error("Rollback failed", err); }
        throw e;
      } finally {
        tx.close();
      }
    } catch (e: any) {
      console.error("Error processing race:", e);
      res.status(500).json({ error: e.message });
    }
  });

  console.log("[SERVER] Initializing Vite...");
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[SERVER] Vite middleware attached.");
    } catch (e) {
      console.error("[SERVER] Vite initialization failed:", e);
    }
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error("[SERVER] Fatal error during server startup:", err);
});

