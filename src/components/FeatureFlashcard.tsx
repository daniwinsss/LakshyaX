import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { playFlipSfx } from '../utils/audio';

interface FlashcardProps {
  id: number;
  icon: LucideIcon;
  title: string;
  shortHook: string;
  detailedDesc: string;
  flavorText: string;
  badge: string;
  statLabel: string;
  statValue: string;
  difficulty: string;
  key?: any;
}

export default function FeatureFlashcard({
  id,
  icon: Icon,
  title,
  shortHook,
  detailedDesc,
  flavorText,
  badge,
  statLabel,
  statValue,
  difficulty
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full h-80 perspective-1000 cursor-pointer group select-none relative"
      onMouseEnter={() => {
        setIsFlipped(true);
        playFlipSfx();
      }}
      onMouseLeave={() => {
        setIsFlipped(false);
      }}
      id={`flashcard-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* 100% Stable Flat 2D Pointer Overlay (Never Rotates) to prevent 3D mouseout flicker */}
      <div className="absolute inset-0 bg-transparent rounded-3xl z-10 pointer-events-auto" />

      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{ 
          transformStyle: 'preserve-3d', 
          WebkitTransformStyle: 'preserve-3d',
          transformOrigin: 'center center' 
        }}
        className="w-full h-full relative rounded-3xl z-0"
      >
        {/* Front Side */}
        <div 
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transformOrigin: 'center center'
          }}
          className="!absolute inset-0 w-full h-full p-6 bg-[#16130e]/95 border border-yellow-500/10 rounded-3xl flex flex-col justify-between shadow-xl transition-all duration-700 group-hover:border-yellow-500/35 group-hover:shadow-yellow-950/40 foil-shine"
        >
          {/* Tactical Sci-Fi Corner Brackets */}
          <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-yellow-500/0 group-hover:border-yellow-500/40 transition-colors duration-700 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-yellow-500/0 group-hover:border-yellow-500/40 transition-colors duration-700 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-yellow-500/0 group-hover:border-yellow-500/40 transition-colors duration-700 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-yellow-500/0 group-hover:border-yellow-500/40 transition-colors duration-700 rounded-br-sm pointer-events-none" />

          {/* Top header on card */}
          <div className="flex justify-between items-start">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#241f16] to-[#16130e] flex items-center justify-center border border-yellow-500/15 text-yellow-500 group-hover:border-yellow-500/45 transition-colors">
              <Icon size={20} className="group-hover:scale-110 transition-transform duration-700" />
            </div>
            <span className="text-[9px] font-black font-mono tracking-[0.15em] px-2.5 py-1 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20 uppercase">
              {badge}
            </span>
          </div>

          {/* Middle Body */}
          <div className="my-3 text-left">
            <span className="text-[8px] font-mono tracking-[0.25em] text-yellow-500/45 uppercase mb-1.5 block">
              [ SEC_LOG // UNIT-0{id} ]
            </span>
            <h3 className="text-lg font-black font-display tracking-tight text-[#fdfcf9] group-hover:text-yellow-400 group-hover:gold-shimmer-text transition-all duration-700 leading-tight">
              {title}
            </h3>
            <p className="text-[11px] text-[#b8b3a0]/85 mt-2.5 font-sans leading-relaxed tracking-normal font-medium">
              {shortHook}
            </p>
          </div>

          {/* Bottom Prompt */}
          <div className="border-t border-yellow-500/5 pt-4 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.18em] font-mono text-[#b8b3a0]/30 group-hover:text-[#b8b3a0]/60 transition-colors">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/30 group-hover:bg-yellow-500 animate-pulse"></span>
              HOVER TO SCAN CODEX
            </span>
            <span className="text-yellow-500/40 group-hover:text-yellow-500 transition-colors font-sans">⟳ FLIP</span>
          </div>
        </div>

        {/* Back Side (Rotated 180 deg) */}
        <div 
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            transformOrigin: 'center center'
          }}
          className="!absolute inset-0 w-full h-full p-6 bg-[#1f1a12] border border-yellow-500/25 rounded-3xl flex flex-col justify-between shadow-2xl foil-shine"
        >
          {/* Tactical Back Corner Brackets */}
          <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-yellow-500/30 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-yellow-500/30 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-yellow-500/30 rounded-br-sm pointer-events-none" />

          {/* Back Content */}
          <div className="text-left flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-black font-mono text-yellow-500 uppercase tracking-[0.2em]">[ SYSTEM ENGAGED ]</span>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"></span>
              </div>
              <h4 className="text-xs font-black text-[#fdfcf9] font-mono uppercase tracking-wider mb-2">{title} Formula</h4>
              <p className="text-[11px] text-[#b8b3a0]/95 leading-relaxed font-sans">
                {detailedDesc}
              </p>
            </div>

            {/* In-game stats card */}
            <div className="bg-[#0f0e0a]/80 border border-yellow-500/15 rounded-xl p-3 my-1.5 text-[10px] font-mono">
              <div className="flex justify-between mb-1.5">
                <span className="text-[#b8b3a0]/40 uppercase tracking-widest text-[9px]">Modifier</span>
                <span className="text-yellow-400 font-bold tracking-wider">{statValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#b8b3a0]/40 uppercase tracking-widest text-[9px]">{statLabel}</span>
                <span className="text-red-400 font-bold uppercase tracking-widest">{difficulty}</span>
              </div>
            </div>

            <p className="text-[10px] text-yellow-500/80 italic font-mono leading-relaxed pl-3 border-l border-yellow-500/20">
              "{flavorText}"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
