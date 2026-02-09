"use client";

/**
 * Authentication Context
 * Manages global authentication state for OTP-based authentication
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/services/auth.service";
import type { User } from "@/lib/api/types";
import { APP_MENU } from "@/constants/app-menu";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the first navigable route from the app menu
 */
function getFirstMenuRoute(): string {
  const firstModule = APP_MENU[0];
  const firstObject = firstModule?.objects?.[0];
  const firstSubObject = firstObject?.sub_objects?.[0];
  return firstSubObject?.path ?? "/";
}

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  otpSent: boolean;
  phoneNumber: string;
  developmentOTP: string | null;
  requestOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetOtpFlow: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [developmentOTP, setDevelopmentOTP] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const storedToken = authService.getStoredToken();

        if (storedUser && storedToken) {
          setUser(storedUser);

          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            console.error("Token validation failed:", error);
            await authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Request OTP for phone number
  const requestOTP = useCallback(async (phone: string) => {
    setIsLoading(true);
    try {
      const response = await authService.requestOTP({ phone });
      setPhoneNumber(phone);
      setOtpSent(true);

      // Store development OTP for display
      if (response.otp) {
        setDevelopmentOTP(response.otp);
        console.log("🔐 Development OTP:", response.otp);
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  }, []);

  // Verify OTP and authenticate
  const verifyOTP = useCallback(
    async (otp: string) => {
      setIsLoading(true);
      try {
        const { user, token } = await authService.verifyOTP({
          phone: phoneNumber,
          otp,
        });
        setUser(user);
        setOtpSent(false);
        setDevelopmentOTP(null);
        router.push(getFirstMenuRoute());
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
      setIsLoading(false);
    },
    [phoneNumber, router],
  );

  // Reset OTP flow (for "Change Phone Number")
  const resetOtpFlow = useCallback(() => {
    setOtpSent(false);
    setPhoneNumber("");
    setDevelopmentOTP(null);
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setOtpSent(false);
      setPhoneNumber("");
      setDevelopmentOTP(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      await logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    otpSent,
    phoneNumber,
    developmentOTP,
    requestOTP,
    verifyOTP,
    logout,
    refreshUser,
    resetOtpFlow,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
