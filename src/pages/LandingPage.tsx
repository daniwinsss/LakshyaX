import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sword,
  Shield,
  Zap,
  Target,
  Mail,
  Play,
  Star,
  Sparkles,
  Flame,
  Coins,
  ShieldAlert,
  ChevronRight,
  Users,
  BookOpen,
  Monitor,
  Cpu,
  BrainCircuit,
  Network,
  Moon
} from "lucide-react";
import FeatureFlashcard from "../components/FeatureFlashcard";
import { HeroInteractiveCard } from "../components/HeroInteractiveCard";
import { playClickSfx } from "../utils/audio";

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress, scrollY } = useScroll();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const duration = 1800; // total animation time in ms
    const intervalTime = 15; // update every 15ms
    const step = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  // Subtle paralax transformations
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroScrollOpacity = useTransform(scrollY, [0, 1200], [1, 0]);
  const heroScrollScale = useTransform(scrollY, [0, 1200], [1, 0.98]);

  // Reveal animation helper variant
  const revealVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
  };

  const howItWorksContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const howItWorksCardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 14,
      },
    },
  };

  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const flashcardData = [
    {
      id: 1,
      icon: Sword,
      title: "AI Quest Chain Spawn",
      shortHook:
        "Transform simple, intimidating milestones into custom, structured multi-phase campaigns with an AI narrator.",
      detailedDesc:
        "Analyzes the scope and complexity of your tasks to decompose them into distinct milestones. Generates thematic descriptions, XP estimates, and rewards.",
      flavorText:
        "An AI Game Master maps your real-world progress to physical boss battles.",
      badge: "AI Narrator",
      statLabel: "Completion Rate Boost",
      statValue: "+45% Efficiency",
      difficulty: "High Capability",
    },
    {
      id: 2,
      icon: Users,
      title: "Guild Rivals",
      shortHook:
        "Team up and compete with rivals to achieve shared quest goals.",
      detailedDesc:
        "Join a party to conquer assignments together. Track live progress towards massive XP goals and see who contributes the most.",
      flavorText:
        "Your friends become rivals as you race to deal the most damage.",
      badge: "Multiplayer",
      statLabel: "Shared Goals",
      statValue: "25,000 XP Target",
      difficulty: "Co-op",
    },
    {
      id: 3,
      icon: Flame,
      title: "Focus Dungeon Sprints",
      shortHook:
        "Initiate high-stakes 25-minute study sessions to gain XP every second.",
      detailedDesc:
        "Lock down your tab into focus sprints. Gain 1 XP every second, +100 XP for sub-tasks, and +1,000 XP for clearing the boss.",
      flavorText:
        "Your focused hours deal continuous critical damage to active Bosses.",
      badge: "Real-Time XP",
      statLabel: "Focus Rate",
      statValue: "+60 XP / Minute",
      difficulty: "High Intensity",
    },
    {
      id: 4,
      icon: Shield,
      title: "Panic Rescue Mode",
      shortHook:
        "Instantly re-calibrates, trims, and adjusts failing pipelines when schedules are in danger.",
      detailedDesc:
        "A fail-safe module triggered when completion metrics drop below critical safety thresholds. Prunes task overload to prevent burnout.",
      flavorText:
        "When the party is down to 1 HP, the storyteller re-aligns your path.",
      badge: "Dynamic Pruning",
      statLabel: "Safety Margin",
      statValue: "Failsafe Recovery",
      difficulty: "Emergency",
    },
    {
      id: 5,
      icon: Coins,
      title: "Experience & Gold Pool",
      shortHook:
        "Earn tangible in-game gold currency and level up your physical skillset to rank up your character.",
      detailedDesc:
        "Tracks streaks, gold, levels, and ranks. Claim points for tasks completed on-time and redeem them for status achievements.",
      flavorText:
        "Every minor task finished builds your legendary Paladin character.",
      badge: "RPG System",
      statLabel: "Base XP Rate",
      statValue: "+50 XP / Minute",
      difficulty: "Passive",
    },
    {
      id: 6,
      icon: Mail,
      title: "Gmail Synchronizer",
      shortHook:
        "Detects hidden deadlines, meeting schedules, and urgent academic alerts to spawn automatically.",
      detailedDesc:
        "Synchronizes secure headers to flag commitment timelines directly from your Gmail inbox. Re-prioritizes items instantly in your quest log.",
      flavorText:
        "No threat remains undetected. Urgent mails turn into active countdown challenges.",
      badge: "Inbox Scan",
      statLabel: "Sync Interval",
      statValue: "Real-Time Scan",
      difficulty: "Seamless",
    },
    {
      id: 7,
      icon: BookOpen,
      title: "Classwork Upload",
      shortHook:
        "Integrate Google Classroom to instantly import assignments as monster encounters.",
      detailedDesc:
        "Automatically pulls your classwork and transforms each assignment into a boss fight with estimated health and deadlines based on syllabus data.",
      flavorText: "Your syllabus is the map, the assignments are the bosses.",
      badge: "Classroom Sync",
      statLabel: "Import Speed",
      statValue: "Instant",
      difficulty: "Automated",
    },
  ];

  if (isLoading) {
    // Determine dynamic sub-text based on current percentage progress
    let statusText = "SPAWNING PALADIN HEROES...";
    if (loadingProgress > 25 && loadingProgress <= 50) {
      statusText = "CALIBRATING STORYTELLER MODULES...";
    } else if (loadingProgress > 50 && loadingProgress <= 75) {
      statusText = "SYNCHRONIZING SECURE REALMS...";
    } else if (loadingProgress > 75 && loadingProgress <= 99) {
      statusText = "DEFEATING ANCIENT ASSIGNMENT DRAGONS...";
    } else if (loadingProgress >= 100) {
      statusText = "LEGENDARY ARENA PREPARED!";
    }

    return (
      <div className="min-h-screen bg-[#0a0907] text-[#fdfcf9] flex flex-col items-center justify-center gap-6 font-mono relative overflow-hidden">
        {/* Decorative Grid with Golden Tint */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#eab30807_1px,transparent_1px),linear-gradient(to_bottom,#eab30807_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0a0907_95%)] pointer-events-none z-0"></div>

        {/* Glowing Ambient Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-yellow-500/10 blur-[100px] pointer-events-none z-0"></div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center w-full max-w-sm px-8"
        >
          {/* Animated Glowing Crest */}
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-400/20 blur-sm"
            />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 flex items-center justify-center text-[#0a0907] shadow-xl border border-yellow-400/30 relative z-10">
              <Sword size={30} className="transform -rotate-45" />
            </div>
          </div>

          <h1 className="text-sm font-black tracking-[0.25em] text-yellow-500 uppercase mb-1">
            LAKSHYAX
          </h1>
          <p className="text-[10px] text-[#b8b3a0]/40 font-bold uppercase tracking-widest mb-6">
            RPG Storyteller Console
          </p>

          {/* Premium Progress Bar Track */}
          <div className="w-full bg-[#16130e] border border-yellow-500/15 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner relative">
            <motion.div
              className="shimmer-bg h-full rounded-full relative"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          {/* Load values */}
          <div className="flex justify-between w-full mt-3 text-[10px] font-bold tracking-widest">
            <span className="text-yellow-500">{statusText}</span>
            <span className="text-yellow-500">
              {Math.round(loadingProgress)}%
            </span>
          </div>

          {/* Mini ambient details */}
          <div className="mt-8 pt-4 border-t border-yellow-500/5 w-full flex items-center justify-center gap-2 text-[8px] text-[#b8b3a0]/30 uppercase tracking-widest">
            <span>SECURE SHELL MODE</span>
            <span className="w-1 h-1 rounded-full bg-yellow-500/40"></span>
            <span>PORT 3000 ACTIVE</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0d0a] text-[#fdfcf9] overflow-x-hidden relative font-sans">
      {/* Decorative Grid with Premium Yellow/Gold Tint */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#eab30807_1px,transparent_1px),linear-gradient(to_bottom,#eab30807_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none z-0"></div>

      {/* Atmospheric radial spotlight mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0e0d0a_95%)] pointer-events-none z-0"></div>

      {/* Premium Floating Glowing Light-Orbs (Atmosphere) */}
      <div className="absolute top-[-5%] left-[50%] -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-yellow-600/15 via-amber-500/10 to-yellow-500/5 blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-yellow-600/10 to-transparent blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute top-[45%] right-[-15%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-amber-500/10 via-yellow-600/8 to-transparent blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-[75%] left-[-5%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-yellow-500/10 via-amber-500/8 to-transparent blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-5%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-yellow-600/15 via-yellow-500/5 to-transparent blur-[140px] pointer-events-none z-0"></div>

      {/* Top Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0e0d0a]/75 backdrop-blur-xl border-b border-yellow-500/10 px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-[#0e0d0a] shadow-lg border border-yellow-400/20">
              <Sword size={20} />
            </div>
            <span className="text-2xl font-black font-display tracking-tight text-[#fdfcf9]">
              Lakshya<span className="text-yellow-500 font-extrabold">X</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {[
              { label: "Features", id: "features" },
              { label: "How It Works", id: "how-it-works" },
              { label: "Demo", id: "demo" },
              { label: "Tech Stack", id: "tech-stack" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-semibold text-[#b8b3a0] hover:text-[#fdfcf9] transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#b8b3a0] hover:text-white hover:bg-white/5 transition-all hidden sm:flex">
              <Moon size={18} />
            </button>
            <button
              onClick={() => {
                playClickSfx();
                navigate("/dashboard");
              }}
              className="relative group overflow-hidden px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs sm:text-sm rounded-2xl font-bold transition-all shadow-lg shadow-yellow-950/50 flex items-center gap-2 cursor-pointer border border-yellow-400/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                Launch Quest{" "}
                <Sparkles size={14} className="text-amber-700 animate-pulse" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero & Interactive Showcase Block */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={heroContainerVariants}
        className="relative pt-36 pb-20 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Hero Left Side: Content */}
          <motion.div
            style={{ opacity: heroScrollOpacity, scale: heroScrollScale }}
            className="lg:col-span-7 text-left flex flex-col items-start"
          >
            <motion.h1
              variants={heroItemVariants}
              className="text-5xl sm:text-7xl font-black font-display text-[#fdfcf9] tracking-tighter leading-[0.95]"
            >
              Turn heavy <br />
              deadlines into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300">
                Boss Battles.
              </span>
            </motion.h1>

            <motion.p
              variants={heroItemVariants}
              className="mt-6 text-[#b8b3a0] text-lg sm:text-xl max-w-xl font-medium leading-relaxed"
            >
              <span className="font-bold text-[#fdfcf9]">LakshyaX</span>{" "}
              converts your assignments, exams, and projects into custom RPG
              side quests. Assisted by an immersive AI Game Master.
            </motion.p>

            <motion.div
              variants={heroItemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button
                onClick={() => {
                  playClickSfx();
                  navigate("/dashboard");
                }}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-450 text-black rounded-2xl font-bold transition-all shadow-lg shadow-yellow-950/50 flex items-center justify-center gap-3 cursor-pointer border border-yellow-400/20"
              >
                <Sword size={20} className="text-amber-900" />
                Launch Free Quest
              </button>
              <button
                onClick={() => {
                  playClickSfx();
                  navigate("/dashboard");
                }}
                className="px-8 py-4 bg-[#1e1c14]/80 border border-yellow-500/10 text-[#fdfcf9] hover:text-[#fdfcf9] hover:bg-[#27241a] rounded-2xl font-bold transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play size={18} className="text-yellow-500" />
                Live Quest Room
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Right Side: Ultra Premium High-Fidelity App Mockup Container */}
          <motion.div className="lg:col-span-5 relative w-full h-full flex items-center justify-center">
            {/* Soft background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 rounded-[2.5rem] blur-3xl opacity-70"></div>

            <motion.div
              style={{ y }}
              variants={heroItemVariants}
              className="w-full relative"
            >
              <HeroInteractiveCard />
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Section 2: How It Works */}
      <motion.section
        id="how-it-works"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealVariants}
        className="py-28 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto relative z-10 text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-black font-display text-[#fdfcf9] tracking-tight mb-4">
          Defeat Deadlines in 4 Steps
        </h2>
        <p className="text-[#b8b3a0] max-w-xl mx-auto font-medium text-base sm:text-lg mb-16">
          The roadmap to reclaiming your workflow, from spawning to final loot.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto relative pb-32">
          {[
            {
              step: "01",
              title: "Spawn Quests",
              desc: "Sync Gmail, Google Classroom, or use AI to turn simple milestones into dynamic quests.",
              badgeBg: "bg-yellow-500/10",
              badgeText: "text-yellow-500",
              badgeBorder: "border-yellow-500/20",
              glow: "shadow-[0_0_30px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_50px_rgba(234,179,8,0.3)]",
              hoverBorder: "hover:border-yellow-500/50",
              numberColor: "text-yellow-500",
            },
            {
              step: "02",
              title: "Enter Instance",
              desc: "Enter a timed focus zone to defeat bosses. Earn XP per second and clear bonuses.",
              badgeBg: "bg-amber-500/10",
              badgeText: "text-amber-500",
              badgeBorder: "border-amber-500/20",
              glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.3)]",
              hoverBorder: "hover:border-amber-500/50",
              numberColor: "text-amber-500",
            },
            {
              step: "03",
              title: "Join Guilds",
              desc: "Compete with rivals on shared goals. Track live progress and level up together.",
              badgeBg: "bg-orange-500/10",
              badgeText: "text-orange-500",
              badgeBorder: "border-orange-500/20",
              glow: "shadow-[0_0_30px_rgba(249,115,22,0.15)] group-hover:shadow-[0_0_50px_rgba(249,115,22,0.3)]",
              hoverBorder: "hover:border-orange-500/50",
              numberColor: "text-orange-500",
            },
            {
              step: "04",
              title: "Claim Rewards",
              desc: "Earn experience points, legendary status gold, and rank up your skillset.",
              badgeBg: "bg-yellow-400/10",
              badgeText: "text-yellow-400",
              badgeBorder: "border-yellow-400/20",
              glow: "shadow-[0_0_30px_rgba(250,204,21,0.15)] group-hover:shadow-[0_0_50px_rgba(250,204,21,0.3)]",
              hoverBorder: "hover:border-yellow-400/50",
              numberColor: "text-yellow-400",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="h-full"
            >
              <div className={`bg-[#12100d] border border-white/10 ${item.hoverBorder} ${item.glow} p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center gap-6 shadow-2xl relative overflow-hidden group h-full aspect-square transition-[border-color,box-shadow] duration-500`}>
                
                {/* Tactical Sci-Fi Corner Brackets */}
                <div className={`absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white/0 group-hover:${item.badgeBorder.replace('/20', '/50')} transition-colors duration-700 rounded-tl-sm pointer-events-none z-20`} />
                <div className={`absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white/0 group-hover:${item.badgeBorder.replace('/20', '/50')} transition-colors duration-700 rounded-tr-sm pointer-events-none z-20`} />
                <div className={`absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white/0 group-hover:${item.badgeBorder.replace('/20', '/50')} transition-colors duration-700 rounded-bl-sm pointer-events-none z-20`} />
                <div className={`absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white/0 group-hover:${item.badgeBorder.replace('/20', '/50')} transition-colors duration-700 rounded-br-sm pointer-events-none z-20`} />

                {/* Background Glow Effect */}
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${item.badgeBg.replace('/10', '')} pointer-events-none`}></div>

                {/* Folder Tab */}
                <div className={`absolute top-0 left-6 sm:left-8 px-4 py-1.5 rounded-b-xl ${item.badgeBg} border-x border-b ${item.badgeBorder} flex items-center justify-center transition-colors duration-500 group-hover:bg-white/10`}>
                  <span className={`text-[10px] sm:text-xs font-mono font-bold ${item.badgeText}`}>STEP {item.step}</span>
                </div>
                
                <div className="w-full flex justify-center mt-4">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${item.badgeBg} border ${item.badgeBorder} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6`}>
                    <span className={`text-4xl sm:text-5xl font-black font-mono ${item.numberColor} opacity-80`}>{item.step.replace('0', '')}</span>
                  </div>
                </div>

                <div className="flex-1 mt-1 text-center flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl font-black font-display mb-3 text-[#fdfcf9] tracking-tight group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#b8b3a0] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Interactive Feature Flashcards Section */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealVariants}
        className="py-24 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto relative z-10 text-center"
      >
        <div className="mb-12">
          <span className="text-xs font-black font-mono text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3.5 py-1.5 rounded-full border border-yellow-500/15">
            Interactive Feature Codex
          </span>
          <h2 className="text-4xl sm:text-5xl font-black font-display text-[#fdfcf9] tracking-tight mt-4 mb-3">
            Explore the Realm's Capabilities
          </h2>
          <p className="text-[#b8b3a0] max-w-xl mx-auto font-medium text-sm sm:text-base">
            Hover over any flashcard below to scan and unlock the hidden RPG
            formulas, stat multipliers, and lore mechanics powering your
            productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {flashcardData.map((card) => (
            <FeatureFlashcard
              key={card.id}
              id={card.id}
              icon={card.icon}
              title={card.title}
              shortHook={card.shortHook}
              detailedDesc={card.detailedDesc}
              flavorText={card.flavorText}
              badge={card.badge}
              statLabel={card.statLabel}
              statValue={card.statValue}
              difficulty={card.difficulty}
            />
          ))}
        </div>
      </motion.section>

      {/* Section 4: Game Master Dialog Simulator */}
      <motion.section
        id="demo"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealVariants}
        className="py-28 px-6 sm:px-12 lg:px-24 max-w-4xl mx-auto relative z-10 text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-black font-display text-[#fdfcf9] tracking-tight mb-4">
          Experience the AI Game Master
        </h2>
        <p className="text-[#b8b3a0] max-w-xl mx-auto font-medium text-base sm:text-lg mb-12">
          An interactive, immersive narrator adjusting your journey in real
          time.
        </p>

        <div className="bg-[#171510]/90 border border-yellow-500/15 p-6 sm:p-8 rounded-[2.5rem] text-left relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 border-b border-yellow-500/10 pb-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-black shadow-lg border border-yellow-400/30">
              <Star
                className="animate-spin text-amber-900"
                size={20}
                style={{ animationDuration: "8s" }}
              />
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#fdfcf9]">
                Game Master AI
              </div>
              <div className="text-xs font-bold text-yellow-500 font-mono">
                Active Storyteller Module
              </div>
            </div>
          </div>
          <div className="space-y-4 font-mono text-xs sm:text-sm leading-relaxed text-[#b8b3a0]">
            <div className="text-red-400 font-extrabold flex items-center gap-2">
              <span>&gt; ALERT:</span> Assignment Dragon HP remains at 42%. Time
              limit: 18 hours.
            </div>
            <div className="text-yellow-400 font-bold">
              <span>&gt; GM NARRATION:</span> You hear deep roars from the
              terminal ahead. To damage this titan, complete "Draft Section 1"
              side objective.
            </div>
            <div className="text-[#fdfcf9] font-medium italic pl-4 border-l border-yellow-500/25">
              "Gather your focus blocks, Paladin. A 45-minute study study
              session will award critical modifiers and defeat the beast."
            </div>
            <div className="text-yellow-500 font-bold">
              <span>&gt; OPTION RECOGNITION:</span> Initiate Focus Dungeon now?
              [Yes / No]
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 5: Real-world stats metrics */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealVariants}
        className="py-24 px-6 sm:px-12 lg:px-24 bg-gradient-to-b from-[#171510]/40 to-transparent border-y border-yellow-500/5 relative z-10"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "542,900+", label: "Quests Completed" },
            { value: "98.7%", label: "Deadlines Saved" },
            { value: "15.8M", label: "XP Earned" },
            { value: "35,000+", label: "Bosses Defeated" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="text-3xl sm:text-5xl font-black font-display text-yellow-500 mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#b8b3a0]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 6: Tech Stack */}
      <motion.section
        id="tech-stack"
        className="py-32 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto relative z-10"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-500 text-sm font-semibold"
          >
            4 synchronized layers
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[#b8b3a0] text-sm font-semibold"
          >
            16 core technologies
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[#b8b3a0] text-sm font-semibold"
          >
            Type-safe end-to-end
          </motion.div>
        </div>

        <div className="relative max-w-4xl mx-auto pb-10">
          {/* Vertical connection line */}
          <div className="absolute left-1/2 top-10 bottom-0 w-px bg-gradient-to-b from-yellow-500/20 via-amber-500/20 via-orange-500/20 to-yellow-400/20 -translate-x-1/2 hidden md:block z-0"></div>

          {/* Layer 01 */}
          <div className="flex flex-col md:flex-row items-center justify-start relative z-10 mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="w-full md:w-[48%] bg-[#12100d] border border-yellow-500/30 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(234,179,8,0.25)] group hover:border-yellow-500/60 hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] transition-[border-color,box-shadow] duration-500 overflow-hidden"
            >
              {/* Tactical Sci-Fi Corner Brackets */}
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-yellow-500/40 group-hover:border-yellow-500/80 transition-colors duration-700 rounded-tl-sm pointer-events-none z-20" />
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-yellow-500/40 group-hover:border-yellow-500/80 transition-colors duration-700 rounded-tr-sm pointer-events-none z-20" />
              <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-yellow-500/40 group-hover:border-yellow-500/80 transition-colors duration-700 rounded-bl-sm pointer-events-none z-20" />
              <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-yellow-500/40 group-hover:border-yellow-500/80 transition-colors duration-700 rounded-br-sm pointer-events-none z-20" />

              {/* Background Glow Effect */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-60 transition-opacity duration-700 bg-yellow-500 pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#fdfcf9] group-hover:text-yellow-500 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-all duration-300">
                  <Monitor size={24} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#b8b3a0] font-bold mb-1">Layer 01</div>
                  <h3 className="text-2xl font-black font-display text-[#fdfcf9] tracking-tight group-hover:text-white transition-colors">Frontend Interface</h3>
                </div>
              </div>
              <p className="text-[#b8b3a0] text-sm leading-relaxed mb-6 font-medium">
                Fast interaction shell for pages, transitions, and responsive UI rendering.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["React 19", "TypeScript", "Tailwind CSS", "Vite"].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-[#fdfcf9]">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-[#b8b3a0]">
                <span>Client-side rendering target</span>
                <span className="text-yellow-500 font-semibold">&lt;120ms UI response</span>
              </div>
            </motion.div>
            
            {/* Center Node */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-white/10 bg-[#12100d] flex items-center justify-center relative z-10">
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
              </div>
              <div className="absolute right-full w-16 h-px bg-white/10"></div>
            </div>
          </div>

          {/* Layer 02 */}
          <div className="flex flex-col md:flex-row items-center justify-end relative z-10 mb-24">
            {/* Center Node */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-white/10 bg-[#12100d] flex items-center justify-center relative z-10">
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
              </div>
              <div className="absolute left-full w-16 h-px bg-white/10"></div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="w-full md:w-[48%] bg-[#12100d] border border-amber-500/30 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(245,158,11,0.25)] group hover:border-amber-500/60 hover:shadow-[0_0_60px_rgba(245,158,11,0.4)] transition-[border-color,box-shadow] duration-500 overflow-hidden"
            >
              {/* Tactical Sci-Fi Corner Brackets */}
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/40 group-hover:border-amber-500/80 transition-colors duration-700 rounded-tl-sm pointer-events-none z-20" />
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/40 group-hover:border-amber-500/80 transition-colors duration-700 rounded-tr-sm pointer-events-none z-20" />
              <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/40 group-hover:border-amber-500/80 transition-colors duration-700 rounded-bl-sm pointer-events-none z-20" />
              <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/40 group-hover:border-amber-500/80 transition-colors duration-700 rounded-br-sm pointer-events-none z-20" />

              {/* Background Glow Effect */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-60 transition-opacity duration-700 bg-amber-500 pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#fdfcf9] group-hover:text-amber-500 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-all duration-300">
                  <Cpu size={24} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#b8b3a0] font-bold mb-1">Layer 02</div>
                  <h3 className="text-2xl font-black font-display text-[#fdfcf9] tracking-tight group-hover:text-white transition-colors">Motion & Visualization</h3>
                </div>
              </div>
              <p className="text-[#b8b3a0] text-sm leading-relaxed mb-6 font-medium">
                Hardware-accelerated fluid animations and interactive data-driven charts.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Framer Motion", "Recharts", "D3.js", "Lucide React"].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-[#fdfcf9]">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-[#b8b3a0]">
                <span>Render target</span>
                <span className="text-amber-500 font-semibold">60fps animations</span>
              </div>
            </motion.div>
          </div>

          {/* Layer 03 */}
          <div className="flex flex-col md:flex-row items-center justify-start relative z-10 mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="w-full md:w-[48%] bg-[#12100d] border border-orange-500/30 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(249,115,22,0.25)] group hover:border-orange-500/60 hover:shadow-[0_0_60px_rgba(249,115,22,0.4)] transition-[border-color,box-shadow] duration-500 overflow-hidden"
            >
              {/* Tactical Sci-Fi Corner Brackets */}
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-orange-500/40 group-hover:border-orange-500/80 transition-colors duration-700 rounded-tl-sm pointer-events-none z-20" />
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-orange-500/40 group-hover:border-orange-500/80 transition-colors duration-700 rounded-tr-sm pointer-events-none z-20" />
              <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-orange-500/40 group-hover:border-orange-500/80 transition-colors duration-700 rounded-bl-sm pointer-events-none z-20" />
              <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-orange-500/40 group-hover:border-orange-500/80 transition-colors duration-700 rounded-br-sm pointer-events-none z-20" />

              {/* Background Glow Effect */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-60 transition-opacity duration-700 bg-orange-500 pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#fdfcf9] group-hover:text-orange-500 group-hover:border-orange-500/50 group-hover:bg-orange-500/10 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-all duration-300">
                  <Network size={24} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#b8b3a0] font-bold mb-1">Layer 03</div>
                  <h3 className="text-2xl font-black font-display text-[#fdfcf9] tracking-tight group-hover:text-white transition-colors">Component Architecture</h3>
                </div>
              </div>
              <p className="text-[#b8b3a0] text-sm leading-relaxed mb-6 font-medium">
                Accessible unstyled primitives and robust client-side routing.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Radix UI", "React Router", "Tailwind Merge", "Clsx"].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-[#fdfcf9]">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-[#b8b3a0]">
                <span>Component logic</span>
                <span className="text-orange-500 font-semibold">Modular & Accessible</span>
              </div>
            </motion.div>
            
            {/* Center Node */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-white/10 bg-[#12100d] flex items-center justify-center relative z-10">
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
              </div>
              <div className="absolute right-full w-16 h-px bg-white/10"></div>
            </div>
          </div>

          {/* Layer 04 */}
          <div className="flex flex-col md:flex-row items-center justify-end relative z-10">
            {/* Center Node */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-white/10 bg-[#12100d] flex items-center justify-center relative z-10">
                <div className="w-3 h-3 rounded-full bg-white/20"></div>
              </div>
              <div className="absolute left-full w-16 h-px bg-white/10"></div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="w-full md:w-[48%] bg-[#12100d] border border-yellow-400/30 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(250,204,21,0.25)] group hover:border-yellow-400/60 hover:shadow-[0_0_60px_rgba(250,204,21,0.4)] transition-[border-color,box-shadow] duration-500 overflow-hidden"
            >
              {/* Tactical Sci-Fi Corner Brackets */}
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-yellow-400/40 group-hover:border-yellow-400/80 transition-colors duration-700 rounded-tl-sm pointer-events-none z-20" />
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-yellow-400/40 group-hover:border-yellow-400/80 transition-colors duration-700 rounded-tr-sm pointer-events-none z-20" />
              <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-yellow-400/40 group-hover:border-yellow-400/80 transition-colors duration-700 rounded-bl-sm pointer-events-none z-20" />
              <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-yellow-400/40 group-hover:border-yellow-400/80 transition-colors duration-700 rounded-br-sm pointer-events-none z-20" />

              {/* Background Glow Effect */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-60 transition-opacity duration-700 bg-yellow-400 pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#fdfcf9] group-hover:text-yellow-400 group-hover:border-yellow-400/50 group-hover:bg-yellow-400/10 group-hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] group-hover:scale-110 transition-all duration-300">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#b8b3a0] font-bold mb-1">Layer 04</div>
                  <h3 className="text-2xl font-black font-display text-[#fdfcf9] tracking-tight group-hover:text-white transition-colors">Intelligence & Backend</h3>
                </div>
              </div>
              <p className="text-[#b8b3a0] text-sm leading-relaxed mb-6 font-medium">
                Server-side API routing, reasoning pipeline, and graph database integration.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Express", "Node.js", "Google GenAI", "Neo4j"].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-[#fdfcf9]">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-[#b8b3a0]">
                <span>Data processing</span>
                <span className="text-yellow-400 font-semibold">Graph + semantic merge</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Section 7: Legendary Endorsements */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealVariants}
        className="py-28 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto relative z-10"
      >
        <h2 className="text-4xl sm:text-5xl font-black font-display text-center text-[#fdfcf9] mb-16 tracking-tight">
          Endorsed by Legendary Finishers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote:
                "This platform saved my semester. It made studying for DBMS feel like a raid with my friends rather than a tedious grind.",
              author: "Arjun Mehta",
              role: "Computer Science Junior",
            },
            {
              quote:
                "Rescue Mode literally saved my placement interview. When my mock schedules were falling apart, it dynamically re-ordered everything.",
              author: "Preeti Sharma",
              role: "Software Engineering Grad",
            },
            {
              quote:
                "Defeated my Final Year Project Kraken with 4 hours to spare. The narrator kept me incredibly focused.",
              author: "Vikram Sen",
              role: "Lead Developer",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-[#171510]/60 border border-yellow-500/10 p-8 rounded-3xl flex flex-col justify-between shadow-xl"
            >
              <p className="text-[#b8b3a0] font-medium leading-relaxed mb-6 italic text-sm sm:text-base">
                "{t.quote}"
              </p>
              <div>
                <div className="font-extrabold text-[#fdfcf9] text-sm sm:text-base">
                  {t.author}
                </div>
                <div className="text-xs font-bold text-yellow-500 mt-0.5">
                  {t.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 7: Final Epic CTA Banner */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealVariants}
        className="py-28 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto relative z-10 text-center animate-pulse-subtle"
      >
        <div className="bg-gradient-to-br from-[#171510]/90 via-[#221f17]/70 to-[#0e0c08] border border-yellow-500/15 p-12 sm:p-20 rounded-[3rem] relative overflow-hidden shadow-2xl">
          {/* Subtle warm glow background in corner */}
          <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

          <h2 className="text-4xl sm:text-6xl font-black font-display text-[#fdfcf9] tracking-tighter mb-6 leading-none">
            Ready to Conquer?
          </h2>
          <p className="text-[#b8b3a0] max-w-xl mx-auto font-medium text-base sm:text-lg mb-10 leading-relaxed">
            Join thousands of busy students and professionals who defeat massive
            tasks daily. Enter your battle arena today.
          </p>
          <button
            onClick={() => {
              playClickSfx();
              navigate("/dashboard");
            }}
            className="px-10 py-5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-bold transition-all shadow-xl shadow-yellow-950/50 inline-flex items-center gap-3 cursor-pointer border border-yellow-400/20 text-base"
          >
            <Sword size={22} className="text-amber-900" />
            Claim Your Legend Rank
          </button>
        </div>
      </motion.section>
    </div>
  );
}
