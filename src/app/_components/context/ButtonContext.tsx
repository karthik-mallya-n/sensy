'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ButtonContextType {
  active: boolean;
  setActive: (active: boolean) => void;
}

const ButtonContext = createContext<ButtonContextType>({
  active: false,
  setActive: () => {},
});

export function ButtonProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);

  return (
    <ButtonContext.Provider value={{ active, setActive }}>
      {children}
    </ButtonContext.Provider>
  );
}

export function useButtonContext() {
  return useContext(ButtonContext);
}