import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hammer, Music, Coins, Timer, X, Volume2, Bell, Megaphone } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import WhoGoesFirst from './WhoGoesFirst';
import Soundboard from './Soundboard';

interface RefereeToolboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RefereeToolbox({ isOpen, onClose }: RefereeToolboxProps) {
  const [activeTab, setActiveTab] = useState<'sounds' | 'toss'>('sounds');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md glass z-[70] border-l-2 border-brand-primary/30 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary text-black rounded-lg flex items-center justify-center">
                  <Hammer size={24} />
                </div>
                <h2 className="font-display text-2xl tracking-wider">REFEREE TOOLBOX</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex p-2 bg-zinc-950/50 m-4 rounded-xl border border-white/5">
              <button 
                onClick={() => setActiveTab('sounds')}
                className={cn(
                  "flex-1 py-3 rounded-lg font-display text-lg tracking-widest transition-all flex items-center justify-center gap-2",
                  activeTab === 'sounds' ? "bg-brand-primary text-black shadow-lg" : "text-zinc-500 hover:text-white"
                )}
              >
                <Music size={18} /> SOUNDS
              </button>
              <button 
                onClick={() => setActiveTab('toss')}
                className={cn(
                  "flex-1 py-3 rounded-lg font-display text-lg tracking-widest transition-all flex items-center justify-center gap-2",
                  activeTab === 'toss' ? "bg-brand-primary text-black shadow-lg" : "text-zinc-500 hover:text-white"
                )}
              >
                <Coins size={18} /> TOSS
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === 'sounds' ? (
                <div className="space-y-4">
                  <Soundboard />
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <WhoGoesFirst />
                </div>
              )}
            </div>

            <div className="p-6 bg-zinc-900/50 border-t border-white/10 text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Quick Access Tools • Sports Stuff Pro</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
