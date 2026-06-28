import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import {
  initNeo4j,
  saveQuestToGraph,
  fetchAllQuestsGraph,
} from "./src/db/neo4j";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB clients
  initNeo4j();

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // In-memory data store for the demo
  const db = {
    user: {
      level: 12,
      xp: 2990,
      xpToNextLevel: 3000,
      coins: 450,
      streak: 14,
      lastDungeonDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      productivityScore: 92,
    },
    quests: [
      {
        id: "1",
        title: "Defeat Assignment Dragon",
        type: "boss",
        deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        health: 80,
        maxHealth: 100,
        tasks: [
          { id: "t1", title: "Read Chapter 4", completed: true },
          { id: "t2", title: "Write Draft", completed: false },
          { id: "t3", title: "Review & Submit", completed: false },
        ],
        rewards: { xp: 500, coins: 100 },
        riskScore: "high",
        dependencies: [],
        estimatedHours: 5,
      },
      {
        id: "2",
        title: "DBMS Exam Prep",
        type: "quest",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        health: 100,
        maxHealth: 100,
        tasks: [
          { id: "t4", title: "Normal Forms", completed: false },
          { id: "t5", title: "SQL Queries", completed: false },
        ],
        rewards: { xp: 800, coins: 150 },
        riskScore: "medium",
        dependencies: [],
        estimatedHours: 8,
      },
      {
        id: "3",
        title: "DBMS Project Setup",
        type: "daily",
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        health: 100,
        maxHealth: 100,
        tasks: [{ id: "t6", title: "Setup Repo", completed: false }],
        rewards: { xp: 200, coins: 50 },
        riskScore: "low",
        dependencies: ["2"],
        estimatedHours: 2,
      },
    ],
  };

  // API Routes
  app.get("/api/user", (req, res) => {
    res.json(db.user);
  });

  app.get("/api/quests", async (req, res) => {
    try {
      const graphQuests = await fetchAllQuestsGraph();
      if (graphQuests && graphQuests.length > 0) {
        // If we have quests in Neo4j, let's merge them with our local mock tasks or just return them directly.
        // For simplicity, we'll return the local db.quests for now if Neo4j is empty,
        // or we'll merge dependencies from Neo4j into our local quests if we want the full rich data.
        // But let's actually just use Neo4j for the dependencies structure if it's there.
        // To be safe and keep tasks working (since Neo4j schema in neo4j.ts doesn't fetch tasks right now),
        // let's merge Neo4j dependency data into the local DB quests.

        const mergedQuests = db.quests.map((q) => {
          const graphNode = graphQuests.find((g) => g.id === q.id);
          if (graphNode) {
            return { ...q, dependencies: graphNode.dependencies };
          }
          return q;
        });

        res.json(mergedQuests);
      } else {
        res.json(db.quests);
      }
    } catch (error) {
      console.error(error);
      res.json(db.quests);
    }
  });

  app.post("/api/quests", async (req, res) => {
    const quest = req.body;
    if (!quest.id) {
      quest.id = String(db.quests.length + 1);
    }
    const existingIndex = db.quests.findIndex((q) => q.id === quest.id);
    if (existingIndex > -1) {
      db.quests[existingIndex] = quest;
    } else {
      db.quests.push(quest);
    }

    // Save to Neo4j to keep graph updated
    await saveQuestToGraph(quest);

    res.json({ success: true, quest });
  });

  app.post("/api/generate-quest", async (req, res) => {
    const { title, deadline } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY) {
        // Fallback if no API key
        return res.json({
          difficulty: "medium",
          tasks: [
            {
              id: `t_${Date.now()}_1`,
              title: "Phase 1: Conceptual Foundations",
              completed: false,
            },
            {
              id: `t_${Date.now()}_2`,
              title: "Phase 2: Practice Sprints",
              completed: false,
            },
            {
              id: `t_${Date.now()}_3`,
              title: "Phase 3: Ultimate Review",
              completed: false,
            },
          ],
        });
      }

      let deadlineContext = "";
      if (deadline) {
        deadlineContext = `The user has set a deadline for this quest: ${deadline}. Please break down the quest completely into a comprehensive step-by-step roadmap (between 4 and 8 smaller, highly actionable tasks). This full breakdown must cover everything from start to finish, motivating the user to complete small chunks of work without getting overwhelmed.`;
      } else {
        deadlineContext = `Please break down the quest completely into a comprehensive step-by-step roadmap (between 4 and 8 smaller, highly actionable tasks). This full breakdown must cover everything from start to finish, motivating the user to complete small chunks of work without getting overwhelmed.`;
      }

      const prompt = `You are an AI Game Master. The user wants to create a quest for: "${title}".
      Analyze the title and determine the difficulty ('low', 'medium', 'high').
      ${deadlineContext}
      The breakdown MUST be complete and actionable.
      Return ONLY a JSON object (without markdown code blocks) strictly in this format:
      {
        "difficulty": "low" | "medium" | "high",
        "tasks": ["Phase 1: [Actionable Step]", "Phase 2: [Actionable Step]", ...]
      }`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let text = response.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(text);

      res.json({
        difficulty: parsed.difficulty,
        tasks: parsed.tasks.map((t: string, i: number) => ({
          id: `t_${Date.now()}_${i}`,
          title: t,
          completed: false,
        })),
      });
    } catch (e) {
      console.error(e);
      // Fallback
      res.json({
        difficulty: "medium",
        tasks: [
          {
            id: `t_${Date.now()}_1`,
            title: "Phase 1: Setup",
            completed: false,
          },
          {
            id: `t_${Date.now()}_2`,
            title: "Phase 2: Execution",
            completed: false,
          },
          {
            id: `t_${Date.now()}_3`,
            title: "Phase 3: Finalization",
            completed: false,
          },
        ],
      });
    }
  });

  app.post("/api/quests/:questId/tasks/:taskId", (req, res) => {
    const { questId, taskId } = req.params;
    const { completed, inDungeon } = req.body;

    let leveledUp = false;
    const quest = db.quests.find((q) => q.id === questId);
    if (quest) {
      const task = quest.tasks.find((t) => t.id === taskId);
      if (task) {
        task.completed = completed;
        // Calculate new health
        const totalTasks = quest.tasks.length;
        const completedTasks = quest.tasks.filter((t) => t.completed).length;
        quest.health = Math.max(
          0,
          quest.maxHealth - (completedTasks / totalTasks) * quest.maxHealth,
        );

        // Give some small reward for task completion
        if (completed) {
          db.user.xp += inDungeon ? 100 : 20;
          db.user.coins += 5;
          if (inDungeon && completedTasks === totalTasks) {
            db.user.xp += 1000;
          }
          while (db.user.xp >= db.user.xpToNextLevel) {
            db.user.level += 1;
            db.user.xp -= db.user.xpToNextLevel;
            db.user.xpToNextLevel = Math.floor(db.user.xpToNextLevel * 1.5);
            db.user.coins += 50;
            leveledUp = true;
          }
        } else {
          db.user.xp -= inDungeon ? 100 : 20;
          db.user.coins -= 5;
          if (inDungeon && completedTasks + 1 === totalTasks) {
            // Was completed previously
            db.user.xp -= 1000;
          }
          if (db.user.xp < 0 && db.user.level > 1) {
            db.user.level -= 1;
            db.user.xpToNextLevel = Math.ceil(db.user.xpToNextLevel / 1.5);
            db.user.xp = db.user.xpToNextLevel + db.user.xp;
          } else if (db.user.xp < 0) {
            db.user.xp = 0;
          }
        }
      }
    }
    res.json({ success: true, quest, user: db.user, leveledUp });
  });

  app.post("/api/dungeon/enter", (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (db.user.lastDungeonDate) {
      const lastDate = new Date(db.user.lastDungeonDate);
      lastDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        db.user.streak += 1;
        db.user.lastDungeonDate = new Date().toISOString();
      } else if (diffDays > 1) {
        db.user.streak = 1;
        db.user.lastDungeonDate = new Date().toISOString();
      }
    } else {
      db.user.streak = 1;
      db.user.lastDungeonDate = new Date().toISOString();
    }
    res.json({ success: true, user: db.user });
  });

  app.post("/api/dungeon/tick", (req, res) => {
    let leveledUp = false;
    db.user.xp += 1;
    while (db.user.xp >= db.user.xpToNextLevel) {
      db.user.level += 1;
      db.user.xp -= db.user.xpToNextLevel;
      db.user.xpToNextLevel = Math.floor(db.user.xpToNextLevel * 1.5);
      db.user.coins += 50;
      leveledUp = true;
    }
    res.json({ success: true, user: db.user, leveledUp });
  });

  app.get("/api/leaderboard", (req, res) => {
    res.json({
      party: [
        {
          id: "p1",
          name: "You (Player)",
          level: db.user.level,
          xp: db.user.xp,
          isCurrentUser: true,
        },
        {
          id: "p2",
          name: "ShadowNinja",
          level: 14,
          xp: 3500,
          isCurrentUser: false,
        },
        {
          id: "p3",
          name: "TaskSlayer",
          level: 11,
          xp: 1200,
          isCurrentUser: false,
        },
        {
          id: "p4",
          name: "CodeMage",
          level: 16,
          xp: 4100,
          isCurrentUser: false,
        },
      ].sort((a, b) => (b.level === a.level ? b.xp - a.xp : b.level - a.level)),
    });
  });

  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          response:
            "I am the Game Master. You must configure the Gemini API key to hear my true voice.",
        });
      }

      const prompt = `You are an AI Game Master for a productivity RPG called LakshyaX. 
      The user is a player turning real-life tasks into quests. Deadlines are monsters.
      Keep it short, immersive, and motivating. Maximum 2 sentences.
      User says: "${message}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      res.json({ response: response.text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
