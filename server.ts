import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // In-memory data store for the demo
  const db = {
    user: {
      level: 12,
      xp: 2450,
      xpToNextLevel: 3000,
      coins: 450,
      streak: 14,
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
          { id: "t3", title: "Review & Submit", completed: false }
        ],
        rewards: { xp: 500, coins: 100 },
        riskScore: "high"
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
          { id: "t5", title: "SQL Queries", completed: false }
        ],
        rewards: { xp: 800, coins: 150 },
        riskScore: "medium"
      }
    ]
  };

  // API Routes
  app.get("/api/user", (req, res) => {
    res.json(db.user);
  });

  app.get("/api/quests", (req, res) => {
    res.json(db.quests);
  });

  app.post("/api/quests/:questId/tasks/:taskId", (req, res) => {
    const { questId, taskId } = req.params;
    const { completed } = req.body;
    
    const quest = db.quests.find(q => q.id === questId);
    if (quest) {
      const task = quest.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = completed;
        // Calculate new health
        const totalTasks = quest.tasks.length;
        const completedTasks = quest.tasks.filter(t => t.completed).length;
        quest.health = Math.max(0, quest.maxHealth - (completedTasks / totalTasks) * quest.maxHealth);
        
        // Give some small reward for task completion
        if (completed) {
          db.user.xp += 20;
          db.user.coins += 5;
        } else {
          db.user.xp -= 20;
          db.user.coins -= 5;
        }
      }
    }
    res.json({ success: true, quest, user: db.user });
  });

  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY) {
         return res.json({ response: "I am the Game Master. You must configure the Gemini API key to hear my true voice." });
      }
      
      const prompt = `You are an AI Game Master for a productivity RPG called LakshyaX. 
      The user is a player turning real-life tasks into quests. Deadlines are monsters.
      Keep it short, immersive, and motivating. Maximum 2 sentences.
      User says: "${message}"`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
