import { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  userRole: UserRole | null;
  userName: string | null;
  setAuth: (token: string, role: UserRole, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [userRole, setUserRole] = useState<UserRole | null>(
    (localStorage.getItem("user_role") as UserRole) || null
  );
  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem("user_name") || null
  );

  const setAuth = (newToken: string, role: UserRole, name?: string) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("user_role", role);
    if (name) localStorage.setItem("user_name", name);
    setToken(newToken);
    setUserRole(role);
    if (name) setUserName(name);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    setToken(null);
    setUserRole(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ token, userRole, userName, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
