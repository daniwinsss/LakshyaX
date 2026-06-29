import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Flame, Shield, Skull } from 'lucide-react';

interface TaskCardProps {
  onSubmit: (title: string, deadline?: string, isHabit?: boolean) => void;
  isGenerating: boolean;
}

export default function TaskCard({ onSubmit, isGenerating }: TaskCardProps) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isHabit, setIsHabit] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title, deadline || undefined, isHabit);
    setTitle('');
    setDeadline('');
    setIsHabit(false);
  };
  
  return (
    <div className="glass-card p-3 md:p-4 border border-yellow-500/15 bg-[#16130e]/95 text-[#fdfcf9] rounded-2xl shadow-xl z-10 w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent pointer-events-none" />
      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col lg:flex-row gap-3">
        <input 
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Prepare for DBMS Exam or Read 10 Pages..."
          className="flex-1 min-w-0 bg-[#211d15] border border-yellow-500/20 rounded-xl px-4 py-3 text-sm font-medium text-[#fdfcf9] placeholder-[#b8b3a0]/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 transition-all shadow-inner"
          disabled={isGenerating}
        />
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 lg:shrink-0">
          <label className="flex items-center gap-2 px-3 py-3 bg-[#211d15]/50 hover:bg-[#211d15] border border-yellow-500/10 rounded-xl text-[#b8b3a0] hover:text-yellow-500 transition-colors text-xs font-bold cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={isHabit}
              onChange={e => setIsHabit(e.target.checked)}
              className="w-4 h-4 rounded border-yellow-500/50 text-yellow-500 focus:ring-yellow-500/20 cursor-pointer accent-yellow-500"
              disabled={isGenerating}
            />
            Recurring Habit
          </label>
          {!isHabit && (
            <input 
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="flex-1 lg:flex-none bg-[#211d15] border border-yellow-500/20 rounded-xl px-3 py-3 text-xs md:text-sm font-medium text-[#fdfcf9] placeholder-[#b8b3a0]/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 transition-all shadow-inner"
              disabled={isGenerating}
              title="Quest Deadline (Optional)"
            />
          )}
          <button 
            type="submit" 
            className="w-full lg:w-auto px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-55 shadow-md shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-0.5 active:translate-y-0"
            disabled={isGenerating || !title.trim()}
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
            {isHabit ? 'Create Habit' : 'Generate Quest'}
          </button>
        </div>
      </form>
    </div>
  );
}
