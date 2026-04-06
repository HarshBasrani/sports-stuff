import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Plus, Trash2, Trophy, Star, Hash } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';
import { usePlayers, Player } from '@/src/hooks/usePlayers';

export default function PlayerManager() {
  const { players, setPlayers } = usePlayers();
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const addPlayer = () => {
    if (!newName.trim()) return;
    hapticFeedback.success();
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName.trim(),
      wins: 0,
      losses: 0
    };
    setPlayers([...players, player]);
    setNewName('');
    setShowAdd(false);
  };

  const deletePlayer = (id: string) => {
    if (confirm('Delete this player?')) {
      hapticFeedback.heavy();
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display flex items-center gap-2 text-brand-primary">
          <User /> PLAYER PROFILES
        </h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="p-2 glass rounded-lg hover:bg-brand-primary hover:text-black transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {players.length === 0 ? (
          <div className="text-center py-12 glass rounded-3xl border-dashed border-2 border-white/10">
            <User size={48} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">No players added yet.</p>
            <button 
              onClick={() => setShowAdd(true)}
              className="mt-4 text-brand-primary font-bold text-sm uppercase tracking-widest hover:underline"
            >
              Add your first player
            </button>
          </div>
        ) : (
          players.map(player => (
            <div key={player.id} className="glass p-4 rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-xl font-display text-brand-primary">
                  {player.name[0]}
                </div>
                <div>
                  <h3 className="font-display text-xl text-white">{player.name}</h3>
                  <div className="flex gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Trophy size={10} className="text-yellow-500" /> {player.wins} W</span>
                    <span className="flex items-center gap-1"><Star size={10} className="text-zinc-600" /> {player.losses} L</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => deletePlayer(player.id)}
                className="p-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass p-8 rounded-3xl w-full max-w-sm"
            >
              <h3 className="text-2xl font-display mb-6">NEW PLAYER</h3>
              <input 
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter Name..."
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 font-display text-xl outline-none focus:border-brand-primary transition-colors mb-6"
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              />
              <div className="flex gap-3">
                <button 
                  onClick={addPlayer}
                  className="flex-1 py-4 bg-brand-primary text-black rounded-xl font-display text-xl tracking-widest"
                >
                  ADD PLAYER
                </button>
                <button 
                  onClick={() => setShowAdd(false)}
                  className="px-6 py-4 glass rounded-xl font-display text-xl tracking-widest"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
