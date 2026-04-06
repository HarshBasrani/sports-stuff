import { useLocalStorage } from './useLocalStorage';

export interface Player {
  id: string;
  name: string;
  wins: number;
  losses: number;
}

export function usePlayers() {
  const [players, setPlayers] = useLocalStorage<Player[]>('sports_players', []);

  const addWin = (playerName: string) => {
    setPlayers(prev => prev.map(p => 
      p.name === playerName ? { ...p, wins: p.wins + 1 } : p
    ));
  };

  const addLoss = (playerName: string) => {
    setPlayers(prev => prev.map(p => 
      p.name === playerName ? { ...p, losses: p.losses + 1 } : p
    ));
  };

  return { players, setPlayers, addWin, addLoss };
}
