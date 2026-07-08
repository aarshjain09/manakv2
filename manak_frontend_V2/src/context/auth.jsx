import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ LOAD USER FROM LOCAL STORAGE ON REFRESH
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      API.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const login = async (data) => {
    const res = await API.post("/auth/login", data);

    setUser(res.data.user);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);

    API.defaults.headers.common["Authorization"] =
      `Bearer ${res.data.token}`;

    return res.data.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    delete API.defaults.headers.common["Authorization"];
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
