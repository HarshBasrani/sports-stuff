import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Users, Info, ChevronRight, Mic, MicOff, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { usePlayers } from '@/src/hooks/usePlayers';
import MatchTimeline, { LogEntry } from '../Common/MatchTimeline';

export default function VolleyballScoreboard() {
  const { players, addWin, addLoss } = usePlayers();
  const [scoreA, setScoreA] = useLocalStorage('volleyball_scoreA', 0);
  const [scoreB, setScoreB] = useLocalStorage('volleyball_scoreB', 0);
  const [setsA, setSetsA] = useLocalStorage('volleyball_setsA', 0);
  const [setsB, setSetsB] = useLocalStorage('volleyball_setsB', 0);
  const [server, setServer] = useLocalStorage<'A' | 'B'>('volleyball_server', 'A');
  const [rotation, setRotation] = useLocalStorage('volleyball_rotation', 1); // 1 to 6
  const [history, setHistory] = useLocalStorage<any[]>('volleyball_history', []);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('volleyball_logs', []);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [selectedPlayerA, setSelectedPlayerA] = useLocalStorage('volleyball_playerA', '');
  const [selectedPlayerB, setSelectedPlayerB] = useLocalStorage('volleyball_playerB', '');

  const targetPoints = (setsA + setsB === 4) ? 15 : 25;

  const addPoint = (team: 'A' | 'B') => {
    if (winner) return;

    setHistory([...history, { scoreA, scoreB, setsA, setsB, server, rotation }]);

    const newScoreA = team === 'A' ? scoreA + 1 : scoreA;
    const newScoreB = team === 'B' ? scoreB + 1 : scoreB;
    
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      team,
      scoreA: newScoreA,
      scoreB: newScoreB,
      type: 'point'
    };
    setLogs([...logs, newLog]);
    hapticFeedback.medium();

    if (team === 'A') {
      setScoreA(newScoreA);
      if (server === 'B') {
        setServer('A');
        setRotation(prev => (prev % 6) + 1);
      }
      checkSet(newScoreA, scoreB, 'A');
    } else {
      setScoreB(newScoreB);
      if (server === 'A') {
        setServer('B');
      }
      checkSet(scoreA, newScoreB, 'B');
    }
  };

  const checkSet = (a: number, b: number, lastPoint: 'A' | 'B') => {
    if (a >= targetPoints || b >= targetPoints) {
      if (Math.abs(a - b) >= 2) {
        if (a > b) {
          const newSets = setsA + 1;
          setSetsA(newSets);
          const setLog: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            team: 'A',
            scoreA: a,
            scoreB: b,
            type: 'set',
            message: `Set ${setsA + setsB + 1} won by Team A`
          };
          setLogs([...logs, setLog]);
          
          if (newSets === 3) {
            setWinner('A');
            hapticFeedback.success();
            confetti();
          } else {
            hapticFeedback.success();
            resetSet();
          }
        } else {
          const newSets = setsB + 1;
          setSetsB(newSets);
          const setLog: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            team: 'B',
            scoreA: a,
            scoreB: b,
            type: 'set',
            message: `Set ${setsA + setsB + 1} won by Team B`
          };
          setLogs([...logs, setLog]);

          if (newSets === 3) {
            setWinner('B');
            hapticFeedback.success();
            confetti();
          } else {
            hapticFeedback.success();
            resetSet();
          }
        }
      }
    }
  };

  const handleMatchEnd = () => {
    hapticFeedback.light();
    if (winner === 'A') {
      if (selectedPlayerA) addWin(selectedPlayerA);
      if (selectedPlayerB) addLoss(selectedPlayerB);
    } else if (winner === 'B') {
      if (selectedPlayerB) addWin(selectedPlayerB);
      if (selectedPlayerA) addLoss(selectedPlayerA);
    }
    resetMatch();
  };

  const resetSet = () => {
    setScoreA(0);
    setScoreB(0);
  };

  const resetMatch = () => {
    if (confirm('Reset match?')) {
      hapticFeedback.heavy();
      setScoreA(0);
      setScoreB(0);
      setSetsA(0);
      setSetsB(0);
      setServer('A');
      setRotation(1);
      setHistory([]);
      setLogs([]);
      setWinner(null);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    hapticFeedback.light();
    const last = history[history.length - 1];
    setScoreA(last.scoreA);
    setScoreB(last.scoreB);
    setSetsA(last.setsA);
    setSetsB(last.setsB);
    setServer(last.server);
    setRotation(last.rotation);
    setHistory(history.slice(0, -1));
    setLogs(logs.slice(0, -1));
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
        addPoint('A');
      } else if (command.includes('point blue') || command.includes('point b') || command.includes('score b')) {
        addPoint('B');
      } else if (command.includes('undo')) {
        undo();
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [isVoiceActive, scoreA, scoreB, server]);

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display flex items-center gap-2 text-brand-primary">
          <Users /> VOLLEYBALL
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
          <button onClick={undo} className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
            <RotateCcw size={20} />
          </button>
          <button onClick={resetMatch} className="p-2 glass rounded-full hover:bg-red-500/20 text-red-400 transition-colors">
            <RotateCcw size={20} className="rotate-180" />
          </button>
        </div>
      </div>

      {/* Sets Tracker */}
      <div className="flex justify-center gap-8 py-2">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Sets A</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn("w-8 h-2 rounded-full transition-colors", i <= setsA ? "bg-brand-primary" : "bg-zinc-800")} />
            ))}
          </div>
        </div>
        <div className="text-2xl font-display text-zinc-600">VS</div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Sets B</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn("w-8 h-2 rounded-full transition-colors", i <= setsB ? "bg-brand-secondary" : "bg-zinc-800")} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <select 
            value={selectedPlayerA}
            onChange={(e) => setSelectedPlayerA(e.target.value)}
            className="bg-transparent border-none text-center font-display text-lg text-zinc-500 focus:text-brand-primary outline-none"
          >
            <option value="">TEAM A</option>
            {players.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <motion.div 
            className={cn("relative flex flex-col items-center justify-center rounded-3xl glass p-8", server === 'A' && "ring-2 ring-brand-primary shadow-[0_0_20px_rgba(57,255,20,0.2)]")}
            onClick={() => addPoint('A')}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-8xl font-display text-brand-primary">{scoreA}</span>
            {server === 'A' && <div className="absolute top-4 right-4 w-4 h-4 bg-brand-primary rounded-full animate-ping" />}
          </motion.div>
        </div>

        <div className="flex flex-col gap-2">
          <select 
            value={selectedPlayerB}
            onChange={(e) => setSelectedPlayerB(e.target.value)}
            className="bg-transparent border-none text-center font-display text-lg text-zinc-500 focus:text-brand-secondary outline-none"
          >
            <option value="">TEAM B</option>
            {players.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <motion.div 
            className={cn("relative flex flex-col items-center justify-center rounded-3xl glass p-8", server === 'B' && "ring-2 ring-brand-secondary shadow-[0_0_20px_rgba(255,77,0,0.2)]")}
            onClick={() => addPoint('B')}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-8xl font-display text-brand-secondary">{scoreB}</span>
            {server === 'B' && <div className="absolute top-4 right-4 w-4 h-4 bg-brand-secondary rounded-full animate-ping" />}
          </motion.div>
        </div>
      </div>

      {/* Timeline Integration */}
      <MatchTimeline logs={logs} teamAName={selectedPlayerA || 'Team A'} teamBName={selectedPlayerB || 'Team B'} />

      {/* Rotation Tracker */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
            <RotateCcw size={14} className="text-zinc-400" /> Rotation Tracker (Team A)
          </span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Position {rotation}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          {[4, 3, 2, 5, 6, 1].map((pos) => (
            <div 
              key={pos} 
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all",
                rotation === pos ? "bg-brand-primary text-black scale-110 shadow-lg" : "bg-zinc-800 text-zinc-500"
              )}
            >
              {pos}
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-3 flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
        <Info size={14} />
        <span>Set {setsA + setsB + 1} • {targetPoints} points to win set • 2 point lead required.</span>
      </div>

      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <div className="glass p-12 rounded-3xl text-center max-w-md w-full neo-shadow border-2 border-brand-primary/50">
              <Trophy size={80} className="mx-auto text-brand-primary mb-6" />
              <h3 className="text-5xl font-display mb-2">MATCH POINT!</h3>
              <p className="text-2xl text-zinc-400 mb-8 font-display tracking-widest uppercase">
                {winner === 'A' ? (selectedPlayerA || 'TEAM A') : (selectedPlayerB || 'TEAM B')} WINS
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleMatchEnd}
                  className="w-full py-4 bg-brand-primary text-black rounded-xl font-display text-xl tracking-widest hover:scale-105 transition-transform"
                >
                  SAVE & NEW MATCH
                </button>
                <button 
                  onClick={() => setWinner(null)}
                  className="w-full py-4 glass rounded-xl font-display text-xl tracking-widest hover:bg-white/10 transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
