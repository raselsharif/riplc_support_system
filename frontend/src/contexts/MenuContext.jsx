import { createContext, useContext, useState, useEffect } from "react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutPreloader, setLogoutPreloader] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showLogoutPreloader') === 'true';
    }
    return false;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  const handleLogoutPreloader = (show) => {
    localStorage.setItem('showLogoutPreloader', show ? 'true' : 'false');
    setLogoutPreloader(show);
  };

  return (
    <MenuContext.Provider value={{ 
      sidebarOpen, 
      setSidebarOpen, 
      sidebarCollapsed, 
      setSidebarCollapsed,
      logoutPreloader,
      setLogoutPreloader: handleLogoutPreloader
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
};
