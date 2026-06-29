import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, XCircle } from 'lucide-react';
import type { UserData } from '../types';

export function FriendsModal({ user, onClose, refreshUser }: { user: UserData; onClose: () => void; refreshUser: () => void }) {
  const [mockUsers, setMockUsers] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setMockUsers);
  }, []);

  const sendRequest = async (userId: string) => {
    await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    refreshUser();
  };

  const acceptRequest = async (userId: string) => {
    await fetch('/api/friends/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    refreshUser();
  };

  const rejectRequest = async (userId: string) => {
    await fetch('/api/friends/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    refreshUser();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-[#1a1712] border border-yellow-500/20 p-6 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-display text-[#fdfcf9]">Rivals & Allies</h2>
          <button onClick={onClose} className="text-[#b8b3a0] hover:text-[#fdfcf9]">
            <X size={20} />
          </button>
        </div>

        {/* Requests */}
        {user.friendRequests && user.friendRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-3">Incoming Challenges</h3>
            <div className="space-y-2">
              {user.friendRequests.map(id => {
                const reqUser = mockUsers.find(u => u.id === id) || { name: 'Unknown User', level: 1 };
                return (
                  <div key={id} className="flex items-center justify-between bg-[#211d15] p-3 rounded-lg border border-yellow-500/10">
                    <div>
                      <div className="font-bold text-[#fdfcf9]">{reqUser.name}</div>
                      <div className="text-xs text-[#b8b3a0]">Lvl {reqUser.level}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptRequest(id)} className="p-1.5 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded">
                        <Check size={16} />
                      </button>
                      <button onClick={() => rejectRequest(id)} className="p-1.5 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other users to challenge */}
        <div>
          <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-3">Find Rivals</h3>
          <div className="space-y-2">
            {mockUsers.filter(u => !user.friends?.includes(u.id)).map(u => {
              const isSent = user.sentRequests?.includes(u.id);
              const isIncoming = user.friendRequests?.includes(u.id);
              if (isIncoming) return null;
              
              return (
                <div key={u.id} className="flex items-center justify-between bg-[#211d15] p-3 rounded-lg border border-yellow-500/10">
                  <div>
                    <div className="font-bold text-[#fdfcf9]">{u.name}</div>
                    <div className="text-xs text-[#b8b3a0]">Lvl {u.level} | {u.xp} XP</div>
                  </div>
                  <button 
                    disabled={isSent}
                    onClick={() => sendRequest(u.id)} 
                    className={`text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors ${
                      isSent ? 'bg-yellow-500/10 text-yellow-500/50 cursor-not-allowed' : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                    }`}
                  >
                    {isSent ? 'Sent' : <><UserPlus size={14} /> Challenge</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Friends */}
        {user.friends && user.friends.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-3">Your Rivals</h3>
            <div className="space-y-2">
              {user.friends.map(id => {
                const reqUser = mockUsers.find(u => u.id === id) || { name: 'Unknown User', level: 1, xp: 0 };
                return (
                  <div key={id} className="flex items-center justify-between bg-[#211d15] p-3 rounded-lg border border-yellow-500/10">
                    <div>
                      <div className="font-bold text-[#fdfcf9]">{reqUser.name}</div>
                      <div className="text-xs text-[#b8b3a0]">Lvl {reqUser.level} | {reqUser.xp} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
