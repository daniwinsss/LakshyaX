# Project Description - LakshyaX

## 1. Problem Statement Selected
**The Last-Minute Life Saver**

*   **Background:** Students, professionals, and entrepreneurs frequently miss deadlines, assignments, meetings, bill payments, interviews, and important commitments. Existing productivity tools often rely on passive reminders that are easy to ignore and do little to help users actually complete their tasks.
*   **Challenge:** Build an AI-powered productivity companion that proactively assists users in planning, prioritizing, and completing tasks before deadlines are missed. The solution should move beyond traditional reminders and focus on helping users take meaningful action.
*   **Evaluation Focus:** The solution should demonstrate how AI can improve productivity by helping users make better decisions and complete tasks more effectively.

## 2. Solution Overview
**LakshyaX** is an AI-powered, gamified productivity companion that transforms real-world responsibilities into engaging "quests." Moving beyond passive reminders, LakshyaX utilizes an intelligent Game Master to proactively break down complex goals, schedule actionable phases, and provide personalized motivation. By combining RPG-style progression (XP, levels, Focus Dungeons) with advanced AI planning and Google Workspace integrations, it incentivizes meaningful action, tracks habits, and eliminates last-minute panic.

## 3. Key Features
1. **AI-Powered Quest Generation:** Automatically breaks down complex goals into manageable, scheduled phases using AI logic.
2. **Game Master AI Companion:** A context-aware chat assistant that guides, prioritizes, and provides actionable advice.
3. **RAG Knowledge Pipeline (Motivation Engine):** Retrieves previously completed tasks and past successes using vector embeddings to deliver highly personalized motivation when the user is struggling or procrastinating.
4. **Focus Dungeon:** A gamified Pomodoro timer/focus mode where users battle distractions and earn rewards for sustained concentration.
5. **Interactive Roadmap Graphs:** Visualizes task dependencies and project phases using dynamic D3.js node graphs.
6. **Gamified Progression System:** Users earn XP, level up, and unlock achievements by completing real-world tasks.
7. **Intelligent Task Prioritization:** AI dynamically evaluates deadlines and task complexity to suggest what to work on next.
8. **Context-Aware Reminders:** Smart nudges that adapt to the user's progress and upcoming deadlines.
9. **Social Accountability (Friends):** Collaborate or compete with peers on productivity streaks.
10. **Interactive 3D UI & Custom Cursors:** A highly immersive, game-like user interface with 3D cards and smooth animations to keep users engaged.
11. **Robust AI Fallback Mechanism:** Automatically switches between Gemini models if rate limits are hit, ensuring uninterrupted assistance.
12. **Dockerized Architecture:** Fully containerized setup ensuring the app can be seamlessly deployed and run anywhere.

## 4. Technologies Used
*   **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Motion (Animations)
*   **Backend:** Node.js, Express, TypeScript
*   **Databases & Data Visualization:** Neo4j (Graph Database), D3.js (Force Graphs), Recharts
*   **DevOps & Deployment:** Docker, Containerization

## 5. Google Technologies Utilized
*   **Google Gemini AI:** Core reasoning engine (using `gemini-2.5-flash` and `gemini-1.5-flash`) for task breakdown, autonomous planning, and Game Master chat.
*   **Google Gemini Embeddings:** (`text-embedding-004` / `gemini-embedding-2`) powering the RAG Knowledge Pipeline to fetch past motivations and context.
*   **Google Firebase:** Firebase Admin, Firestore Database, and Authentication for secure user state management and real-time syncing.
*   **Google Workspace APIs (Gmail & Google Classroom):** Integration capabilities for pulling assignments, deadlines, and important emails directly into the user's quest log.
*   **Google Cloud Run:** Serverless environment hosting the full-stack container.
