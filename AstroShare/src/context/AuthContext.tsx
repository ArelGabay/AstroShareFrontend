import { createContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  user: string | null;
  login: (name: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null); // Don't initialize from localStorage

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setUser(storedName);
    }
  }, []); // Use useEffect to set initial value from localStorage

  const login = (name: string) => {
    localStorage.setItem("name", name);
    setUser(name);
  };

  const logout = () => {
    localStorage.removeItem("name");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}