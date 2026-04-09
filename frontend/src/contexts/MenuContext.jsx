import { createContext, useContext, useState } from "react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <MenuContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
};
