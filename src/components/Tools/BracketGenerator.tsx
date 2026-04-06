import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitGraph, Trophy, Shuffle, RotateCcw, ChevronRight, Info, Award, Medal } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { hapticFeedback } from '@/src/lib/haptics';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { usePlayers } from '@/src/hooks/usePlayers';

interface Match {
  id: string;
  player1: string;
  player2: string;
  score1?: string;
  score2?: string;
  winner?: string;
}

export default function BracketGenerator() {
  const { players: savedPlayers } = usePlayers();
  const [size, setSize] = useLocalStorage<4 | 8 | 16>('bracket_size', 8);
  const [rounds, setRounds] = useLocalStorage<Match[][]>('bracket_rounds', []);
  const [initialPlayers, setInitialPlayers] = useLocalStorage<string[]>('bracket_initial_players', Array(8).fill('').map((_, i) => `Player ${i + 1}`));

  useEffect(() => {
    if (rounds.length === 0 || rounds[0].length !== size / 2) {
      resetTournament(size);
    }
  }, [size]);

  const resetTournament = (newSize: number) => {
    const playersList = Array(newSize).fill('').map((_, i) => initialPlayers[i] || `Player ${i + 1}`);
    setInitialPlayers(playersList);
    
    const firstRound: Match[] = [];
    for (let i = 0; i < newSize; i += 2) {
      firstRound.push({
        id: `r0-m${i / 2}`,
        player1: playersList[i],
        player2: playersList[i + 1],
        score1: '',
        score2: ''
      });
    }

    const allRounds: Match[][] = [firstRound];
    let currentRoundSize = newSize / 4;
    let roundIndex = 1;

    while (currentRoundSize >= 1) {
      const roundMatches: Match[] = [];
      for (let i = 0; i < currentRoundSize; i++) {
        roundMatches.push({
          id: `r${roundIndex}-m${i}`,
          player1: '',
          player2: '',
          score1: '',
          score2: ''
        });
      }
      allRounds.push(roundMatches);
      currentRoundSize /= 2;
      roundIndex++;
    }
    setRounds(allRounds);
  };

  const updateInitialPlayer = (index: number, name: string) => {
    const newInitial = [...initialPlayers];
    newInitial[index] = name;
    setInitialPlayers(newInitial);

    const newRounds = [...rounds];
    const matchIndex = Math.floor(index / 2);
    const isPlayer1 = index % 2 === 0;
    
    if (newRounds[0] && newRounds[0][matchIndex]) {
      if (isPlayer1) newRounds[0][matchIndex].player1 = name;
      else newRounds[0][matchIndex].player2 = name;
      setRounds(newRounds);
    }
  };

  const updateScore = (roundIndex: number, matchIndex: number, playerIndex: 1 | 2, score: string) => {
    const newRounds = [...rounds];
    if (playerIndex === 1) newRounds[roundIndex][matchIndex].score1 = score;
    else newRounds[roundIndex][matchIndex].score2 = score;
    setRounds(newRounds);
  };

  const setWinner = (roundIndex: number, matchIndex: number, winnerName: string) => {
    if (!winnerName) return;
    hapticFeedback.medium();
    
    const newRounds = [...rounds];
    const match = newRounds[roundIndex][matchIndex];
    
    // Toggle winner
    if (match.winner === winnerName) {
      match.winner = undefined;
      // Clear progression in next rounds
      clearProgression(newRounds, roundIndex + 1, matchIndex);
    } else {
      match.winner = winnerName;
      advanceWinner(newRounds, roundIndex, matchIndex, winnerName);
    }
    
    setRounds(newRounds);
  };

  const advanceWinner = (newRounds: Match[][], roundIndex: number, matchIndex: number, winnerName: string) => {
    const nextRoundIndex = roundIndex + 1;
    if (nextRoundIndex < newRounds.length) {
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const isPlayer1 = matchIndex % 2 === 0;
      
      if (isPlayer1) newRounds[nextRoundIndex][nextMatchIndex].player1 = winnerName;
      else newRounds[nextRoundIndex][nextMatchIndex].player2 = winnerName;
    }
  };

  const clearProgression = (newRounds: Match[][], roundIndex: number, matchIndex: number) => {
    if (roundIndex >= newRounds.length) return;
    
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const isPlayer1 = matchIndex % 2 === 0;
    const match = newRounds[roundIndex][nextMatchIndex];
    
    const playerToClear = isPlayer1 ? match.player1 : match.player2;
    if (isPlayer1) match.player1 = '';
    else match.player2 = '';
    
    if (match.winner === playerToClear) {
      match.winner = undefined;
      clearProgression(newRounds, roundIndex + 1, nextMatchIndex);
    }
  };

  const shufflePlayers = () => {
    hapticFeedback.heavy();
    const shuffled = [...initialPlayers].sort(() => Math.random() - 0.5);
    setInitialPlayers(shuffled);
    resetTournament(size);
  };

  const getRoundName = (roundIndex: number, totalRounds: number) => {
    if (roundIndex === totalRounds - 1) return "Finals";
    if (roundIndex === totalRounds - 2) return "Semi Finals";
    if (roundIndex === totalRounds - 3) return "Quarter Finals";
    return `Round ${roundIndex + 1}`;
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6 overflow-hidden bg-zinc-950/50">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass p-6 rounded-3xl border-b-2 border-purple-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              <GitGraph size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-display tracking-wider text-white">TOURNAMENT BRACKET</h2>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Dynamic Progression Engine</p>
            </div>
          </div>

          <div className="flex glass rounded-2xl p-1.5 border border-white/5">
            {[4, 8, 16].map(s => (
              <button 
                key={s}
                onClick={() => { setSize(s as any); resetTournament(s); }}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest", 
                  size === s 
                    ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
              >
                {s} Teams
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={shufflePlayers}
            className="flex items-center gap-2 px-5 py-2.5 glass rounded-2xl text-xs font-bold text-zinc-400 hover:text-purple-400 hover:bg-purple-500/5 transition-all uppercase tracking-widest border border-white/5"
          >
            <Shuffle size={16} /> Shuffle Seeds
          </button>
          <button 
            onClick={() => { if(confirm('Reset entire tournament?')) resetTournament(size); }}
            className="flex items-center gap-2 px-5 py-2.5 glass rounded-2xl text-xs font-bold text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all uppercase tracking-widest border border-white/5"
          >
            <RotateCcw size={16} /> Reset All
          </button>
        </div>
      </div>

      {/* Bracket Stage */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <div className="flex gap-24 min-w-max p-12 items-center">
          {rounds.map((round, rIndex) => (
            <div key={rIndex} className="flex flex-col justify-around gap-12 relative py-12">
              {/* Round Header */}
              <div className="absolute top-0 left-0 right-0 text-center">
                <div className="inline-block px-4 py-1.5 glass rounded-full border border-purple-500/20">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em]">
                    {getRoundName(rIndex, rounds.length)}
                  </span>
                </div>
              </div>
              
              {round.map((match, mIndex) => (
                <div key={match.id} className="relative">
                  {/* Elbow Connectors */}
                  {rIndex < rounds.length - 1 && (
                    <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-24 h-full pointer-events-none">
                      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <path 
                          d={`M 0 ${50} L ${50} ${50} L ${50} ${mIndex % 2 === 0 ? 150 : -50} L ${100} ${mIndex % 2 === 0 ? 150 : -50}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={cn(
                            "transition-colors duration-500",
                            match.winner ? "text-purple-500/40" : "text-zinc-800"
                          )}
                        />
                      </svg>
                    </div>
                  )}
                  
                  <div className="w-64 flex flex-col gap-0.5 group">
                    {/* Player 1 Slot */}
                    <div className={cn(
                      "relative glass rounded-t-2xl p-0.5 transition-all duration-300 border-x border-t border-white/5",
                      match.winner === match.player1 ? "bg-purple-500/10 ring-1 ring-purple-500/30" : "hover:bg-white/5"
                    )}>
                      <div className="flex items-center">
                        <div className="w-8 h-10 flex items-center justify-center text-[10px] font-bold text-zinc-600 border-r border-white/5">
                          {rIndex === 0 ? mIndex * 2 + 1 : ""}
                        </div>
                        <div className="flex-1 flex items-center px-3 py-2 gap-2 overflow-hidden">
                          {rIndex === 0 ? (
                            <select 
                              value={match.player1}
                              onChange={(e) => updateInitialPlayer(mIndex * 2, e.target.value)}
                              className="bg-transparent border-none outline-none text-xs font-bold w-full text-zinc-300 cursor-pointer focus:text-purple-400"
                            >
                              <option value="">Select Player</option>
                              {savedPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              <optgroup label="Generic">
                                <option value={match.player1}>{match.player1}</option>
                              </optgroup>
                            </select>
                          ) : (
                            <span className={cn(
                              "text-xs font-bold truncate transition-colors",
                              match.winner === match.player1 ? "text-purple-400" : "text-zinc-400"
                            )}>
                              {match.player1 || "TBD"}
                            </span>
                          )}
                        </div>
                        <input 
                          type="text"
                          placeholder="-"
                          value={match.score1}
                          onChange={(e) => updateScore(rIndex, mIndex, 1, e.target.value)}
                          className="w-10 h-10 bg-black/20 border-l border-white/5 text-center text-xs font-mono font-bold text-zinc-500 focus:text-purple-400 outline-none"
                        />
                        <button 
                          onClick={() => setWinner(rIndex, mIndex, match.player1)}
                          disabled={!match.player1}
                          className={cn(
                            "w-10 h-10 flex items-center justify-center transition-all border-l border-white/5",
                            match.winner === match.player1 ? "text-purple-500 bg-purple-500/10" : "text-zinc-700 hover:text-zinc-400"
                          )}
                        >
                          <Award size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Player 2 Slot */}
                    <div className={cn(
                      "relative glass rounded-b-2xl p-0.5 transition-all duration-300 border-x border-b border-white/5",
                      match.winner === match.player2 ? "bg-purple-500/10 ring-1 ring-purple-500/30" : "hover:bg-white/5"
                    )}>
                      <div className="flex items-center">
                        <div className="w-8 h-10 flex items-center justify-center text-[10px] font-bold text-zinc-600 border-r border-white/5">
                          {rIndex === 0 ? mIndex * 2 + 2 : ""}
                        </div>
                        <div className="flex-1 flex items-center px-3 py-2 gap-2 overflow-hidden">
                          {rIndex === 0 ? (
                            <select 
                              value={match.player2}
                              onChange={(e) => updateInitialPlayer(mIndex * 2 + 1, e.target.value)}
                              className="bg-transparent border-none outline-none text-xs font-bold w-full text-zinc-300 cursor-pointer focus:text-purple-400"
                            >
                              <option value="">Select Player</option>
                              {savedPlayers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                              <optgroup label="Generic">
                                <option value={match.player2}>{match.player2}</option>
                              </optgroup>
                            </select>
                          ) : (
                            <span className={cn(
                              "text-xs font-bold truncate transition-colors",
                              match.winner === match.player2 ? "text-purple-400" : "text-zinc-400"
                            )}>
                              {match.player2 || "TBD"}
                            </span>
                          )}
                        </div>
                        <input 
                          type="text"
                          placeholder="-"
                          value={match.score2}
                          onChange={(e) => updateScore(rIndex, mIndex, 2, e.target.value)}
                          className="w-10 h-10 bg-black/20 border-l border-white/5 text-center text-xs font-mono font-bold text-zinc-500 focus:text-purple-400 outline-none"
                        />
                        <button 
                          onClick={() => setWinner(rIndex, mIndex, match.player2)}
                          disabled={!match.player2}
                          className={cn(
                            "w-10 h-10 flex items-center justify-center transition-all border-l border-white/5",
                            match.winner === match.player2 ? "text-purple-500 bg-purple-500/10" : "text-zinc-700 hover:text-zinc-400"
                          )}
                        >
                          <Award size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Champion Podium */}
          <div className="flex flex-col justify-center pl-12">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-8 text-center">Grand Champion</div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-72 h-48 glass rounded-[2.5rem] border-2 border-yellow-500/30 flex flex-col items-center justify-center gap-4 neo-shadow shadow-yellow-500/10 overflow-hidden group"
            >
              {/* Animated Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-2">
                <div className="absolute inset-0 rounded-full animate-ping bg-yellow-500/20" />
                <Trophy className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" size={40} />
              </div>
              
              <div className="text-center relative z-10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Medal size={12} className="text-yellow-500/50" />
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Winner</span>
                  <Medal size={12} className="text-yellow-500/50" />
                </div>
                <div className="text-2xl font-display text-white tracking-widest uppercase px-4 truncate max-w-full">
                  {rounds[rounds.length - 1]?.[0]?.winner || "???"}
                </div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-yellow-500/20" />
              <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-yellow-500/20" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="glass rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <div className="w-5 h-5 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Award size={12} />
            </div>
            <span>Click <span className="text-purple-400">Award Icon</span> to set winner</span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <div className="w-5 h-5 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Info size={12} />
            </div>
            <span>Enter scores in the <span className="text-zinc-300">dark boxes</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 italic uppercase tracking-[0.2em]">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          Live Sync Active
        </div>
      </div>
    </div>
  );
}
