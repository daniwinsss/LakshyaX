import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import {
  initNeo4j,
  saveQuestToGraph,
  fetchAllQuestsGraph,
  findSimilarQuests,
} from "./src/db/neo4j";

import { initFirebase, getFirestoreDb } from "./src/db/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { calculateSM2 } from "./src/utils/sm2";

import { UserData, Quest } from "./src/types";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB clients
  initNeo4j();
  initFirebase();


  // Initialize Gemini
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
    }
  }

  // In-memory data store for the demo
  let db: { user: UserData; quests: Quest[] } = {
    user: {
      level: 12,
      xp: 2990,
      xpToNextLevel: 3000,
      coins: 450,
      streak: 14,
      lastDungeonDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      productivityScore: 92,
      friends: [],
      friendRequests: ["p2"], // Simulated incoming request
      sentRequests: [],
    },
    quests: [],
  };

  const firestoreDb = getFirestoreDb();
  if (firestoreDb) {
    try {
      const userDocRef = doc(firestoreDb, 'app_data', 'user');
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as typeof db.user;
        db.user = {
          ...data,
          friends: data.friends || [],
          friendRequests: data.friendRequests || ["p2"],
          sentRequests: data.sentRequests || [],
        };
      } else {
        await setDoc(userDocRef, db.user);
      }

      const questsColRef = collection(firestoreDb, 'quests');
      const questsCol = await getDocs(questsColRef);
      if (!questsCol.empty) {
        db.quests = questsCol.docs.map((d: any) => ({
          ...d.data(),
          id: d.id,
          tasks: d.data().tasks || []
        })) as typeof db.quests;
      } else {
        for (const q of db.quests) {
          await setDoc(doc(firestoreDb, 'quests', q.id), q);
        }
      }

      // Sync all loaded quests to Neo4j
      for (const q of db.quests) {
        await saveQuestToGraph(q);
      }
    } catch (e) {
      console.error("Failed to load from Firestore", e);
    }
  }

  const mockUsers = [
    { id: "p2", name: "ShadowNinja", level: 14, xp: 3500 },
    { id: "p3", name: "TaskSlayer", level: 11, xp: 1200 },
    { id: "p4", name: "CodeMage", level: 16, xp: 4100 },
    { id: "p5", name: "ByteWarrior", level: 8, xp: 800 }
  ];

  // API Routes
  app.get("/api/users", (req, res) => {
    res.json(mockUsers);
  });

  app.post("/api/friends/request", async (req, res) => {
    const { userId } = req.body;
    if (!db.user.sentRequests.includes(userId)) {
      db.user.sentRequests.push(userId);
      const firestoreDb = getFirestoreDb();
      if (firestoreDb) {
        try {
          await setDoc(doc(firestoreDb, 'app_data', 'user'), db.user);
        } catch (e) {
          console.error(e);
        }
      }
    }
    res.json({ success: true, user: db.user });
  });

  app.post("/api/friends/accept", async (req, res) => {
    const { userId } = req.body;
    db.user.friendRequests = db.user.friendRequests.filter(id => id !== userId);
    if (!db.user.friends.includes(userId)) {
      db.user.friends.push(userId);
    }
    const firestoreDb = getFirestoreDb();
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'app_data', 'user'), db.user);
      } catch (e) {
        console.error(e);
      }
    }
    res.json({ success: true, user: db.user });
  });

  app.post("/api/friends/reject", async (req, res) => {
    const { userId } = req.body;
    db.user.friendRequests = db.user.friendRequests.filter(id => id !== userId);
    const firestoreDb = getFirestoreDb();
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'app_data', 'user'), db.user);
      } catch (e) {
        console.error(e);
      }
    }
    res.json({ success: true, user: db.user });
  });

  app.get("/api/user", async (req, res) => {
    // Recalculate streak based on lastDungeonDate
    if (db.user.lastDungeonDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = new Date(db.user.lastDungeonDate);
      lastDate.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      // If more than 1 day has passed without entering the dungeon, reset streak
      if (diffDays > 1) {
        db.user.streak = 0;
        const firestoreDb = getFirestoreDb();
        if (firestoreDb) {
          try {
             await setDoc(doc(firestoreDb, 'app_data', 'user'), db.user);
          } catch (e) {
             console.error(e);
          }
        }
      }
    }
    res.json(db.user);
  });

  app.get("/api/quests", async (req, res) => {
    try {
      const now = new Date();
      let updatedQuests = false;
      
      // Check for daily SM2 quests that are due and reset them
      db.quests.forEach(q => {
        if (q.type === 'daily' && q.sm2Data) {
          const nextReview = new Date(q.sm2Data.nextReviewDate);
          if (q.health <= 0 && now >= nextReview) {
            // Due for review! Reset health and tasks
            q.health = q.maxHealth;
            q.tasks.forEach(t => t.completed = false);
            // Optionally update deadline to end of day today
            const newDeadline = new Date();
            newDeadline.setHours(23, 59, 59, 999);
            q.deadline = newDeadline.toISOString();
            updatedQuests = true;
          }
        }
      });

      if (updatedQuests) {
        const firestoreDb = getFirestoreDb();
        if (firestoreDb) {
          try {
            for (const q of db.quests) {
              await setDoc(doc(firestoreDb, 'quests', q.id), q);
            }
          } catch (e) {
            console.error('Error saving updated quests to Firestore', e);
          }
        }
      }

      const graphQuests = await fetchAllQuestsGraph();
      let questsToReturn = db.quests;
      if (graphQuests && graphQuests.length > 0) {
        questsToReturn = db.quests.map((q) => {
          const graphNode = graphQuests.find((g) => g.id === q.id);
          if (graphNode) {
            return { ...q, dependencies: graphNode.dependencies };
          }
          return q;
        });
      }
      
      // Filter out completed SM2 quests that are not due yet so they disappear from the list
      questsToReturn = questsToReturn.filter(q => {
        if (q.type === 'daily' && q.sm2Data && q.health <= 0) {
          const nextReview = new Date(q.sm2Data.nextReviewDate);
          if (now < nextReview) {
            return false; // Hide if completed and not due
          }
        }
        return true;
      });

      res.json(questsToReturn);
    } catch (error) {
      console.error(error);
      res.json(db.quests);
    }
  });

  app.post("/api/quests", async (req, res) => {
    try {
      const quest = req.body;
      if (!quest.id) {
        quest.id = String(db.quests.length + 1) + "_" + Date.now();
      }
      let embedding: number[] | undefined = undefined;
      if (ai && process.env.GEMINI_API_KEY) {
        try {
          const textToEmbed = `Quest Title: ${quest.title}. Tasks: ${quest.tasks?.map((t: any) => t.title).join(", ")}`;
          const embedRes = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: textToEmbed,
            config: { outputDimensionality: 768 }
          });
          embedding = embedRes.embeddings[0].values;
          quest.embedding = embedding;
        } catch (e: any) {
          if (e.status === 503 || e.message?.includes("503")) {
            console.log("Gemini API is busy (503), skipping embedding generation for quest.");
          } else {
            console.error("Failed to generate embedding for quest", e.message || e);
          }
        }
      }

      const existingIndex = db.quests.findIndex((q) => q.id === quest.id);
      if (existingIndex > -1) {
        db.quests[existingIndex] = quest;
      } else {
        db.quests.push(quest);
      }

      if (firestoreDb) {
        await setDoc(doc(firestoreDb, 'quests', quest.id), quest);
      }

      // Save to Neo4j to keep graph updated
      await saveQuestToGraph(quest, embedding);

      res.json({ success: true, quest });
    } catch (error) {
      console.error("Error saving quest:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.post("/api/generate-quest", async (req, res) => {
    const { title, deadline } = req.body;
    try {
      if (!ai || !process.env.GEMINI_API_KEY) {
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
        deadlineContext = `The user has set a deadline for this quest: ${deadline}. Please break down the quest completely into a comprehensive step-by-step roadmap (between 4 and 8 smaller, highly actionable tasks).`;
      } else {
        deadlineContext = `Please break down the quest completely into a comprehensive step-by-step roadmap (between 4 and 8 smaller, highly actionable tasks).`;
      }

      const existingContext = req.body.existingQuests ? `\nThe user currently has these active quests: ${JSON.stringify(req.body.existingQuests)}.\nIf this new quest logically benefits from, builds upon, or depends on any of these existing quests being completed first (e.g., studying for an exam helps with a viva), list their IDs in the 'dependencies' array. Connect them if there is a logical progression.` : "";

      const prompt = `You are an AI Game Master. The user wants to create a quest for: "${title}".
      Analyze the title and determine the difficulty ('low', 'medium', 'high').
      ${deadlineContext}${existingContext}
      The breakdown MUST be complete and actionable.
      Return ONLY a JSON object (without markdown code blocks) strictly in this format:
      {
        "difficulty": "low" | "medium" | "high",
        "tasks": ["Phase 1: [Actionable Step]", "Phase 2: [Actionable Step]", ...],
        "dependencies": ["<quest_id_1>", ...]
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
        dependencies: parsed.dependencies || [],
        tasks: parsed.tasks.map((t: string, i: number) => ({
          id: `t_${Date.now()}_${i}`,
          title: t,
          completed: false,
        })),
      });
    } catch (e: any) {
      if (e.status === 503 || e.message?.includes("503")) {
        console.log("Gemini API is busy (503), using fallback quest generation.");
      } else {
        console.error("Gemini API error during quest generation:", e.message || e);
      }
      // Fallback
      res.json({
        difficulty: "medium",
        dependencies: [],
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

  app.delete("/api/quests/:questId", async (req, res) => {
    const { questId } = req.params;
    
    const index = db.quests.findIndex(q => q.id === questId);
    if (index === -1) return res.status(404).json({ error: 'Quest not found' });
    
    db.quests.splice(index, 1);
    
    const firestoreDb = getFirestoreDb();
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, 'quests', questId));
      } catch (err) {
        console.error("Failed to sync to firestore", err);
      }
    }
    
    res.json({ success: true });
  });

  app.post("/api/quests/:questId/rate", async (req, res) => {
    const { questId } = req.params;
    const { quality } = req.body;
    
    const quest = db.quests.find(q => q.id === questId);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });
    
    if (quest.sm2Data) {
      quest.sm2Data = calculateSM2(quality, quest.sm2Data);
      
      // Update deadline based on spaced repetition next review date
      quest.deadline = quest.sm2Data.nextReviewDate;
      
      // Reset health and tasks for the next repetition
      quest.health = quest.maxHealth;
      quest.tasks.forEach(t => {
        t.completed = false;
      });
      
      const firestoreDb = getFirestoreDb();
      if (firestoreDb) {
        try {
          await setDoc(doc(firestoreDb, 'quests', quest.id), quest);
        } catch (e) {
          console.error('Failed to save rated quest to Firestore:', e);
        }
      }
    }
    
    res.json({ success: true, quest });
  });

  app.post("/api/quests/:questId/tasks/:taskId", async (req, res) => {
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
      if (firestoreDb) {
        await setDoc(doc(firestoreDb, 'quests', quest.id), quest);
        await setDoc(doc(firestoreDb, 'app_data', 'user'), db.user);
      }
    }
    res.json({ success: true, quest, user: db.user, leveledUp });
  });

  app.post("/api/dungeon/enter", async (req, res) => {
    try {
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
      if (firestoreDb) {
        await setDoc(doc(firestoreDb, 'app_data', 'user'), db.user);
      }
      res.json({ success: true, user: db.user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.post("/api/dungeon/tick", async (req, res) => {
    try {
      let leveledUp = false;
      db.user.xp += 1;
      while (db.user.xp >= db.user.xpToNextLevel) {
        db.user.level += 1;
        db.user.xp -= db.user.xpToNextLevel;
        db.user.xpToNextLevel = Math.floor(db.user.xpToNextLevel * 1.5);
        db.user.coins += 50;
        leveledUp = true;
      }
      if (firestoreDb) {
        await setDoc(doc(firestoreDb, 'app_data', 'user'), db.user);
      }
      res.json({ success: true, user: db.user, leveledUp });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  app.get("/api/leaderboard", (req, res) => {
    const party = [
      {
        id: "p1",
        name: "You (Player)",
        level: db.user.level,
        xp: db.user.xp,
        isCurrentUser: true,
      },
      ...mockUsers
        .filter(u => db.user.friends?.includes(u.id))
        .map(u => ({ ...u, isCurrentUser: false }))
    ].sort((a, b) => (b.level === a.level ? b.xp - a.xp : b.level - a.level));
    
    res.json({ party });
  });

  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    try {
      if (!ai || !process.env.GEMINI_API_KEY) {
        return res.json({
          response:
            "I am the Game Master. You must configure the Gemini API key to hear my true voice.",
        });
      }

      let contextStr = "";
      try {
        const embedRes = await ai.models.embedContent({
          model: "gemini-embedding-2",
          contents: message,
          config: { outputDimensionality: 768 }
        });
        const msgEmbedding = embedRes.embeddings[0].values;
        const similarQuests = await findSimilarQuests(msgEmbedding, 3);
        if (similarQuests && similarQuests.length > 0) {
          contextStr = `\n\nContext - The player has worked on these similar quests before:\n${similarQuests.map(q => `- ${q.title} (${q.type})`).join("\n")}\nYou can use this context to provide more personalized advice or reference their past actions.`;
        }
      } catch (e) {
        console.error("RAG retrieval failed", e);
      }

      const prompt = `You are an AI Game Master for a productivity RPG called LakshyaX. 
      The user is a player turning real-life tasks into quests. Deadlines are monsters.
      Keep it short, immersive, and motivating. Maximum 2 sentences.
      User says: "${message}"${contextStr}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      res.json({ response: response.text });
    } catch (e: any) {
      console.error(e);
      res.json({ response: "The realm's communication network is currently overwhelmed (high traffic). Please try again shortly." });
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
