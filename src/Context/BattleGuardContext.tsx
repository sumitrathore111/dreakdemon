import React, { createContext, useContext, useState } from 'react';

interface BattleGuardContextType {
  isBattleActive: boolean;
  setBattleActive: (active: boolean) => void;
}

const BattleGuardContext = createContext<BattleGuardContextType | undefined>(undefined);

export const BattleGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBattleActive, setIsBattleActive] = useState(false);
  return (
    <BattleGuardContext.Provider value={{ isBattleActive, setBattleActive: setIsBattleActive }}>
      {children}
    </BattleGuardContext.Provider>
  );
};

export const useBattleGuard = () => {
  const ctx = useContext(BattleGuardContext);
  if (!ctx) throw new Error('useBattleGuard must be used within BattleGuardProvider');
  return ctx;
};
