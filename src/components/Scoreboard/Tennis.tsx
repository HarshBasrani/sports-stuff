import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Info, User, Mic, MicOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { usePlayers } from '@/src/hooks/usePlayers';
import MatchTimeline, { LogEntry } from '../Common/MatchTimeline';

type TennisPoint = 0 | 15 | 30 | 40 | 'AD';

export default function TennisScoreboard() {
  const { players, addWin, addLoss } = usePlayers();
  const [pointsA, setPointsA] = useLocalStorage<number>('tennis_pointsA', 0);
  const [pointsB, setPointsB] = useLocalStorage<number>('tennis_pointsB', 0);
  const [gamesA, setGamesA] = useLocalStorage('tennis_gamesA', 0);
  const [gamesB, setGamesB] = useLocalStorage('tennis_gamesB', 0);
  const [setsA, setSetsA] = useLocalStorage('tennis_setsA', 0);
  const [setsB, setSetsB] = useLocalStorage('tennis_setsB', 0);
  const [server, setServer] = useLocalStorage<'A' | 'B'>('tennis_server', 'A');
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('tennis_logs', []);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [selectedPlayerA, setSelectedPlayerA] = useLocalStorage('tennis_playerA', '');
  const [selectedPlayerB, setSelectedPlayerB] = useLocalStorage('tennis_playerB', '');

  const getPointLabel = (p: number, otherP: number): string => {
    if (p === 0) return '0';
    if (p === 1) return '15';
    if (p === 2) return '30';
    if (p === 3) return '40';
    if (p > 3) {
      if (p === otherP) return '40';
      if (p > otherP) return 'AD';
      return '40';
    }
    return '0';
  };

  const addPoint = (team: 'A' | 'B') => {
    if (winner) return;

    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      team,
      scoreA: pointsA,
      scoreB: pointsB,
      type: 'point'
    };
    hapticFeedback.medium();
    
    if (team === 'A') {
      const nextP = pointsA + 1;
      newLog.scoreA = nextP;
      setLogs([...logs, newLog]);
      if (nextP >= 4 && nextP - pointsB >= 2) {
        winGame('A');
      } else {
        setPointsA(nextP);
      }
    } else {
      const nextP = pointsB + 1;
      newLog.scoreB = nextP;
      setLogs([...logs, newLog]);
      if (nextP >= 4 && nextP - pointsA >= 2) {
        winGame('B');
      } else {
        setPointsB(nextP);
      }
    }
  };

  const winGame = (team: 'A' | 'B') => {
    setPointsA(0);
    setPointsB(0);
    setServer(prev => prev === 'A' ? 'B' : 'A');
    hapticFeedback.success();

    const gameLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      team,
      scoreA: gamesA + (team === 'A' ? 1 : 0),
      scoreB: gamesB + (team === 'B' ? 1 : 0),
      type: 'point',
      message: `Game won by Player ${team}`
    };
    setLogs([...logs, gameLog]);

    if (team === 'A') {
      const nextG = gamesA + 1;
      setGamesA(nextG);
      if (nextG >= 6 && nextG - gamesB >= 2) {
        winSet('A');
      }
    } else {
      const nextG = gamesB + 1;
      setGamesB(nextG);
      if (nextG >= 6 && nextG - gamesA >= 2) {
        winSet('B');
      }
    }
  };

  const winSet = (team: 'A' | 'B') => {
    setGamesA(0);
    setGamesB(0);
    hapticFeedback.success();
    
    const setLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      team,
      scoreA: setsA + (team === 'A' ? 1 : 0),
      scoreB: setsB + (team === 'B' ? 1 : 0),
      type: 'set',
      message: `Set won by Player ${team}`
    };
    setLogs([...logs, setLog]);

    if (team === 'A') {
      const nextS = setsA + 1;
      setSetsA(nextS);
      if (nextS === 2) {
        setWinner('A');
        confetti();
      }
    } else {
      const nextS = setsB + 1;
      setSetsB(nextS);
      if (nextS === 2) {
        setWinner('B');
        confetti();
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

  const reset = () => {
    if (confirm('Reset match?')) {
      hapticFeedback.heavy();
      setPointsA(0);
      setPointsB(0);
      setGamesA(0);
      setGamesB(0);
      setSetsA(0);
      setSetsB(0);
      setServer('A');
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
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [isVoiceActive, pointsA, pointsB, gamesA, gamesB]);

  const labelA = getPointLabel(pointsA, pointsB);
  const labelB = getPointLabel(pointsB, pointsA);
  const isDeuce = pointsA >= 3 && pointsB >= 3 && pointsA === pointsB;

  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display flex items-center gap-2 text-brand-primary">
          <Trophy /> TENNIS
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
          <button onClick={reset} className="p-2 glass rounded-full hover:bg-red-500/20 text-red-400 transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Sets & Games Board */}
      <div className="glass rounded-3xl p-6 flex items-center justify-around">
        <div className="text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Sets</div>
          <div className="text-4xl font-display flex gap-4">
            <span className={cn(setsA > setsB ? "text-brand-primary" : "text-zinc-600")}>{setsA}</span>
            <span className="text-zinc-800">-</span>
            <span className={cn(setsB > setsA ? "text-brand-primary" : "text-zinc-600")}>{setsB}</span>
          </div>
        </div>
        <div className="h-12 w-px bg-zinc-800" />
        <div className="text-center">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Games</div>
          <div className="text-4xl font-display flex gap-4">
            <span className={cn(gamesA > gamesB ? "text-white" : "text-zinc-600")}>{gamesA}</span>
            <span className="text-zinc-800">-</span>
            <span className={cn(gamesB > gamesA ? "text-white" : "text-zinc-600")}>{gamesB}</span>
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
            <option value="">PLAYER A</option>
            {players.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <motion.div 
            className={cn("relative flex flex-col items-center justify-center rounded-3xl glass p-8", server === 'A' && "ring-2 ring-brand-primary shadow-[0_0_20px_rgba(57,255,20,0.2)]")}
            onClick={() => addPoint('A')}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              <motion.span 
                key={labelA}
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-9xl font-display text-brand-primary"
              >
                {labelA}
              </motion.span>
            </AnimatePresence>
            {server === 'A' && <div className="mt-4 text-[10px] font-bold text-brand-primary tracking-widest uppercase">SERVING</div>}
          </motion.div>
        </div>

        <div className="flex flex-col gap-2">
          <select 
            value={selectedPlayerB}
            onChange={(e) => setSelectedPlayerB(e.target.value)}
            className="bg-transparent border-none text-center font-display text-lg text-zinc-500 focus:text-brand-secondary outline-none"
          >
            <option value="">PLAYER B</option>
            {players.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <motion.div 
            className={cn("relative flex flex-col items-center justify-center rounded-3xl glass p-8", server === 'B' && "ring-2 ring-brand-secondary shadow-[0_0_20px_rgba(255,77,0,0.2)]")}
            onClick={() => addPoint('B')}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              <motion.span 
                key={labelB}
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-9xl font-display text-brand-secondary"
              >
                {labelB}
              </motion.span>
            </AnimatePresence>
            {server === 'B' && <div className="mt-4 text-[10px] font-bold text-brand-secondary tracking-widest uppercase">SERVING</div>}
          </motion.div>
        </div>
      </div>

      {/* Timeline Integration */}
      <MatchTimeline logs={logs} teamAName={selectedPlayerA || 'Player A'} teamBName={selectedPlayerB || 'Player B'} />

      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <Info size={14} />
          <span>{isDeuce ? "DEUCE" : "Standard Scoring"}</span>
        </div>
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Best of 3 Sets</div>
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
                {winner === 'A' ? (selectedPlayerA || 'PLAYER A') : (selectedPlayerB || 'PLAYER B')} WINS
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
