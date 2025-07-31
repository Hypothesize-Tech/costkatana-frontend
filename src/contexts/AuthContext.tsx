import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";
import { User, LoginCredentials, RegisterData } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getUser();
        const token = authService.getToken();
        if (currentUser && token) {
          setUser(currentUser);
          setAccessToken(token);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        const response = await authService.login(credentials);
        if (
          !response ||
          !response.data ||
          !response.data.user ||
          !response.data.accessToken
        ) {
          throw new Error("Invalid login response");
        }
        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
        sessionStorage.setItem("showTokenOnLoad", "true");
        toast.success("Welcome back!");
        navigate("/dashboard");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Login failed");
        setUser(null);
        setAccessToken(null);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true);
        const response = await authService.register(data);
        if (!response || !response.data) {
          throw new Error("Invalid registration response");
        }
        setUser(response.data);
        toast.success("Registration successful! Please verify your email.");
        navigate("/dashboard");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Registration failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setAccessToken(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      setUser(null);
      setAccessToken(null);
      navigate("/login");
    }
  }, [navigate]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    accessToken,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
