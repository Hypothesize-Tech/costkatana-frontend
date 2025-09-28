import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../services/auth.service";
import { User, LoginCredentials, RegisterData } from "../types";
import { setUserContext, addBreadcrumb } from "../config/sentry";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  mfaRequired: boolean;
  mfaData: {
    mfaToken?: string;
    userId?: string;
    availableMethods?: Array<'email' | 'totp'>;
  } | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  completeMFALogin: (result: any) => void;
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
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaData, setMfaData] = useState<{
    mfaToken?: string;
    userId?: string;
    availableMethods?: Array<'email' | 'totp'>;
  } | null>(null);
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

  // Track user authentication state changes for Sentry
  useEffect(() => {
    if (user) {
      // Set user context in Sentry when user is authenticated
      setUserContext({
        id: user.id,
        email: user.email,
        username: user.name || user.email,
        role: user.role || 'user',
        organization: user.company || undefined,
      });

      addBreadcrumb(
        `User authenticated: ${user.email}`,
        'auth.login',
        'info',
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          organization: user.company,
        }
      );
    } else {
      // Clear user context when user logs out
      setUserContext({});

      addBreadcrumb(
        'User logged out',
        'auth.logout',
        'info'
      );
    }
  }, [user]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        const response = await authService.login(credentials);
        if (!response || !response.data) {
          throw new Error("Invalid login response");
        }

        // Check if MFA is required
        if (response.data.requiresMFA) {
          setMfaRequired(true);
          setMfaData({
            mfaToken: response.data.mfaToken,
            userId: response.data.userId,
            availableMethods: response.data.availableMethods,
          });
          // Store user email for MFA setup
          localStorage.setItem('userEmail', credentials.email);
          return; // Don't navigate, stay on login page to show MFA
        }

        // Regular login without MFA
        if (!response.data.user || !response.data.accessToken) {
          throw new Error("Invalid login response");
        }

        // Store tokens using AuthService
        authService.setTokens(response.data.accessToken, response.data.refreshToken);
        authService.setUser(response.data.user);

        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
        sessionStorage.setItem("showTokenOnLoad", "true");
        toast.success("Welcome back!");
        navigate("/dashboard");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Login failed");
        setUser(null);
        setAccessToken(null);
        setMfaRequired(false);
        setMfaData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate],
  );

  const completeMFALogin = useCallback(
    (result: any) => {
      try {
        // Store tokens using AuthService
        authService.setTokens(result.accessToken, result.refreshToken);
        authService.setUser(result.user);

        // Update React state
        setUser(result.user);
        setAccessToken(result.accessToken);
        setMfaRequired(false);
        setMfaData(null);

        // Clean up temporary storage
        localStorage.removeItem('userEmail');

        sessionStorage.setItem("showTokenOnLoad", "true");
        toast.success("Welcome back!");
        navigate("/dashboard");
      } catch (error: any) {
        toast.error("Failed to complete login");
        setUser(null);
        setAccessToken(null);
        setMfaRequired(false);
        setMfaData(null);
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
    mfaRequired,
    mfaData,
    login,
    completeMFALogin,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
