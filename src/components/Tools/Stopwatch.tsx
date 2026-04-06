import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, RotateCcw, Play, Pause, Flag, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';

interface Lap {
  id: string;
  time: number;
  diff: number;
}

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const timerRef = useRef<any>(null);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return {
      mins: mins.toString().padStart(2, '0'),
      secs: secs.toString().padStart(2, '0'),
      centis: centis.toString().padStart(2, '0')
    };
  };

  useEffect(() => {
    if (isRunning) {
      const start = Date.now() - time;
      timerRef.current = setInterval(() => {
        setTime(Date.now() - start);
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const toggle = () => {
    hapticFeedback.medium();
    setIsRunning(!isRunning);
  };

  const reset = () => {
    hapticFeedback.heavy();
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const addLap = () => {
    hapticFeedback.light();
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const newLap: Lap = {
      id: Math.random().toString(36).substr(2, 9),
      time: time,
      diff: time - lastLapTime
    };
    setLaps([newLap, ...laps]);
  };

  const { mins, secs, centis } = formatTime(time);

  return (
    <div className="flex flex-col h-full p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display flex items-center gap-2 text-brand-primary">
          <Timer /> STOPWATCH
        </h2>
        <button onClick={reset} className="p-2 glass rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Main Display */}
      <div className="flex flex-col items-center justify-center py-12 relative">
        <div className="flex items-baseline gap-2">
          <span className="text-8xl font-display text-white tracking-tighter w-24 text-center">{mins}</span>
          <span className="text-4xl font-display text-zinc-700">:</span>
          <span className="text-8xl font-display text-white tracking-tighter w-24 text-center">{secs}</span>
          <span className="text-4xl font-display text-brand-primary tracking-tighter w-16 text-center">.{centis}</span>
        </div>
        
        {/* Progress Ring (Decorative) */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-10">
          <div className="w-80 h-80 rounded-full border-8 border-brand-primary animate-pulse" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6">
        <button 
          onClick={addLap}
          disabled={!isRunning && time === 0}
          className="w-20 h-20 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <Flag size={28} />
        </button>
        <button 
          onClick={toggle}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl scale-110",
            isRunning ? "bg-brand-secondary text-black" : "bg-brand-primary text-black"
          )}
        >
          {isRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
        </button>
        <button 
          onClick={reset}
          className="w-20 h-20 rounded-full glass flex items-center justify-center hover:bg-red-500/10 text-red-400 transition-colors"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      {/* Laps List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        <AnimatePresence initial={false}>
          {laps.map((lap, index) => {
            const { mins: lm, secs: ls, centis: lc } = formatTime(lap.time);
            const { mins: dm, secs: ds, centis: dc } = formatTime(lap.diff);
            return (
              <motion.div 
                key={lap.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-4 rounded-2xl flex items-center justify-between group border-l-4 border-brand-primary/50"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Lap {laps.length - index}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-display text-white">{lm}:{ls}</span>
                    <span className="text-sm font-display text-brand-primary">.{lc}</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-zinc-500">
                  +{dm}:{ds}.{dc}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
