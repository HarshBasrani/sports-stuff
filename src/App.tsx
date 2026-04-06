/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Timer, 
  Coins, 
  GitGraph, 
  Music, 
  Activity,
  ChevronRight,
  LayoutGrid,
  Settings,
  X,
  Hammer,
  Hash,
  User
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';

// Scoreboards
import BadmintonScoreboard from './components/Scoreboard/Badminton';
import VolleyballScoreboard from './components/Scoreboard/Volleyball';
import TennisScoreboard from './components/Scoreboard/Tennis';
import ChessClock from './components/Tools/ChessClock';
import UniversalScoreboard from './components/Scoreboard/Universal';

// Tools
import WhoGoesFirst from './components/Tools/WhoGoesFirst';
import BracketGenerator from './components/Tools/BracketGenerator';
import Soundboard from './components/Tools/Soundboard';
import IntervalTimer from './components/Tools/IntervalTimer';
import Stopwatch from './components/Tools/Stopwatch';
import RefereeToolbox from './components/Tools/RefereeToolbox';
import PlayerManager from './components/Tools/PlayerManager';

type View = 'menu' | 'badminton' | 'volleyball' | 'tennis' | 'chess' | 'who' | 'bracket' | 'sound' | 'hiit' | 'stopwatch' | 'universal' | 'players';

const ARENA_ITEMS = [
  { id: 'badminton', title: 'Badminton', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', desc: '21-point rally & service indicator' },
  { id: 'volleyball', title: 'Volleyball', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: '25-point rally & rotation tracker' },
  { id: 'tennis', title: 'Tennis', icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/10', desc: 'Love-15-30-40 & deuce system' },
  { id: 'chess', title: 'Chess Clock', icon: Timer, color: 'text-orange-500', bg: 'bg-orange-500/10', desc: 'Dual timer with blitz presets' },
  { id: 'universal', title: 'Universal', icon: Hash, color: 'text-brand-primary', bg: 'bg-brand-primary/10', desc: 'Customizable multi-sport counter' },
];

const UTILITY_ITEMS = [
  { id: 'bracket', title: 'Brackets', icon: GitGraph, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Knockout tournament generator' },
  { id: 'hiit', title: 'Intervals', icon: Activity, color: 'text-red-500', bg: 'bg-red-500/10', desc: 'Custom work/rest drill cycles' },
  { id: 'stopwatch', title: 'Stopwatch', icon: Timer, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'Precision lap timing' },
  { id: 'who', title: 'Coin Toss', icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-400/10', desc: 'Settle the start fairly' },
  { id: 'players', title: 'Profiles', icon: User, color: 'text-brand-accent', bg: 'bg-brand-accent/10', desc: 'Track player win/loss records' },
];

export default function App() {
  const [view, setView] = useState<View>('menu');
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);

  const renderView = () => {
    switch (view) {
      case 'badminton': return <BadmintonScoreboard />;
      case 'volleyball': return <VolleyballScoreboard />;
      case 'tennis': return <TennisScoreboard />;
      case 'chess': return <ChessClock />;
      case 'universal': return <UniversalScoreboard />;
      case 'who': return <WhoGoesFirst />;
      case 'bracket': return <BracketGenerator />;
      case 'sound': return <Soundboard />;
      case 'hiit': return <IntervalTimer />;
      case 'stopwatch': return <Stopwatch />;
      case 'players': return <PlayerManager />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-brand-primary/30">
      {/* Header */}
      <header className="p-4 flex items-center justify-between glass sticky top-0 z-40 border-b-2 border-brand-primary/20 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('menu')}>
          <div className="w-12 h-12 bg-brand-primary text-black rounded-lg flex items-center justify-center font-display text-3xl skew-x-[-12deg] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(57,255,20,0.5)]">
            S
          </div>
          <div>
            <h1 className="font-display text-2xl leading-none tracking-wider text-white">SPORTS STUFF</h1>
            <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.3em]">Pro Performance Suite</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {view !== 'menu' && (
            <button 
              onClick={() => { hapticFeedback.light(); setView('menu'); }}
              className="p-2 glass rounded-lg hover:bg-brand-primary hover:text-black transition-all group"
            >
              <LayoutGrid size={24} />
            </button>
          )}
          <button 
            onClick={() => { hapticFeedback.light(); setIsToolboxOpen(true); }}
            className="p-2 glass rounded-lg hover:bg-brand-primary hover:text-black transition-all border-brand-primary/50"
          >
            <Hammer size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'menu' ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 max-w-7xl mx-auto w-full space-y-12"
            >
              {/* Arena Section */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-primary/20" />
                  <h2 className="font-display text-3xl tracking-widest text-brand-primary">THE ARENA</h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-primary/20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {ARENA_ITEMS.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { hapticFeedback.medium(); setView(item.id as View); }}
                      className="sport-card p-6 text-left group flex flex-col h-full relative"
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:rotate-12", item.bg, item.color)}>
                        <item.icon size={24} />
                      </div>
                      <h3 className="text-xl font-display mb-1 text-white">{item.title}</h3>
                      <p className="text-xs text-zinc-500 font-medium line-clamp-2">{item.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Locker Room Section */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/20" />
                  <h2 className="font-display text-3xl tracking-widest text-purple-500">LOCKER ROOM</h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {UTILITY_ITEMS.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { hapticFeedback.medium(); setView(item.id as View); }}
                      className="glass rounded-2xl p-6 text-left group flex flex-col h-full border-l-4 border-purple-500/50 hover:border-purple-500 transition-all"
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", item.bg, item.color)}>
                        <item.icon size={20} />
                      </div>
                      <h3 className="text-lg font-display mb-1 text-white">{item.title}</h3>
                      <p className="text-xs text-zinc-500 font-medium">{item.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="view"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="h-full max-w-5xl mx-auto w-full p-4"
            >
              {renderView()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Referee Toolbox Drawer */}
      <RefereeToolbox 
        isOpen={isToolboxOpen} 
        onClose={() => setIsToolboxOpen(false)} 
      />

      {/* Footer / Quick Nav */}
      {view !== 'menu' && (
        <footer className="p-4 glass rounded-t-3xl mx-4 mb-4 flex justify-around items-center border-t-2 border-brand-primary/30 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button onClick={() => { hapticFeedback.light(); setView('menu'); }} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-brand-primary transition-colors">
            <LayoutGrid size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="font-display text-xl text-brand-primary tracking-widest">
            {view}
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <button 
            onClick={() => { hapticFeedback.light(); setIsToolboxOpen(true); }}
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-brand-primary transition-colors"
          >
            <Hammer size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Toolbox</span>
          </button>
        </footer>
      )}
    </div>
  );
}
