import React, { createContext, useContext } from 'react';
import { useStudyData } from '@/hooks/useStudyData';

type StudyContextType = ReturnType<typeof useStudyData>;

const StudyContext = createContext<StudyContextType | null>(null);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const studyData = useStudyData();

  return (
    <StudyContext.Provider value={studyData}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
