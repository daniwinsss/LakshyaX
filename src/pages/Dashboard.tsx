import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sword, Target, Flame, Coins, BrainCircuit, Play, CheckCircle2, Circle, AlertTriangle, MessageSquare, Volume2, ArrowLeft, Shield, Users, UserPlus } from 'lucide-react';
import { Joyride, Step, TooltipRenderProps } from 'react-joyride';
import { UserData, Quest } from '../types';
import TaskCard from '../components/TaskCard';
import { D3ForceGraph } from '../components/D3ForceGraph';
import { playClickSfx, playSuccessSfx, playQuestSpawnSfx } from '../utils/audio';

const CustomTooltip = ({
  index,
  step,
  tooltipProps,
  primaryProps,
  backProps,
  skipProps,
  isLastStep,
}: TooltipRenderProps) => (
  <div
    {...tooltipProps}
    className="bg-[#12100d] border border-yellow-500/30 p-6 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.25)] max-w-sm text-left relative overflow-hidden"
  >
    {/* Background Grid Pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
    
    {step.title && (
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 text-yellow-500">
          <BrainCircuit size={16} />
        </div>
        <h3 className="font-display font-black text-xl text-yellow-400 tracking-tight">
          {step.title}
        </h3>
      </div>
    )}
    <div className="text-[#b8b3a0] text-sm leading-relaxed mb-6 font-medium">
      {step.content}
    </div>
    <div className="flex items-center justify-between">
      <button
        {...skipProps}
        className="text-xs font-bold text-[#b8b3a0] hover:text-[#fdfcf9] transition-colors"
      >
        Skip Tutorial
      </button>
      <div className="flex gap-2">
        {index > 0 && (
          <button
            {...backProps}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#b8b3a0] bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
          >
            Back
          </button>
        )}
        <button
          {...primaryProps}
          className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-950/50 flex items-center gap-2"
        >
          {isLastStep ? 'Start Playing' : 'Next'}
          {!isLastStep && <Play size={12} className="text-amber-900" />}
        </button>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'gm', text: string}[]>([
    { role: 'gm', text: "Welcome back, Player. The Assignment Dragon has grown stronger while you rested. You have 18 hours remaining." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [activeView, setActiveView] = useState<'quests' | 'roadmap'>('quests');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [party, setParty] = useState<{id: string, name: string, level: number, xp: number, isCurrentUser: boolean}[]>([]);
  
  const [runTour, setRunTour] = useState(false);
  const tourSteps: Step[] = [
    {
      target: '.tour-add-quest',
      title: 'Summon Quests',
      content: 'Start by summoning your quests here. Enter any massive task, and the AI will auto-break it into boss fights and side-quests!',
      disableBeacon: true,
      placement: 'bottom',
      spotlightPadding: 10,
    },
    {
      target: '.tour-game-master',
      title: 'Game Master AI',
      content: 'This is your Game Master AI. It monitors your progress and contextually adapts the narrative to keep you motivated.',
      placement: 'left',
      spotlightPadding: 0,
    },
    {
      target: '.tour-focus-dungeon',
      title: 'Focus Dungeon',
      content: 'Enter the Focus Dungeon to start a timed work session. Defeating monsters here earns you huge XP multipliers!',
      placement: 'top',
      spotlightPadding: 10,
    },
    {
      target: '.tour-streak',
      title: 'Streaks & Rewards',
      content: 'Maintain your daily focus streak to multiply your XP gains. Keep the flame alive!',
      placement: 'top',
      spotlightPadding: 10,
    },
    {
      target: '.tour-rivals',
      title: 'Rivals Leaderboard',
      content: 'Compete against other players. Steal their ranks by completing more quests and surviving longer in the dungeon.',
      placement: 'left',
      spotlightPadding: 10,
    },
    {
      target: '.tour-rescue-mode',
      title: 'Rescue Mode',
      content: 'If you\'re failing, trigger Rescue Mode! The Game Master will automatically drop non-essential tasks and build an emergency sprint.',
      placement: 'top',
      spotlightPadding: 10,
    }
  ];

  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(setUser);
    fetch('/api/quests').then(res => res.json()).then(setQuests);
    fetch('/api/leaderboard').then(res => res.json()).then(data => setParty(data.party));
    
    // Check if we should start the tour
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('tour') === 'true') {
      setRunTour(true);
    }
  }, [location.search]);

  const handleTaskToggle = async (questId: string, taskId: string, currentStatus: boolean) => {
    // Play satisfying success chime if marking complete
    if (!currentStatus) {
      playSuccessSfx();
    } else {
      playClickSfx();
    }

    const res = await fetch(`/api/quests/${questId}/tasks/${taskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus })
    });
    const data = await res.json();
    if (data.success && data.quest) {
      setUser(data.user);
      setQuests(prev => prev.map(q => q && q.id === questId ? data.quest : q).filter(Boolean));
      fetch('/api/leaderboard').then(res => res.json()).then(data => setParty(data.party));
      
      if (data.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
        setChatHistory(prev => [...prev, { role: 'gm', text: `🌟 LEVEL UP! You have ascended to Level ${data.user.level}!`}]);
      } else if (!currentStatus) {
        setChatHistory(prev => [...prev, { role: 'gm', text: `⚔️ Critical hit! You dealt damage to ${data.quest.title}. XP and Gold awarded.`}]);
      }
    }
  };

  const handleCreateQuest = async (title: string, deadline?: string) => {
    playQuestSpawnSfx();
    setIsGeneratingQuest(true);
    setChatHistory(prev => [...prev, { role: 'gm', text: `✨ Analyzing "${title}" to generate customized multi-phase Quest chain...`}]);
    
    try {
      const genResponse = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, deadline })
      });
      const generated = await genResponse.json();
      const difficulty = generated.difficulty || 'medium';
      
      const newQuest: Quest = {
        id: String(Date.now()),
        title: title,
        type: difficulty === 'high' ? 'boss' : 'quest',
        deadline: deadline || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        health: 100,
        maxHealth: 100,
        tasks: generated.tasks || [],
        rewards: { xp: difficulty === 'high' ? 800 : 450, coins: difficulty === 'high' ? 200 : 90 },
        riskScore: difficulty
      };
      
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuest)
      });
      const result = await response.json();
      if (result.success) {
        setQuests(prev => [result.quest, ...prev.filter(Boolean)]);
        setChatHistory(prev => [...prev, { role: 'gm', text: `⚔️ Quest Chain registered! "${title}" has been spawned with ${newQuest.tasks.length} phases at ${difficulty.toUpperCase()} difficulty.`}]);
      }
    } catch (err) {
      console.error("Failed to sync quest to server:", err);
      setChatHistory(prev => [...prev, { role: 'gm', text: `⚔️ Failed to generate quest for "${title}".`}]);
    } finally {
      setIsGeneratingQuest(false);
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
      
      if (isVoiceActive && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 1.0;
        utterance.pitch = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'gm', text: "The connection to the ethereal plane was disrupted." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      setChatHistory(prev => [...prev, { role: 'gm', text: "🎙️ Ethereal Voice activated. I will now narrate the path of your destiny." }]);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0a07] text-yellow-500 flex flex-col items-center justify-center gap-4 font-mono font-bold">
        <Sword className="animate-bounce" size={32} />
        <span className="tracking-widest">LOADING REALM CONTROLS...</span>
      </div>
    );
  }

  const xpPercentage = (user.xp / user.xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-[#0c0a07] text-[#fdfcf9] flex flex-col md:flex-row overflow-hidden h-screen font-sans relative">
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        spotlightClicks={true}
        tooltipComponent={CustomTooltip}
        styles={{
          options: {
            arrowColor: '#12100d',
          }
        }}
        callback={(data) => {
          const { status } = data;
          if (status === 'finished' || status === 'skipped') {
            setRunTour(false);
            // Remove tour query param
            const searchParams = new URLSearchParams(location.search);
            if (searchParams.has('tour')) {
              searchParams.delete('tour');
              navigate({ search: searchParams.toString() }, { replace: true });
            }
          }
        }}
      />
      {/* Level Up Animation Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="relative flex flex-col items-center justify-center p-16 bg-gradient-to-b from-[#211d15] to-[#0c0a07] border border-yellow-500/30 rounded-3xl shadow-[0_0_150px_rgba(234,179,8,0.15)]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(234,179,8,0.1),transparent)] rounded-3xl pointer-events-none"
              />
              <div className="relative z-10 flex flex-col items-center">
                <Flame className="text-yellow-500 mb-6" size={80} strokeWidth={1.5} />
                <h1 className="text-6xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 mb-4 tracking-tighter">LEVEL UP!</h1>
                <p className="text-yellow-500/80 text-xl uppercase tracking-[0.3em] font-bold">You are now Level {user.level}</p>
                <div className="mt-8 flex items-center gap-4 text-[#b8b3a0]">
                  <Coins className="text-yellow-500" size={24} />
                  <span className="font-mono text-lg">+50 Bonus Gold</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Grid with Premium Yellow/Gold Tint */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#eab30807_1px,transparent_1px),linear-gradient(to_bottom,#eab30807_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none z-0"></div>
      
      {/* Atmospheric radial spotlight mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0c0a07_95%)] pointer-events-none z-0"></div>

      {/* Premium Floating Glowing Light-Orbs (Atmosphere) */}
      <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-yellow-600/10 via-amber-500/5 to-transparent blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[30%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-amber-500/5 via-yellow-600/5 to-transparent blur-[120px] pointer-events-none z-0"></div>

      {/* Sidebar - Player Stats */}
      <aside className="w-full md:w-80 border-r border-yellow-500/10 bg-[#16130e]/95 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto hidden md:flex relative z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              playClickSfx();
              navigate('/');
            }} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b8b3a0]/70 hover:text-yellow-400 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Town
          </button>
          <button 
            onClick={() => {
              playClickSfx();
              toggleVoice();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isVoiceActive 
                ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 animate-pulse' 
                : 'border-yellow-500/10 bg-white/5 text-[#b8b3a0]/70 hover:bg-white/10'
            }`}
            title="Toggle Voice Game Master"
          >
            <Volume2 size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-black shadow-lg border border-yellow-400/20">
            <Sword size={24} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold font-display tracking-tight text-[#fdfcf9]">Daniyal</h2>
            <div className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Lvl {user.level} Paladin</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-[#b8b3a0]">EXP POINT LEVEL</span>
            <span className="text-yellow-500">{user.xp} / {user.xpToNextLevel}</span>
          </div>
          <div className="w-full h-2.5 bg-yellow-500/10 rounded-full overflow-hidden border border-yellow-500/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 flex flex-col items-center justify-center gap-2 bg-[#211d15]/95 border border-yellow-500/15 rounded-2xl tour-streak">
            <div className="flex items-center gap-2">
              <Flame className="text-yellow-500" size={20} />
              <div className="text-xl font-black font-display text-[#fdfcf9]">{user.streak}</div>
            </div>
            <div className="text-[10px] text-[#b8b3a0]/60 font-bold uppercase tracking-wider text-center leading-tight">Focus Dungeon<br/>Streak</div>
            <div className="flex gap-1 mt-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${(user.streak % 7 > i || (user.streak > 0 && user.streak % 7 === 0)) ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-[#1a1711] border border-white/5'}`} />
              ))}
            </div>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center gap-1.5 bg-[#211d15]/95 border border-yellow-500/15 rounded-2xl">
            <Coins className="text-yellow-500" size={20} />
            <div className="text-xl font-black font-display text-[#fdfcf9]">{user.coins}</div>
            <div className="text-[10px] text-[#b8b3a0]/60 font-bold uppercase tracking-wider">Gold</div>
          </div>
        </div>

        <div className="glass-card p-4 border border-yellow-500/15 bg-[#211d15]/95 rounded-2xl flex flex-col gap-3 tour-rivals">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users className="text-yellow-500" size={16} />
              <h3 className="font-bold text-sm text-[#fdfcf9]">Rivals</h3>
            </div>
            <button className="text-[10px] bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer">
              <UserPlus size={10} /> Invite
            </button>
          </div>
          
          <div className="flex flex-col gap-1.5 mb-2">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-[#b8b3a0]">Shared Goal: Defeat Assignment Dragon</span>
              <span className="text-yellow-500">{party.reduce((acc, p) => acc + p.xp, 0).toLocaleString()} / 25,000 XP</span>
            </div>
            <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-yellow-500 h-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (party.reduce((acc, p) => acc + p.xp, 0) / 25000) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {party.map((member, idx) => (
              <div key={member.id} className={`flex items-center justify-between p-2 rounded-lg border ${member.isCurrentUser ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-[#16130e]/50 border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold text-yellow-500/70 w-4 text-center">#{idx + 1}</div>
                  <div>
                    <div className="font-bold text-sm text-[#fdfcf9] flex items-center gap-1.5">
                      {member.name} {member.isCurrentUser && <span className="text-[8px] bg-yellow-500 text-black px-1 py-0.5 rounded uppercase">You</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-sm font-black text-yellow-500 font-display">Lvl {member.level}</div>
                  <div className="text-[9px] font-mono text-[#b8b3a0]/60">{member.xp.toLocaleString()} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 mt-auto border border-yellow-500/15 bg-[#211d15]/95 rounded-2xl tour-focus-dungeon">
          <div className="flex items-center gap-2 mb-3">
            <Target className="text-yellow-500" size={16} />
            <h3 className="font-bold text-sm text-[#fdfcf9]">Focus Dungeon</h3>
          </div>
          <p className="text-xs text-[#b8b3a0] mb-4 leading-relaxed font-medium">Embark on a 25-minute study/work session to secure double multipliers.</p>
          <button 
            onClick={() => {
              playClickSfx();
              navigate('/dungeon');
            }}
            className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-all flex justify-center items-center gap-2 text-xs cursor-pointer shadow-md"
          >
            <Play size={12} fill="currentColor" /> Enter Dungeon
          </button>
        </div>

        <div className="glass-card p-5 border border-red-500/20 bg-red-950/20 rounded-2xl tour-rescue-mode">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-red-500" size={16} />
            <h3 className="font-bold text-sm text-red-400">Rescue Mode</h3>
          </div>
          <p className="text-[11px] text-red-200/80 mb-4 leading-relaxed font-semibold">Instantly trigger AI to restructure failing pipelines.</p>
          <button 
            onClick={() => {
              setChatHistory(prev => [...prev, { role: 'gm', text: "🚨 RESCUE MODE ACTIVATED! Probability of failure exceeded threshold. Reprioritizing tasks and generating recovery strategy..."}]);
              setTimeout(() => {
                setChatHistory(prev => [...prev, { role: 'gm', text: "Strategy generated: Dropped non-essential side quests. Created 'Emergency Sprint' for the Assignment Dragon."}]);
              }, 2500);
            }}
            className="w-full py-2.5 bg-red-900/40 text-red-400 border border-red-500/30 rounded-xl font-extrabold hover:bg-red-900/60 transition-all text-xs cursor-pointer"
          >
            Trigger Rescue Action
          </button>
        </div>
      </aside>

      {/* Main Content - Quests & Bosses */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-transparent flex flex-col gap-6 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 
                className={`text-2xl md:text-3xl font-extrabold font-display tracking-tight cursor-pointer transition-colors ${activeView === 'quests' ? 'text-[#fdfcf9]' : 'text-[#fdfcf9]/40 hover:text-[#fdfcf9]/80'}`}
                onClick={() => setActiveView('quests')}
              >
                Active Quests
              </h1>
              <h1 
                className={`text-2xl md:text-3xl font-extrabold font-display tracking-tight cursor-pointer transition-colors ${activeView === 'roadmap' ? 'text-yellow-500' : 'text-yellow-500/40 hover:text-yellow-500/80'}`}
                onClick={() => setActiveView('roadmap')}
              >
                Roadmap
              </h1>
            </div>
            <p className="text-[#b8b3a0] font-semibold text-xs sm:text-sm">2 Bosses, 1 Daily remaining.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setChatHistory(prev => [...prev, { role: 'gm', text: "Scanning your Gmail and Calendar... I've detected a new 'System Design Interview' threat on Thursday. Adding it to your quest log."}]);
                setTimeout(async () => {
                  const newQuest: Quest = {
                    id: "3",
                    title: "System Design Interview",
                    type: "boss",
                    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                    health: 100,
                    maxHealth: 100,
                    tasks: [
                      { id: "t6", title: "Review CAP Theorem", completed: false },
                      { id: "t7", title: "Mock Interview Practice", completed: false }
                    ],
                    rewards: { xp: 1500, coins: 300 },
                    riskScore: "high"
                  };
                  try {
                    const response = await fetch('/api/quests', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newQuest)
                    });
                    const result = await response.json();
                    if (result.success) {
                      setQuests(prev => [result.quest, ...prev.filter(q => q && q.id !== "3")]);
                    }
                  } catch (err) {
                    console.error("Failed to sync scanned quest to server:", err);
                    setQuests(prev => [newQuest, ...prev.filter(q => q && q.id !== "3")]);
                  }
                }, 2000);
              }}
              className="px-4 py-2 bg-[#16130e]/85 rounded-full border border-yellow-500/15 text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-[#211d15] text-[#fdfcf9] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
              Scan Inbox
            </button>
            <div className="px-4 py-2 bg-[#16130e]/85 rounded-full border border-yellow-500/15 text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 text-[#b8b3a0]">
              <BrainCircuit size={16} className="text-yellow-500 animate-pulse" />
              Prod Score: {user.productivityScore}
            </div>
          </div>
        </header>

        {activeView === 'quests' ? (
          <>
            {/* Dynamic Quest Generator Form */}
            <div className="tour-add-quest">
              <TaskCard onSubmit={handleCreateQuest} isGenerating={isGeneratingQuest} />
            </div>

            {/* Analytics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Completion Rate', value: '88%', trend: '+5%' },
                { label: 'Focus Time', value: '24h 12m', trend: '+2h' },
                { label: 'Survival Rate', value: '95%', trend: '+1%' },
                { label: 'Bosses Defeated', value: '14', trend: 'Epic' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-4 flex flex-col justify-center bg-[#16130e]/90 border border-yellow-500/15 rounded-2xl shadow-md">
                  <div className="text-[10px] font-black text-[#b8b3a0]/50 uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-black font-display text-[#fdfcf9]">{stat.value}</div>
                    <div className="text-xs font-bold text-yellow-500 mb-0.5">{stat.trend}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quests Container */}
            <div className="space-y-4 max-w-4xl flex-1">
              <AnimatePresence>
                {quests.filter(Boolean).map(quest => (
                  <motion.div 
                    key={quest.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass-card p-6 border-l-4 ${quest.type === 'boss' ? 'border-l-red-500' : 'border-l-yellow-500'} bg-[#16130e]/95 border border-yellow-500/15 rounded-3xl shadow-xl`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-extrabold font-display text-[#fdfcf9]">{quest.title}</h3>
                          {quest.type === 'boss' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wide border border-red-500/30">
                              Boss Battle
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-wide border border-yellow-500/30">
                              Main Quest
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#b8b3a0]/70 font-bold flex items-center gap-1.5">
                          <AlertTriangle size={12} className={quest.riskScore === 'high' ? 'text-red-500' : 'text-yellow-500'} />
                          Deadline: {new Date(quest.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      
                      {quest.type === 'boss' && (
                        <div className="text-left sm:text-right">
                          <div className="text-[9px] font-mono font-bold text-[#b8b3a0]/50 mb-1">BOSS HP</div>
                          <div className="w-32 h-2.5 bg-black/40 border border-yellow-500/15 rounded-full overflow-hidden flex justify-end">
                             <motion.div 
                               animate={{ width: `${(quest.health / quest.maxHealth) * 100}%` }}
                               className="h-full bg-gradient-to-r from-red-500 to-yellow-500 rounded-full origin-right"
                             />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {quest.tasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => handleTaskToggle(quest.id, task.id, task.completed)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${task.completed ? 'bg-yellow-500/5' : 'hover:bg-white/5 border border-transparent hover:border-yellow-500/10'}`}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="text-yellow-400 shrink-0" size={18} />
                          ) : (
                            <Circle className="text-[#b8b3a0]/40 shrink-0 hover:text-yellow-500" size={18} />
                          )}
                          <span className={`text-sm font-semibold ${task.completed ? 'text-[#b8b3a0]/40 line-through' : 'text-[#fdfcf9]/90'}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 w-full relative">
            <D3ForceGraph quests={quests} />
          </div>
        )}
      </main>

      {/* AI Game Master Panel */}
      <aside className="w-full md:w-96 border-l border-yellow-500/10 bg-[#100e0a]/95 flex flex-col h-full shrink-0 relative z-10 tour-game-master">
        <div className="p-4 border-b border-yellow-500/10 bg-[#16130e]/80 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <BrainCircuit className="text-yellow-500 animate-pulse" size={20} />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#12110d] rounded-full"></div>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#fdfcf9]">Game Master</h3>
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Gemini 2.5 Pro</p>
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
              <div className={`text-[10px] text-[#b8b3a0]/40 mb-1 font-bold ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                {msg.role === 'user' ? 'You' : 'Game Master'}
              </div>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-yellow-500 text-black rounded-tr-sm font-bold' 
                  : 'bg-yellow-500/5 text-[#fdfcf9]/90 border border-yellow-500/10 rounded-tl-sm font-bold'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
               <div className="bg-yellow-500/5 p-3 rounded-2xl rounded-tl-sm flex gap-1 border border-yellow-500/10">
                 <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                 <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
               </div>
             </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-yellow-500/10">
          <form onSubmit={handleChatSubmit} className="relative">
            <input 
              type="text" 
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              placeholder="Ask the Game Master..."
              className="w-full bg-[#211d15] border border-yellow-500/15 rounded-xl py-3 pl-4 pr-10 text-xs sm:text-sm font-medium text-[#fdfcf9] placeholder-[#b8b3a0]/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
            <button type="submit" disabled={isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#b8b3a0]/60 hover:text-yellow-500 transition-colors disabled:opacity-50 cursor-pointer">
              <MessageSquare size={18} />
            </button>
          </form>
        </div>
      </aside>

    </div>
  );
}
