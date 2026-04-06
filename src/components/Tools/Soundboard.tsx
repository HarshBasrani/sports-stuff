import React from 'react';
import { Volume2, Bell, AlertCircle, Megaphone, Music } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const SOUNDS = [
  { name: 'Whistle', icon: Volume2, color: 'text-blue-400', freq: 880, type: 'sine' as OscillatorType },
  { name: 'Buzzer', icon: Bell, color: 'text-red-400', freq: 150, type: 'sawtooth' as OscillatorType },
  { name: 'Fault', icon: AlertCircle, color: 'text-yellow-400', freq: 440, type: 'triangle' as OscillatorType },
  { name: 'Out!', icon: Megaphone, color: 'text-orange-400', freq: 300, type: 'square' as OscillatorType },
];

export default function Soundboard() {
  const playSound = (freq: number, type: OscillatorType) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Music className="text-pink-500" /> Referee Soundboard
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {SOUNDS.map((sound) => (
          <button 
            key={sound.name}
            onClick={() => playSound(sound.freq, sound.type)}
            className="group relative flex flex-col items-center justify-center glass rounded-3xl p-8 hover:bg-white/10 transition-all active:scale-95"
          >
            <sound.icon size={48} className={cn("mb-4 transition-transform group-hover:scale-110", sound.color)} />
            <span className="text-xl font-bold">{sound.name}</span>
            <div className="absolute bottom-4 right-4 text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
              {sound.type}
            </div>
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 text-center text-zinc-500 text-sm italic">
        "Fair play is the best play."
      </div>
    </div>
  );
}
