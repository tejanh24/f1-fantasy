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
        points INTEGER DEFAULT 0
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
    `);
    
    // Migrations for existing databases
    try { await db.execute("ALTER TABLE teams ADD COLUMN name TEXT DEFAULT 'My Team'"); } catch (e) {}
    try { 
      await db.execute("ALTER TABLE league_members ADD COLUMN team_id INTEGER"); 
      await db.execute("UPDATE league_members SET team_id = (SELECT id FROM teams WHERE teams.user_id = league_members.user_id AND teams.league_id = league_members.league_id LIMIT 1) WHERE team_id IS NULL");
    } catch (e) {}
    try { await db.execute("ALTER TABLE leagues ADD COLUMN is_locked INTEGER DEFAULT 0"); } catch (e) {}
    
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
    if (!teamId) return res.status(400).json({ error: "A complete team is required to create a league." });

    try {
      // Check if team is complete
      const teamRs = await db.execute({ sql: "SELECT * FROM teams WHERE id = ? AND user_id = ?", args: [teamId, adminId] });
      const team = teamRs.rows[0] as any;
      if (!team || !team.driver1_id || !team.driver2_id || !team.driver3_id || !team.driver4_id || !team.driver5_id || !team.constructor1_id || !team.constructor2_id) {
        return res.status(400).json({ error: "Selected team is incomplete." });
      }

      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const result = await db.execute({ sql: "INSERT INTO leagues (name, invite_code, admin_id) VALUES (?, ?, ?)", args: [name, inviteCode, adminId] });
      const leagueId = Number(result.lastInsertRowid);
      await db.execute({ sql: "INSERT INTO league_members (league_id, user_id, team_id) VALUES (?, ?, ?)", args: [leagueId, adminId, teamId] });
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
        SELECT u.name, t.points, 
               t.driver1_id, t.driver2_id, t.driver3_id, t.driver4_id, t.driver5_id, 
               t.constructor1_id, t.constructor2_id 
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
    const { id, userId, name, driver1Id, driver2Id, driver3Id, driver4Id, driver5Id, constructor1Id, constructor2Id } = req.body;
    
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
          sql: "UPDATE teams SET name = ?, driver1_id = ?, driver2_id = ?, driver3_id = ?, driver4_id = ?, driver5_id = ?, constructor1_id = ?, constructor2_id = ? WHERE id = ? AND user_id = ?", 
          args: [name || 'My Team', driver1Id, driver2Id, driver3Id, driver4Id, driver5Id, constructor1Id, constructor2Id, id, userId] 
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
          sql: "INSERT INTO teams (user_id, name, driver1_id, driver2_id, driver3_id, driver4_id, driver5_id, constructor1_id, constructor2_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
          args: [userId, name || 'My Team', driver1Id, driver2Id, driver3Id, driver4Id, driver5Id, constructor1Id, constructor2Id] 
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

  app.get("/api/races", async (req, res) => {
    try {
      const rs = await db.execute("SELECT * FROM race_results ORDER BY processed_at DESC");
      res.json(rs.rows);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch races" });
    }
  });

  app.post("/api/admin/process-race", async (req, res) => {
    const { raceName, poleDriverId, fastestLapDriverId, finishers, dnfs, raceId } = req.body;
    
    if (!db) return res.status(500).json({ error: "Database not available" });

    try {
      const tx = await db.transaction("write");
      try {
        let currentRaceId = raceId;

        // 1. Insert or Update Race Result
        const resultsJson = JSON.stringify({ poleDriverId, fastestLapDriverId, finishers, dnfs });
        if (currentRaceId) {
          await tx.execute({ 
            sql: "UPDATE race_results SET race_name = ?, results_json = ? WHERE id = ?", 
            args: [raceName, resultsJson, currentRaceId] 
          });
          // Clear old points for this race
          await tx.execute({ sql: "DELETE FROM team_race_points WHERE race_id = ?", args: [currentRaceId] });
        } else {
          const result = await tx.execute({ 
            sql: "INSERT INTO race_results (race_name, results_json) VALUES (?, ?)", 
            args: [raceName, resultsJson] 
          });
          currentRaceId = Number(result.lastInsertRowid);
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
          
          await tx.execute({ 
            sql: "INSERT INTO team_race_points (team_id, race_id, points) VALUES (?, ?, ?)", 
            args: [team.id, currentRaceId, p] 
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

