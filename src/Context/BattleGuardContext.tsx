import React, { createContext, useContext, useState, useCallback } from 'react';

interface BattleGuardContextType {
  isBattleActive: boolean;
  activeBattleId: string | null;
  setBattleActive: (active: boolean, battleId?: string | null) => void;
  forfeitBattle: () => Promise<void>;
}

const BattleGuardContext = createContext<BattleGuardContextType | undefined>(undefined);

export const BattleGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);

  const setBattleActive = useCallback((active: boolean, battleId: string | null = null) => {
    setIsBattleActive(active);
    setActiveBattleId(active ? battleId : null);
  }, []);

  const forfeitBattle = useCallback(async () => {
    if (!activeBattleId) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/battles/${activeBattleId}/forfeit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error forfeiting battle:', error);
    } finally {
      setIsBattleActive(false);
      setActiveBattleId(null);
    }
  }, [activeBattleId]);

  return (
    <BattleGuardContext.Provider value={{ 
      isBattleActive, 
      activeBattleId,
      setBattleActive, 
      forfeitBattle 
    }}>
      {children}
    </BattleGuardContext.Provider>
  );
};

export const useBattleGuard = () => {
  const ctx = useContext(BattleGuardContext);
  if (!ctx) throw new Error('useBattleGuard must be used within BattleGuardProvider');
  return ctx;
};
