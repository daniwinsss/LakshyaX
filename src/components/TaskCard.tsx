import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Flame, Shield, Skull } from 'lucide-react';

interface TaskCardProps {
  onSubmit: (title: string, difficulty: 'low' | 'medium' | 'high') => void;
  isGenerating: boolean;
}

export default function TaskCard({ onSubmit, isGenerating }: TaskCardProps) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'low' | 'medium' | 'high'>('medium');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title, difficulty);
    setTitle('');
  };
  
  return (
    <div className="glass-card p-5 border border-yellow-500/15 bg-[#16130e]/95 text-[#fdfcf9] rounded-3xl shadow-xl z-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Prepare for DBMS Exam..."
            className="flex-1 bg-[#211d15] border border-yellow-500/20 rounded-xl px-4 py-2.5 text-sm font-medium text-[#fdfcf9] placeholder-[#b8b3a0]/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            disabled={isGenerating}
          />
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-55"
            disabled={isGenerating || !title.trim()}
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
            Generate Quest Chain
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#b8b3a0] uppercase tracking-wider">Difficulty Level:</span>
          <div className="flex bg-[#211d15] rounded-lg border border-yellow-500/10 p-1 gap-1">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                  difficulty === level 
                    ? level === 'low' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      level === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'text-[#b8b3a0]/60 border-transparent hover:bg-white/5'
                }`}
              >
                {level === 'low' && <Shield size={12} />}
                {level === 'medium' && <Flame size={12} />}
                {level === 'high' && <Skull size={12} />}
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
