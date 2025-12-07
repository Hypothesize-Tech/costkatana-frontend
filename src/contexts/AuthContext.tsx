import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";
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
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  completeMFALogin: (result: { user: User; accessToken: string; refreshToken: string }) => void;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshAuth: () => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<void>;
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
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaData, setMfaData] = useState<{
    mfaToken?: string;
    userId?: string;
    availableMethods?: Array<'email' | 'totp'>;
  } | null>(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Token validation function
  const validateAndRefreshToken = useCallback(async (): Promise<boolean> => {
    const token = authService.getToken();
    const refreshToken = authService.getRefreshToken();

    if (!token) {
      return false;
    }

    // Check if token is expired by trying to decode it
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // If token is expired, try to refresh
      if (payload.exp && payload.exp < currentTime) {
        if (!refreshToken) {
          // No refresh token, user needs to login again
          authService.logout();
          return false;
        }

        if (isRefreshingToken) {
          // Already refreshing, wait a bit and return false to prevent loops
          return false;
        }

        try {
          setIsRefreshingToken(true);
          const newToken = await authService.refreshToken();
          setAccessToken(newToken);
          return true;
        } catch (error) {
          // Refresh failed, clear auth and redirect to login
          console.error('Token refresh failed:', error);
          authService.logout();
          setUser(null);
          setAccessToken(null);
          return false;
        } finally {
          setIsRefreshingToken(false);
        }
      }

      return true;
    } catch (error) {
      // Token is malformed, clear auth
      authService.logout();
      return false;
    }
  }, [isRefreshingToken]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsValidatingToken(true);
        const currentUser = authService.getUser();
        const token = authService.getToken();

        if (currentUser && token) {
          const isValid = await validateAndRefreshToken();
          if (isValid) {
            setUser(currentUser);
            setAccessToken(authService.getToken());
          } else {
            setUser(null);
            setAccessToken(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
        setIsValidatingToken(false);
      }
    };

    initAuth();
  }, [validateAndRefreshToken]);

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

        // Store last login method
        if (response.data.user.lastLoginMethod) {
          localStorage.setItem('lastLoginMethod', response.data.user.lastLoginMethod);
        }

        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
        sessionStorage.setItem("showTokenOnLoad", "true");
        showNotification("Welcome back!", "success");
        navigate("/dashboard");
      } catch (error: unknown) {
        const errorMessage = error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Login failed"
          : "Login failed";
        showNotification(errorMessage, "error");
        setUser(null);
        setAccessToken(null);
        setMfaRequired(false);
        setMfaData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, showNotification],
  );

  const completeMFALogin = useCallback(
    (result: { user: User; accessToken: string; refreshToken: string }) => {
      try {
        // Store tokens using AuthService
        authService.setTokens(result.accessToken, result.refreshToken);
        authService.setUser(result.user);

        // Store last login method
        if (result.user.lastLoginMethod) {
          localStorage.setItem('lastLoginMethod', result.user.lastLoginMethod);
        }

        // Update React state
        setUser(result.user);
        setAccessToken(result.accessToken);
        setMfaRequired(false);
        setMfaData(null);

        // Clean up temporary storage
        localStorage.removeItem('userEmail');

        sessionStorage.setItem("showTokenOnLoad", "true");
        showNotification("Welcome back!", "success");
        navigate("/dashboard");
      } catch (error: unknown) {
        showNotification("Failed to complete login", "error");
        setUser(null);
        setAccessToken(null);
        setMfaRequired(false);
        setMfaData(null);
      }
    },
    [navigate, showNotification],
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
        showNotification("Registration successful! Please verify your email.", "success");
        navigate("/dashboard");
      } catch (error: unknown) {
        const errorMessage = error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Registration failed"
          : "Registration failed";
        showNotification(errorMessage, "error");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, showNotification],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setAccessToken(null);
      showNotification("Logged out successfully", "success");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      setUser(null);
      setAccessToken(null);
      navigate("/login");
    }
  }, [navigate, showNotification]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Update Sentry context when user is updated
    setUserContext({
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.name || updatedUser.email,
      role: updatedUser.role || 'user',
      organization: updatedUser.company || undefined,
    });
  }, []);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    if (isValidatingToken || isRefreshingToken) {
      return false; // Already validating or refreshing
    }

    try {
      setIsValidatingToken(true);
      const isValid = await validateAndRefreshToken();
      if (isValid) {
        const currentUser = authService.getUser();
        const token = authService.getToken();
        setUser(currentUser);
        setAccessToken(token);
      } else {
        setUser(null);
        setAccessToken(null);
      }
      return isValid;
    } catch (error) {
      console.error("Token refresh error:", error);
      setUser(null);
      setAccessToken(null);
      return false;
    } finally {
      setIsValidatingToken(false);
    }
  }, [isValidatingToken, isRefreshingToken, validateAndRefreshToken]);

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      try {
        setIsLoading(true);
        await authService.resetPassword(token, password);
        showNotification("Password reset successful!", "success");
      } catch (error: unknown) {
        const errorMessage = error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Password reset failed"
          : "Password reset failed";
        showNotification(errorMessage, "error");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [showNotification]
  );

  const loginWithOAuth = useCallback(
    async (provider: 'google' | 'github') => {
      try {
        setIsLoading(true);
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/auth/oauth/${provider}`);

        if (!response.ok) {
          throw new Error(`Failed to initiate ${provider} login`);
        }

        const data = await response.json();

        if (data.success && data.data?.authUrl) {
          // Redirect to OAuth provider
          window.location.href = data.data.authUrl;
        } else {
          throw new Error(`Invalid response from ${provider} OAuth`);
        }
      } catch (error: any) {
        showNotification(error.message || `Failed to login with ${provider}`, "error");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [showNotification]
  );

  const value = {
    user,
    isAuthenticated: !!user && !!accessToken && !isValidatingToken && !isRefreshingToken,
    isLoading: isLoading || isValidatingToken || isRefreshingToken,
    accessToken,
    mfaRequired,
    mfaData,
    login,
    loginWithOAuth,
    completeMFALogin,
    register,
    logout,
    updateUser,
    refreshAuth,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
