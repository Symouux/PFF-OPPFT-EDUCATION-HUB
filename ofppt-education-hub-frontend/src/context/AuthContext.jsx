// Et-taheri khaoula 
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await axios.post("/logout");
    } catch (_) { }

    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      axios
        .get("/me")
        .then((res) => {
          setUser(res.data); // { user, profil }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, logout]);

  const login = async (email, password) => {
    const res = await axios.post("/login", {
      email,
      password: password,
    });

    const { token, user, profil } = res.data;

    localStorage.setItem("token", token);
    setToken(token);

    setUser({ user, profil });

    return { user, profil };
  };

  const register = async (
    nom_complet,
    email,
    password,
    password_confirmation,
  ) => {
    const res = await axios.post("/register", {
      nom_complet: nom_complet,
      email: email,
      password: password,
      password_confirmation: password_confirmation,
    });

    const { token, user, profil } = res.data;

    localStorage.setItem("token", token);
    setToken(token);

    setUser({ user, profil });

    return user;
  };

  const forgotPassword = async (email) => {
    await axios.post("/forgot-password", { email });
  };

  const resetPassword = async (data) => {
    await axios.post("/reset-password", data);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading, forgotPassword, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);