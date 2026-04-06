import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, RotateCcw, Play, Pause, Settings, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';

interface PlayerState {
  time: number;
  moves: number;
}

export default function ChessClock() {
  const [timeLimit, setTimeLimit] = useState(300); // 5 minutes default
  const [increment, setIncrement] = useState(0);
  const [player1, setPlayer1] = useState<PlayerState>({ time: 300, moves: 0 });
  const [player2, setPlayer2] = useState<PlayerState>({ time: 300, moves: 0 });
  const [activePlayer, setActivePlayer] = useState<1 | 2 | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    
    if (seconds < 10) {
      return `${secs}.${ms}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const switchTurn = useCallback((fromPlayer: 1 | 2) => {
    if (isPaused || activePlayer !== fromPlayer) return;
    
    hapticFeedback.light();
    if (fromPlayer === 1) {
      setPlayer1(prev => ({ 
        time: prev.time + increment, 
        moves: prev.moves + 1 
      }));
      setActivePlayer(2);
    } else {
      setPlayer2(prev => ({ 
        time: prev.time + increment, 
        moves: prev.moves + 1 
      }));
      setActivePlayer(1);
    }
  }, [activePlayer, increment, isPaused]);

  useEffect(() => {
    let interval: any;
    if (!isPaused && activePlayer) {
      interval = setInterval(() => {
        if (activePlayer === 1) {
          setPlayer1(prev => {
            if (prev.time <= 0) {
              setIsPaused(true);
              hapticFeedback.error();
              return { ...prev, time: 0 };
            }
            return { ...prev, time: prev.time - 0.1 };
          });
        } else {
          setPlayer2(prev => {
            if (prev.time <= 0) {
              setIsPaused(true);
              hapticFeedback.error();
              return { ...prev, time: 0 };
            }
            return { ...prev, time: prev.time - 0.1 };
          });
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activePlayer, isPaused]);

  const reset = () => {
    if (confirm('Reset clocks?')) {
      hapticFeedback.heavy();
      setPlayer1({ time: timeLimit, moves: 0 });
      setPlayer2({ time: timeLimit, moves: 0 });
      setActivePlayer(null);
      setIsPaused(true);
    }
  };

  const applySettings = () => {
    setPlayer1({ time: timeLimit, moves: 0 });
    setPlayer2({ time: timeLimit, moves: 0 });
    setActivePlayer(null);
    setIsPaused(true);
    setShowSettings(false);
    hapticFeedback.success();
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display flex items-center gap-2 text-brand-primary">
          <Timer /> CHESS CLOCK
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
          >
            <Settings size={20} />
          </button>
          <button onClick={reset} className="p-2 glass rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Player 2 (Top) */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => switchTurn(2)}
          disabled={activePlayer === 1}
          className={cn(
            "flex-1 rounded-[3rem] p-8 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden",
            activePlayer === 2 ? "bg-brand-secondary text-black" : "glass text-zinc-500 rotate-180"
          )}
        >
          <div className="absolute top-8 flex items-center gap-2 opacity-50">
            <User size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Player 2</span>
          </div>
          <span className="text-8xl font-display leading-none">
            {formatTime(player2.time)}
          </span>
          <div className="mt-4 text-sm font-bold uppercase tracking-[0.3em] opacity-50">
            Moves: {player2.moves}
          </div>
        </motion.button>

        {/* Controls */}
        <div className="flex justify-center gap-4 py-2">
          <button 
            onClick={() => {
              hapticFeedback.medium();
              if (activePlayer === null) setActivePlayer(1);
              setIsPaused(!isPaused);
            }}
            className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
          >
            {isPaused ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />}
          </button>
        </div>

        {/* Player 1 (Bottom) */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => switchTurn(1)}
          disabled={activePlayer === 2}
          className={cn(
            "flex-1 rounded-[3rem] p-8 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden",
            activePlayer === 1 ? "bg-brand-primary text-black" : "glass text-zinc-500"
          )}
        >
          <div className="absolute top-8 flex items-center gap-2 opacity-50">
            <User size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Player 1</span>
          </div>
          <span className="text-8xl font-display leading-none">
            {formatTime(player1.time)}
          </span>
          <div className="mt-4 text-sm font-bold uppercase tracking-[0.3em] opacity-50">
            Moves: {player1.moves}
          </div>
        </motion.button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass p-8 rounded-[2.5rem] w-full max-w-md border border-white/10"
            >
              <h3 className="text-3xl font-display mb-8 tracking-wider">CLOCK SETTINGS</h3>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Time Limit (Minutes)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 5, 10].map(m => (
                      <button 
                        key={m}
                        onClick={() => setTimeLimit(m * 60)}
                        className={cn(
                          "py-3 rounded-xl font-display text-xl transition-all",
                          timeLimit === m * 60 ? "bg-brand-primary text-black" : "glass text-zinc-400"
                        )}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Increment (Seconds)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 2, 5, 10].map(s => (
                      <button 
                        key={s}
                        onClick={() => setIncrement(s)}
                        className={cn(
                          "py-3 rounded-xl font-display text-xl transition-all",
                          increment === s ? "bg-brand-primary text-black" : "glass text-zinc-400"
                        )}
                      >
                        +{s}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <button 
                  onClick={applySettings}
                  className="flex-1 py-5 bg-brand-primary text-black rounded-2xl font-display text-2xl tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                >
                  APPLY
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-8 py-5 glass rounded-2xl font-display text-2xl tracking-widest"
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
