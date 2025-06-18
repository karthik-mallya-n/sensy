import React, { createContext, useContext, useState, type ReactNode } from 'react';

type OptionsContextType = {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
};

const OptionsContext = createContext<OptionsContextType | undefined>(undefined);

export const OptionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedOption, setSelectedOption] = useState("Gemini");

  return (
    <OptionsContext.Provider value={{ selectedOption, setSelectedOption }}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOption = () => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error("useOption must be used within a OptionProvider");
  }
  return context;
};
