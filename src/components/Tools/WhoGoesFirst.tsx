import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, RotateCw, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function WhoGoesFirst() {
  const [mode, setMode] = useState<'coin' | 'racket'>('coin');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const flipCoin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const outcome = Math.random() > 0.5 ? 'Heads' : 'Tails';
    const newRotation = rotation + (extraSpins * 180) + (outcome === 'Heads' ? 0 : 180);
    
    setRotation(newRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setResult(outcome);
    }, 2000);
  };

  const spinRacket = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const outcome = Math.random() > 0.5 ? 'Up' : 'Down';
    const newRotation = rotation + (extraSpins * 360) + (outcome === 'Up' ? 0 : 180);
    
    setRotation(newRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setResult(outcome === 'Up' ? 'Team A Starts' : 'Team B Starts');
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Coins className="text-yellow-500" /> Who Goes First?
        </h2>
        <div className="flex glass rounded-xl p-1">
          <button 
            onClick={() => { setMode('coin'); setResult(null); setRotation(0); }}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-colors", mode === 'coin' ? "bg-white text-black" : "text-zinc-400")}
          >
            Coin Flip
          </button>
          <button 
            onClick={() => { setMode('racket'); setResult(null); setRotation(0); }}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-colors", mode === 'racket' ? "bg-white text-black" : "text-zinc-400")}
          >
            Spin Racket
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 perspective-1000">
          <motion.div 
            animate={{ rotateY: mode === 'coin' ? rotation : 0, rotateZ: mode === 'racket' ? rotation : 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="w-full h-full preserve-3d"
          >
            {mode === 'coin' ? (
              <>
                {/* Heads */}
                <div className="absolute inset-0 bg-yellow-500 rounded-full border-8 border-yellow-600 flex items-center justify-center backface-hidden shadow-2xl">
                  <span className="text-6xl font-black text-yellow-800">H</span>
                </div>
                {/* Tails */}
                <div className="absolute inset-0 bg-yellow-500 rounded-full border-8 border-yellow-600 flex items-center justify-center rotate-y-180 backface-hidden shadow-2xl">
                  <span className="text-6xl font-black text-yellow-800">T</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-12 h-48 bg-zinc-700 rounded-full relative border-4 border-zinc-600">
                  <div className="absolute top-0 left-0 right-0 h-32 bg-zinc-800 rounded-t-full flex items-center justify-center">
                    <div className="w-8 h-24 border-2 border-zinc-600 rounded-full opacity-50" />
                  </div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-500">UP</div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-500 rotate-180">UP</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-12 text-4xl font-bold text-center"
            >
              {result}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button 
        onClick={mode === 'coin' ? flipCoin : spinRacket}
        disabled={isSpinning}
        className="w-full py-6 bg-zinc-100 text-zinc-950 rounded-2xl font-bold text-xl hover:bg-white transition-all active:scale-95 disabled:opacity-50"
      >
        {isSpinning ? 'Spinning...' : `Spin ${mode === 'coin' ? 'Coin' : 'Racket'}`}
      </button>
    </div>
  );
}
