import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "../types";

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (email: string, password: string) => string | null;
  register: (name: string, email: string, phone: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

const USERS_KEY = "mtbs_users";
const SESSION_KEY = "mtbs_session";

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      login: (email, password) => {
        const users = readUsers();
        const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found) return "No account found with this email. Please register.";
        if (found.password !== password) return "Incorrect password. Please try again.";
        const { password: _pw, ...safe } = found;
        void _pw;
        setUser(safe);
        return null;
      },
      register: (name, email, phone, password) => {
        const users = readUsers();
        if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
          return "An account with this email already exists.";
        }
        const nu: StoredUser = { name: name.trim(), email: email.trim(), phone: phone.trim(), password, createdAt: new Date().toISOString() };
        users.push(nu);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        const { password: _p, ...safe } = nu;
        void _p;
        setUser(safe);
        return null;
      },
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
