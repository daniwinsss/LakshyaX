import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sword, Shield, Zap, Target, Mail, Calendar, Play } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-accent font-medium text-sm mb-8"
        >
          <Zap size={16} />
          <span>The Last-Minute Life Saver</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground max-w-4xl"
        >
          Turn Deadlines Into <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Boss Battles.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-6 text-xl text-foreground/60 max-w-2xl font-medium"
        >
          LakshyaX transforms your assignments, interviews, exams, and commitments into quests that an AI Game Master helps you conquer.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-foreground text-white rounded-xl font-medium hover:bg-foreground/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Sword size={20} />
            Start Your Journey
          </button>
          <button className="px-8 py-4 bg-white border border-gray-200 text-foreground rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Play size={20} />
            Watch Demo
          </button>
        </motion.div>

        {/* Floating Hero Visual */}
        <motion.div 
          style={{ y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="mt-20 w-full max-w-4xl relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-50"></div>
          <div className="glass-card p-6 relative overflow-hidden aspect-[16/9] flex items-center justify-center bg-white/80">
            {/* Mock Interface */}
            <div className="absolute inset-0 flex flex-col p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Sword className="text-accent" size={20}/></div>
                  <div>
                    <div className="text-sm font-semibold">Lvl 12 Player</div>
                    <div className="w-32 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary w-[80%] rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono px-3 py-1 bg-red-100 text-red-600 rounded-full flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Assignment Dragon Appeared
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                 <motion.div 
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl absolute"
                 />
                 <div className="text-center z-10">
                   <h3 className="text-2xl font-bold mb-2">Assignment Dragon</h3>
                   <div className="flex items-center justify-center gap-4 mb-4">
                     <span className="text-sm font-mono text-gray-500">HP</span>
                     <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: '100%' }}
                          animate={{ width: '40%' }}
                          transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                          className="h-full bg-red-500 rounded-full"
                        />
                     </div>
                     <span className="text-sm font-mono font-medium">40%</span>
                   </div>
                   <p className="text-sm text-gray-500 max-w-xs mx-auto">"Complete 'Draft 1' to deal 500 damage."</p>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Features Grid */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Mail />, title: "Gmail Integration", desc: "Auto-detects assignments, interviews, and bills to spawn quests." },
            { icon: <Target />, title: "Focus Dungeons", desc: "Enter deep work modes. Emerge with XP, coins, and legendary loot." },
            { icon: <Shield />, title: "Rescue Mode", desc: "AI automatically rebuilds your schedule when failure probability is high." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="glass-card p-8 bg-white/60"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-accent">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
