import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'card' | 'list';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};

export const ViewModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const value = {
    viewMode,
    setViewMode,
  };

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
};