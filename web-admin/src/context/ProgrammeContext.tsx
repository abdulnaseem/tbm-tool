// web-admin/src/context/ProgrammeContext.tsx

'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  PROGRAMMES,
  Programme,
  ProgrammeId,
} from '../types/programme';

type ProgrammeContextValue = {
  programmeId: ProgrammeId;
  programme: Programme;
  setProgrammeId: (programmeId: ProgrammeId) => void;
};

const STORAGE_KEY = 'tbm-selected-programme';

const ProgrammeContext =
  createContext<ProgrammeContextValue | null>(null);

export function ProgrammeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [programmeId, setProgrammeIdState] =
    useState<ProgrammeId>('BRAWLERS_BOXING');

  useEffect(() => {
    const stored = window.localStorage.getItem(
      STORAGE_KEY,
    ) as ProgrammeId | null;

    if (
      stored === 'BRAWLERS_BOXING' ||
      stored === 'THE_GRAPPLE_HUB'
    ) {
      setProgrammeIdState(stored);
    }
  }, []);

  function setProgrammeId(value: ProgrammeId) {
    setProgrammeIdState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }

  const programme =
    PROGRAMMES.find((item) => item.id === programmeId) ||
    PROGRAMMES[0];

  const value = useMemo(
    () => ({
      programmeId,
      programme,
      setProgrammeId,
    }),
    [programmeId, programme],
  );

  return (
    <ProgrammeContext.Provider value={value}>
      {children}
    </ProgrammeContext.Provider>
  );
}

export function useProgramme() {
  const context = useContext(ProgrammeContext);

  if (!context) {
    throw new Error(
      'useProgramme must be used inside ProgrammeProvider',
    );
  }

  return context;
}