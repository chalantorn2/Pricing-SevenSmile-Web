import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api-service";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Show the cached user straight away so the UI does not flash the login screen,
    // then confirm with the server: only a live token counts as being logged in.
    setUser(authService.getCurrentUser());

    authService.verifySession().then((verified) => {
      if (cancelled) return;
      setUser(verified);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (username, password) => {
    const userData = await authService.login(username, password);
    setUser({
      id: userData.id,
      username: userData.username,
      role: userData.role,
      full_name: userData.full_name || "",
      nickname: userData.nickname || "",
      office: userData.office || "sevensmile",
      position: userData.position || "",
    });
    return userData;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user && user.role === "admin";
  };

  const value = {
    user,
    login,
    logout,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
