import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Square,
  CheckCircle2,
  Circle,
  Flame,
  Target,
} from "lucide-react";
import { Quest, UserData } from "../types";
import { playClickSfx, playSuccessSfx } from "../utils/audio";

export default function FocusDungeon() {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [user, setUser] = useState<UserData | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then(setUser);
    fetch("/api/quests")
      .then((res) => res.json())
      .then(data => {
        if (Array.isArray(data)) setQuests(data);
      });
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);

        fetch("/api/dungeon/tick", { method: "POST" })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setUser(data.user);
              if (data.leveledUp) {
                setShowLevelUp(true);
                playSuccessSfx();
                setTimeout(() => setShowLevelUp(false), 3000);
              }
            }
          });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playSuccessSfx();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    if (!selectedQuestId) return;
    playClickSfx();
    const res = await fetch(`/api/quests/${selectedQuestId}/tasks/${taskId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !currentStatus, inDungeon: true }),
    });
    const data = await res.json();
    if (data.success && data.quest) {
      setUser(data.user);
      setQuests((prev) =>
        prev.map((q) => (q.id === selectedQuestId ? data.quest : q)),
      );
      if (!currentStatus) {
        // if we just completed it
        playSuccessSfx();
      }
      if (data.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
      
      if (data.quest.health <= 0 || data.quest.tasks.every((t: any) => t.completed)) {
        setIsActive(false);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500); // give a little time to see the checkmark/level up before exiting
      }
    }
  };

  const selectedQuest = quests.find((q) => q.id === selectedQuestId);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#fdfcf9] font-sans flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background ambient fx */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#0a0908]/80 to-[#0a0908] pointer-events-none" />

      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <button
          onClick={() => {
            playClickSfx();
            navigate("/dashboard");
          }}
          className="flex items-center gap-2 text-[#b8b3a0] hover:text-white transition-colors text-sm font-bold"
        >
          <ArrowLeft size={16} /> Retreat
        </button>
        {user && (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-red-500">
                <Flame size={14} />
                <span className="text-sm font-bold font-mono">{user.streak}</span>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${(user.streak % 7 > i || (user.streak > 0 && user.streak % 7 === 0)) ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'bg-[#1a1711] border border-white/5'}`} />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
                Level {user.level}
              </div>
              <div className="w-32 h-1.5 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-xl font-bold font-mono text-[#fdfcf9]">
              {user.xp.toLocaleString()} XP
            </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 flex flex-col items-center w-full max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-red-500 mb-4 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
            <Flame size={16} />
            <span className="font-bold text-sm tracking-widest uppercase">
              Focus Dungeon
            </span>
          </div>
          <div className="text-8xl md:text-9xl font-black font-mono tracking-tighter text-[#fdfcf9] drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            {formatTime(timeLeft)}
          </div>
        </motion.div>

        {!isActive && timeLeft === 25 * 60 && !selectedQuestId && (
          <div className="w-full bg-[#16130e] border border-red-500/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4 text-[#b8b3a0]">
              Select a Quest to Enter
            </h2>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {quests
                .filter((q) => q.health > 0)
                .map((quest) => (
                  <button
                    key={quest.id}
                    onClick={() => {
                      playClickSfx();
                      setSelectedQuestId(quest.id);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#211d15]/50 hover:bg-[#211d15] hover:border-red-500/30 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="text-red-500" size={18} />
                      <span className="font-bold">{quest.title}</span>
                    </div>
                    <span className="text-xs font-bold text-[#b8b3a0] bg-black/30 px-2 py-1 rounded">
                      {quest.tasks.filter((t) => t.completed).length}/
                      {quest.tasks.length} Tasks
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {selectedQuestId && selectedQuest && (
          <div className="w-full flex flex-col gap-6">
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  playClickSfx();
                  if (!isActive) {
                    const res = await fetch("/api/dungeon/enter", { method: "POST" });
                    const data = await res.json();
                    if (data.success) setUser(data.user);
                  }
                  setIsActive(!isActive);
                }}
                className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] text-lg"
              >
                {isActive ? (
                  <>
                    <Square size={20} fill="currentColor" /> Pause Dungeon
                  </>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" />{" "}
                    {timeLeft < 25 * 60 ? "Resume" : "Enter Dungeon"}
                  </>
                )}
              </button>
              {!isActive && (
                <button
                  onClick={() => {
                    playClickSfx();
                    setSelectedQuestId(null);
                  }}
                  className="px-6 py-4 bg-[#211d15] hover:bg-[#2c271c] text-[#b8b3a0] rounded-xl font-bold transition-all border border-white/5"
                >
                  Change Quest
                </button>
              )}
            </div>

            <div className="bg-[#16130e]/80 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-end mb-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-black text-2xl text-red-500">
                    {selectedQuest.title}
                  </h3>
                  <p className="text-sm font-semibold text-[#b8b3a0] mt-1">
                    +100 XP per sub-task | +1000 XP on clear
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black font-display text-[#fdfcf9]">
                    {Math.round(selectedQuest.health)}%
                  </div>
                  <div className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">
                    Boss HP
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {selectedQuest.tasks?.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${task.completed ? "bg-red-500/10 border-red-500/30 opacity-75" : "bg-[#211d15]/50 border-white/5 hover:bg-[#211d15]"} transition-all`}
                  >
                    <button
                      onClick={() => handleTaskToggle(task.id, task.completed)}
                      className={`flex-shrink-0 transition-colors ${task.completed ? "text-red-500" : "text-[#b8b3a0] hover:text-red-400"}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>
                    <span
                      className={`font-semibold flex-1 ${task.completed ? "text-[#b8b3a0] line-through" : "text-[#fdfcf9]"}`}
                    >
                      {task.title}
                    </span>
                    {task.completed && (
                      <span className="text-xs font-bold text-red-500">
                        +100 XP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Level Up Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="text-6xl md:text-8xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 drop-shadow-2xl mb-4">
                LEVEL UP!
              </div>
              <div className="text-2xl font-bold text-white tracking-widest">
                YOU ARE NOW LEVEL {user?.level}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
