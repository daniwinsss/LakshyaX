import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Flame, Shield, Skull } from 'lucide-react';

interface TaskCardProps {
  onSubmit: (title: string, deadline?: string) => void;
  isGenerating: boolean;
}

export default function TaskCard({ onSubmit, isGenerating }: TaskCardProps) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title, deadline || undefined);
    setTitle('');
    setDeadline('');
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
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="bg-[#211d15] border border-yellow-500/20 rounded-xl px-3 py-2.5 text-sm font-medium text-[#fdfcf9] placeholder-[#b8b3a0]/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              disabled={isGenerating}
              title="Quest Deadline (Optional)"
            />
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-55"
              disabled={isGenerating || !title.trim()}
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
              Generate Quest
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
