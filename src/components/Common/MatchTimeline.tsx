import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface LogEntry {
  id: string;
  timestamp: number;
  team: 'A' | 'B';
  scoreA: number;
  scoreB: number;
  type: 'point' | 'set' | 'match';
  message?: string;
}

interface MatchTimelineProps {
  logs: LogEntry[];
  teamAName?: string;
  teamBName?: string;
}

export default function MatchTimeline({ logs, teamAName = 'Team A', teamBName = 'Team B' }: MatchTimelineProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 px-4 glass rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-widest">
          <Clock size={16} />
          Match Timeline ({logs.length} events)
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {sortedLogs.length === 0 ? (
                <p className="text-center text-zinc-600 text-sm py-4 italic">No events recorded yet.</p>
              ) : (
                sortedLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 p-3 glass rounded-lg border-l-2 border-brand-primary/30">
                    <div className="text-[10px] font-mono text-zinc-600">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div className="text-sm font-bold">
                        <span className={cn(log.team === 'A' ? "text-brand-primary" : "text-brand-secondary")}>
                          {log.team === 'A' ? teamAName : teamBName}
                        </span>
                        <span className="text-zinc-500 ml-2">scored</span>
                      </div>
                      <div className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded">
                        {log.scoreA} - {log.scoreB}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
