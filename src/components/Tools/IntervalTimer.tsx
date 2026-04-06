import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, RotateCcw, Play, Pause, Settings, Dumbbell, Coffee, Trophy } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';

type TimerPhase = 'prepare' | 'work' | 'rest' | 'finished';

export default function IntervalTimer() {
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<TimerPhase>('prepare');
  const [timeLeft, setTimeLeft] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef<any>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            handlePhaseTransition();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, phase, currentRound]);

  const handlePhaseTransition = () => {
    if (phase === 'prepare') {
      setPhase('work');
      setTimeLeft(workTime);
      hapticFeedback.success();
    } else if (phase === 'work') {
      if (currentRound >= rounds) {
        setPhase('finished');
        setIsRunning(false);
        hapticFeedback.heavy();
      } else {
        setPhase('rest');
        setTimeLeft(restTime);
        hapticFeedback.medium();
      }
    } else if (phase === 'rest') {
      setPhase('work');
      setCurrentRound(prev => prev + 1);
      setTimeLeft(workTime);
      hapticFeedback.success();
    }
  };

  const reset = () => {
    if (confirm('Reset timer?')) {
      hapticFeedback.heavy();
      setIsRunning(false);
      setPhase('prepare');
      setTimeLeft(5);
      setCurrentRound(1);
    }
  };

  const applySettings = () => {
    reset();
    setShowSettings(false);
    hapticFeedback.success();
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'prepare': return 'text-yellow-500';
      case 'work': return 'text-brand-primary';
      case 'rest': return 'text-brand-secondary';
      case 'finished': return 'text-purple-500';
      default: return 'text-white';
    }
  };

  const getPhaseIcon = () => {
    switch (phase) {
      case 'prepare': return <Timer size={48} />;
      case 'work': return <Dumbbell size={48} />;
      case 'rest': return <Coffee size={48} />;
      case 'finished': return <Trophy size={48} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display flex items-center gap-2 text-brand-primary">
          <Timer /> INTERVAL TIMER
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(true)} className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={reset} className="p-2 glass rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Main Display */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em] mb-4">
          Round {currentRound} of {rounds}
        </div>
        
        <motion.div 
          key={phase}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("mb-8 transition-colors duration-500", getPhaseColor())}
        >
          {getPhaseIcon()}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={timeLeft}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={cn("text-9xl font-display transition-colors duration-500", getPhaseColor())}
          >
            {formatTime(timeLeft)}
          </motion.div>
        </AnimatePresence>

        <div className={cn("mt-8 text-2xl font-display tracking-widest uppercase transition-colors duration-500", getPhaseColor())}>
          {phase}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div 
            className={cn("h-full transition-colors duration-500", phase === 'work' ? "bg-brand-primary" : "bg-brand-secondary")}
            initial={{ width: '0%' }}
            animate={{ width: `${(timeLeft / (phase === 'work' ? workTime : restTime)) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6">
        <button 
          onClick={() => { hapticFeedback.medium(); setIsRunning(!isRunning); }}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl scale-110",
            isRunning ? "bg-brand-secondary text-black" : "bg-brand-primary text-black"
          )}
        >
          {isRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
        </button>
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
              <h3 className="text-3xl font-display mb-8 tracking-wider">TIMER SETTINGS</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Work Time (Sec)</label>
                  <input 
                    type="number" 
                    value={workTime} 
                    onChange={(e) => setWorkTime(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 font-display text-xl outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Rest Time (Sec)</label>
                  <input 
                    type="number" 
                    value={restTime} 
                    onChange={(e) => setRestTime(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 font-display text-xl outline-none focus:border-brand-secondary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-2 block">Rounds</label>
                  <input 
                    type="number" 
                    value={rounds} 
                    onChange={(e) => setRounds(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 font-display text-xl outline-none focus:border-purple-500"
                  />
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
