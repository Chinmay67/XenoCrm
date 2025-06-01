import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user info on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      credentials: "include", // Important: send cookies
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((userData) => setUser(userData))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Trigger Google OAuth login by redirecting to backend
  const login = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  // Logout clears cookie server-side and resets user
  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth context
export const useAuth = () => useContext(AuthContext);
