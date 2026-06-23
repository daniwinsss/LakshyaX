import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Target, Flame, Trophy, Coins, BrainCircuit, Play, CheckCircle2, Circle, AlertTriangle, MessageSquare } from 'lucide-react';
import { UserData, Quest } from '../types';

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'gm', text: string}[]>([
    { role: 'gm', text: "Welcome back, Player. The Assignment Dragon has grown stronger while you rested. You have 18 hours remaining." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(setUser);
    fetch('/api/quests').then(res => res.json()).then(setQuests);
  }, []);

  const handleTaskToggle = async (questId: string, taskId: string, currentStatus: boolean) => {
    const res = await fetch(`/api/quests/${questId}/tasks/${taskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus })
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setQuests(prev => prev.map(q => q.id === questId ? data.quest : q));
      
      // GM comment on task completion
      if (!currentStatus) {
        setChatHistory(prev => [...prev, { role: 'gm', text: `Critical hit! You dealt damage to ${data.quest.title}. Keep pushing.`}]);
      }
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const msg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'gm', text: data.response }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'gm', text: "The connection to the ethereal plane was disrupted." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-background flex items-center justify-center">Loading realm...</div>;

  const xpPercentage = (user.xp / user.xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden h-screen">
      
      {/* Sidebar - Player Stats */}
      <aside className="w-full md:w-80 border-r border-gray-100 bg-white/50 p-6 flex flex-col gap-8 shrink-0 overflow-y-auto hidden md:flex">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
            <Sword size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Daniyal</h2>
            <div className="text-sm font-medium text-gray-500">Level {user.level} Paladin</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-mono font-medium">
            <span className="text-gray-500">XP</span>
            <span>{user.xp} / {user.xpToNextLevel}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 flex flex-col items-center justify-center gap-2">
            <Flame className="text-orange-500" />
            <div className="text-2xl font-bold">{user.streak}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Day Streak</div>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center gap-2">
            <Coins className="text-accent" />
            <div className="text-2xl font-bold">{user.coins}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Gold</div>
          </div>
        </div>

        <div className="glass-card p-5 mt-auto">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-primary" size={18} />
            <h3 className="font-semibold">Focus Dungeon</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Enter a 25-min deep work dungeon for 2x XP.</p>
          <button 
            onClick={() => {
              setChatHistory(prev => [...prev, { role: 'gm', text: "Focus Dungeon initialized. The gates close behind you. Complete your tasks to escape."}]);
            }}
            className="w-full py-3 bg-foreground text-white rounded-xl font-medium hover:bg-foreground/90 transition-all flex justify-center items-center gap-2"
          >
            <Play size={16} /> Enter Dungeon
          </button>
        </div>

        <div className="glass-card p-5 border border-red-100 bg-red-50/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={18} />
            <h3 className="font-semibold text-red-900">Rescue Mode</h3>
          </div>
          <p className="text-xs text-red-700/80 mb-4 font-medium">Simulation: Trigger an AI schedule rebuild when failure is imminent.</p>
          <button 
            onClick={() => {
              setChatHistory(prev => [...prev, { role: 'gm', text: "🚨 RESCUE MODE ACTIVATED! Probability of failure exceeded threshold. Reprioritizing tasks and generating recovery strategy..."}]);
              setTimeout(() => {
                setChatHistory(prev => [...prev, { role: 'gm', text: "Strategy generated: Dropped non-essential side quests. Created 'Emergency Sprint' for the Assignment Dragon."}]);
              }, 2500);
            }}
            className="w-full py-2.5 bg-white text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-50 transition-all text-sm"
          >
            Trigger Rescue
          </button>
        </div>
      </aside>

      {/* Main Content - Quests & Bosses */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-50/30">
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Active Quests</h1>
            <p className="text-gray-500 font-medium text-sm">2 Bosses, 1 Daily remaining.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setChatHistory(prev => [...prev, { role: 'gm', text: "Scanning your Gmail and Calendar... I've detected a new 'System Design Interview' threat on Thursday. Adding it to your quest log."}]);
                setTimeout(() => {
                  setQuests(prev => [{
                    id: "3",
                    title: "System Design Interview",
                    type: "boss",
                    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                    health: 100,
                    maxHealth: 100,
                    tasks: [
                      { id: "t6", title: "Review CAP Theorem", completed: false },
                      { id: "t7", title: "Mock Interview", completed: false }
                    ],
                    rewards: { xp: 1500, coins: 300 },
                    riskScore: "high"
                  }, ...prev])
                }, 2000);
              }}
              className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
              Scan Inbox
            </button>
            <div className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium shadow-sm flex items-center gap-2">
              <BrainCircuit size={16} className="text-primary" />
              Prod Score: {user.productivityScore}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Completion Rate', value: '88%', trend: '+5%' },
            { label: 'Focus Time', value: '24h 12m', trend: '+2h' },
            { label: 'Survival Rate', value: '95%', trend: '+1%' },
            { label: 'Bosses Defeated', value: '14', trend: 'Epic' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 flex flex-col justify-center">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs font-medium text-green-500 mb-1">{stat.trend}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 max-w-4xl">
          <AnimatePresence>
            {quests.map(quest => (
              <motion.div 
                key={quest.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-6 border-l-4 ${quest.type === 'boss' ? 'border-l-red-500' : 'border-l-primary'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold">{quest.title}</h3>
                      {quest.type === 'boss' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide">
                          Boss Battle
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <AlertTriangle size={14} className={quest.riskScore === 'high' ? 'text-red-500' : 'text-orange-500'} />
                      Deadline: {new Date(quest.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  
                  {quest.type === 'boss' && (
                    <div className="text-right">
                      <div className="text-xs font-mono font-medium text-gray-500 mb-1">MONSTER HP</div>
                      <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden flex justify-end">
                         <motion.div 
                           animate={{ width: `${(quest.health / quest.maxHealth) * 100}%` }}
                           className="h-full bg-red-500 rounded-full origin-right"
                         />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {quest.tasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => handleTaskToggle(quest.id, task.id, task.completed)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${task.completed ? 'bg-gray-50' : 'hover:bg-gray-50 border border-transparent hover:border-gray-100'}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="text-green-500 shrink-0" />
                      ) : (
                        <Circle className="text-gray-300 shrink-0" />
                      )}
                      <span className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* AI Game Master Panel */}
      <aside className="w-full md:w-96 border-l border-gray-100 bg-white flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
              <BrainCircuit className="text-primary" size={20} />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-sm">Game Master</h3>
            <p className="text-xs text-gray-500 font-medium">Gemini 2.5 Pro</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`text-xs text-gray-400 mb-1 font-medium ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                {msg.role === 'user' ? 'You' : 'Game Master'}
              </div>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-foreground text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm font-medium'}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
               <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
               </div>
             </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <form onSubmit={handleChatSubmit} className="relative">
            <input 
              type="text" 
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              placeholder="Ask the Game Master..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
            />
            <button type="submit" disabled={isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-foreground transition-colors disabled:opacity-50">
              <MessageSquare size={18} />
            </button>
          </form>
        </div>
      </aside>

    </div>
  );
}
