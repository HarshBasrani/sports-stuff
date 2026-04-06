import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Plus, Minus, Hash, Mic, MicOff } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import MatchTimeline, { LogEntry } from '../Common/MatchTimeline';

export default function UniversalScoreboard() {
  const [scoreA, setScoreA] = useLocalStorage('universal_scoreA', 0);
  const [scoreB, setScoreB] = useLocalStorage('universal_scoreB', 0);
  const [target, setTarget] = useLocalStorage('universal_target', 21);
  const [teamAName, setTeamAName] = useLocalStorage('universal_teamAName', 'TEAM A');
  const [teamBName, setTeamBName] = useLocalStorage('universal_teamBName', 'TEAM B');
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('universal_logs', []);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const addPoint = (team: 'A' | 'B', amount: number = 1) => {
    const newScoreA = team === 'A' ? Math.max(0, scoreA + amount) : scoreA;
    const newScoreB = team === 'B' ? Math.max(0, scoreB + amount) : scoreB;
    
    if (amount > 0) {
      hapticFeedback.medium();
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        team,
        scoreA: newScoreA,
        scoreB: newScoreB,
        type: 'point'
      };
      setLogs([...logs, newLog]);
    }

    if (team === 'A') setScoreA(newScoreA);
    else setScoreB(newScoreB);
  };

  const reset = () => {
    if (confirm('Reset scores?')) {
      hapticFeedback.heavy();
      setScoreA(0);
      setScoreB(0);
      setLogs([]);
    }
  };

  // Voice Control Implementation
  useEffect(() => {
    if (!isVoiceActive) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser.');
      setIsVoiceActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase();
      
      if (command.includes('point red') || command.includes('point a') || command.includes('score a')) {
        addPoint('A', 1);
      } else if (command.includes('point blue') || command.includes('point b') || command.includes('score b')) {
        addPoint('B', 1);
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [isVoiceActive, scoreA, scoreB]);

  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display flex items-center gap-2 text-brand-primary">
          <Hash /> UNIVERSAL COUNTER
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={cn(
              "p-2 glass rounded-full transition-all",
              isVoiceActive ? "bg-brand-primary text-black shadow-[0_0_15px_rgba(57,255,20,0.5)]" : "text-zinc-500"
            )}
            title="Voice Control"
          >
            {isVoiceActive ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button onClick={reset} className="p-2 glass rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Team A */}
        <div className="flex flex-col gap-4">
          <input 
            value={teamAName} 
            onChange={(e) => setTeamAName(e.target.value.toUpperCase())}
            className="bg-transparent border-none text-center font-display text-2xl text-zinc-500 focus:text-brand-primary outline-none"
          />
          <div className="h-64 glass rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
            <button 
              onClick={() => addPoint('A', 1)}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              <span className="text-9xl font-display text-brand-primary group-hover:scale-110 transition-transform">{scoreA}</span>
            </button>
            <div className="absolute bottom-6 flex gap-4 z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); addPoint('A', -1); }}
                className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10"
              >
                <Minus size={24} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); addPoint('A', 1); }}
                className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Team B */}
        <div className="flex flex-col gap-4">
          <input 
            value={teamBName} 
            onChange={(e) => setTeamBName(e.target.value.toUpperCase())}
            className="bg-transparent border-none text-center font-display text-2xl text-zinc-500 focus:text-brand-secondary outline-none"
          />
          <div className="h-64 glass rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
            <button 
              onClick={() => addPoint('B', 1)}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              <span className="text-9xl font-display text-brand-secondary group-hover:scale-110 transition-transform">{scoreB}</span>
            </button>
            <div className="absolute bottom-6 flex gap-4 z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); addPoint('B', -1); }}
                className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10"
              >
                <Minus size={24} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); addPoint('B', 1); }}
                className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Integration */}
      <MatchTimeline logs={logs} teamAName={teamAName} teamBName={teamBName} />

      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Score:</span>
          <div className="flex gap-2">
            {[11, 15, 21, 25].map(t => (
              <button 
                key={t}
                onClick={() => setTarget(t)}
                className={cn("px-3 py-1 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-widest", target === t ? "bg-brand-primary text-black" : "glass text-zinc-400")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-bold text-zinc-600 italic uppercase tracking-widest">Tap large numbers to add points</div>
      </div>
    </div>
  );
}
