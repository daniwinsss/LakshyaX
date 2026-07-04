# LakshyaX - Productivity RPG

Welcome to **LakshyaX**, a gamified productivity application that turns your real-life tasks into epic quests, and deadlines into monsters to be conquered! Powered by Google's Gemini AI, this app features an intelligent "Game Master" that guides you, breaks down your goals, and remembers your journey.

## 🌟 Features

* **AI-Powered Quest Generation:** Simply enter a task (e.g., "Study for finals"), and the AI Game Master will automatically determine its difficulty and break it down into actionable sub-tasks (phases).
* **Game Master Chat:** A personalized AI chat companion that motivates you. It uses RAG (Retrieval-Augmented Generation) and embeddings to remember your active and past quests, providing context-aware advice.
* **Gamified Progression:** Earn XP (Experience Points) by completing tasks and quests. Level up as you conquer your real-world goals!
* **Fallback Mechanisms:** Built-in resilience. If the AI service reaches a rate limit or a specific model is unavailable, the system automatically falls back to alternative models or offline mode to ensure your productivity never stops.

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS, Vite
* **Backend:** Node.js, Express, TypeScript
* **AI Integration:** `@google/genai` SDK (Gemini 2.5 Flash, Gemini 1.5 Flash, Gemini Embeddings)
* **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine.

### Installation

1. **Clone the repository or download the project files.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root of your project. You must add your Gemini API key. 
   *(Note: Based on recent configurations, the key variable is named `GEMINII_API_KEY`)*

   ```env
   GEMINII_API_KEY="your_actual_gemini_api_key_here"
   ```

### Running the App

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Docker Support

You can also run the application using Docker:

1. **Build the Docker image:**
   ```bash
   docker build -t lakshyax .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 -e GEMINII_API_KEY="your_api_key" lakshyax
   ```

The application will be accessible at `http://localhost:3000`.

## ⚙️ How the AI Works

* **Quest Breakdown:** Uses `gemini-2.5-flash` (with fallbacks to `gemini-2.0-flash`, `gemini-1.5-flash`, etc.) to parse your goal and generate a structured JSON roadmap.
* **Memory & Context:** When you create a quest, the app generates vector embeddings (using `gemini-embedding-2` or `text-embedding-004`). When you talk to the Game Master, it compares your message against your quest history to provide highly personalized, immersive responses.

## 🛡️ License
This project is open-source and free to use for personal productivity enhancements.
