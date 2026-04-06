import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, ArrowLeftRight, User, Info, Mic, MicOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { usePlayers } from '@/src/hooks/usePlayers';
import MatchTimeline, { LogEntry } from '../Common/MatchTimeline';

export default function BadmintonScoreboard() {
  const { players, addWin, addLoss } = usePlayers();
  const [scoreA, setScoreA] = useLocalStorage('badminton_scoreA', 0);
  const [scoreB, setScoreB] = useLocalStorage('badminton_scoreB', 0);
  const [server, setServer] = useLocalStorage<'A' | 'B'>('badminton_server', 'A');
  const [history, setHistory] = useLocalStorage<any[]>('badminton_history', []);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('badminton_logs', []);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [selectedPlayerA, setSelectedPlayerA] = useLocalStorage('badminton_playerA', '');
  const [selectedPlayerB, setSelectedPlayerB] = useLocalStorage('badminton_playerB', '');

  const addPoint = (team: 'A' | 'B') => {
    if (winner) return;
    
    setHistory([...history, { a: scoreA, b: scoreB, s: server }]);
    
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
      setServer('A');
      checkWinner(newScoreA, scoreB, 'A');
    } else {
      setScoreB(newScoreB);
      setServer('B');
      checkWinner(scoreA, newScoreB, 'B');
    }
  };

  const checkWinner = (a: number, b: number, lastPoint: 'A' | 'B') => {
    if (a >= 21 || b >= 21) {
      if (Math.abs(a - b) >= 2 || a === 30 || b === 30) {
        setWinner(a > b ? 'A' : 'B');
        hapticFeedback.success();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
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
    reset();
  };

  const undo = () => {
    if (history.length === 0) return;
    hapticFeedback.light();
    const last = history[history.length - 1];
    setScoreA(last.a);
    setScoreB(last.b);
    setServer(last.s);
    setWinner(null);
    setHistory(history.slice(0, -1));
    setLogs(logs.slice(0, -1));
  };

  const reset = () => {
    if (confirm('Reset match?')) {
      hapticFeedback.heavy();
      setScoreA(0);
      setScoreB(0);
      setServer('A');
      setHistory([]);
      setLogs([]);
      setWinner(null);
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

  const getServiceSide = (score: number) => {
    return score % 2 === 0 ? 'Right (Even)' : 'Left (Odd)';
  };

  const showSwitchReminder = (scoreA === 11 || scoreB === 11) && (scoreA + scoreB === 11 || (scoreA === 11 && scoreB < 11) || (scoreB === 11 && scoreA < 11));

  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display flex items-center gap-2 text-brand-primary">
          <Trophy /> BADMINTON
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
          <button onClick={reset} className="p-2 glass rounded-full hover:bg-red-500/20 text-red-400 transition-colors">
            <RotateCcw size={20} className="rotate-180" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Team A */}
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
            className={cn(
              "relative flex flex-col items-center justify-center rounded-3xl glass p-8 transition-all duration-300",
              server === 'A' ? "ring-2 ring-brand-primary bg-brand-primary/5" : ""
            )}
            whileTap={{ scale: 0.98 }}
            onClick={() => addPoint('A')}
          >
            <AnimatePresence mode="wait">
              <motion.span 
                key={scoreA}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-9xl font-display text-brand-primary"
              >
                {scoreA}
              </motion.span>
            </AnimatePresence>

            {server === 'A' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 px-4 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-[10px] font-bold tracking-widest"
              >
                SERVING: {getServiceSide(scoreA)}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Team B */}
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
            className={cn(
              "relative flex flex-col items-center justify-center rounded-3xl glass p-8 transition-all duration-300",
              server === 'B' ? "ring-2 ring-brand-secondary bg-brand-secondary/5" : ""
            )}
            whileTap={{ scale: 0.98 }}
            onClick={() => addPoint('B')}
          >
            <AnimatePresence mode="wait">
              <motion.span 
                key={scoreB}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-9xl font-display text-brand-secondary"
              >
                {scoreB}
              </motion.span>
            </AnimatePresence>

            {server === 'B' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 px-4 py-1 bg-brand-secondary/20 text-brand-secondary rounded-full text-[10px] font-bold tracking-widest"
              >
                SERVING: {getServiceSide(scoreB)}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Timeline Integration */}
      <MatchTimeline logs={logs} teamAName={selectedPlayerA || 'Team A'} teamBName={selectedPlayerB || 'Team B'} />

      {/* Info Bar */}
      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <Info size={14} />
          <span>21 points • 2 lead • Max 30</span>
        </div>
        {showSwitchReminder && !winner && (
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-2 text-brand-primary font-bold text-xs"
          >
            <ArrowLeftRight size={14} />
            <span>SWITCH SIDES!</span>
          </motion.div>
        )}
      </div>

      {/* Winner Overlay */}
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
