import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      // Ensure token is set before making request
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await apiClient.get('/auth/me');
      // Only update user if we got a valid response
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      // Only clear token if /auth/me returns 401/403 - this means token is truly invalid
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.error('Auth check failed - token invalid:', error);
        localStorage.removeItem("token");
        delete apiClient.defaults.headers.common["Authorization"];
        setUser(null);
      } else {
        // Network errors or other issues - don't clear token, just log
        console.error('Auth check failed (non-auth error):', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // Set token in axios defaults AND ensure interceptor will use it
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await fetchUser();
      } else {
        setLoading(false);
      }
    };
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      const token = response.data.token;
      if (!token) {
        throw new Error('No token received from server');
      }
      // Store token first
      localStorage.setItem("token", token);
      // Set token in axios defaults
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Set user state - this will trigger re-render and navigation
      setUser(response.data.user);
      // Ensure loading is false
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      // Clear any partial state
      localStorage.removeItem("token");
      delete apiClient.defaults.headers.common["Authorization"];
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  const signup = async (name, email, password, role = "user") => {
    try {
      const response = await apiClient.post('/auth/signup', {
        name,
        email,
        password,
        role,
      });
      const token = response.data.token;
      if (!token) {
        throw new Error('No token received from server');
      }
      // Store token first
      localStorage.setItem("token", token);
      // Set token in axios defaults
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Set user state - this will trigger re-render and navigation
      setUser(response.data.user);
      // Ensure loading is false
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Signup failed:', error);
      // Clear any partial state
      localStorage.removeItem("token");
      delete apiClient.defaults.headers.common["Authorization"];
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const isAdmin = !!user && user.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}