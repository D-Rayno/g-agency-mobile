// hooks/use-require-auth.ts - Fixed version with proper auth route handling
import { useAuth } from '@/stores/auth';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseRequireAuthOptions {
  redirectTo?: string;
  requireCompleteSetup?: boolean;
  checkInterval?: number;
  allowAuthenticatedAccess?: boolean; // NEW: Allow authenticated users to access this route
}

export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const {
    redirectTo = '/(auth)/login',
    requireCompleteSetup = true,
    checkInterval = 300000, // 5 minutes
    allowAuthenticatedAccess = false, // NEW: Default to false for protected routes
  } = options;

  const {
    isAuthenticated,
    isInitialized,
    checkAuthStatus,
    logout,
    user,
    isEmailSetupRequired,
    isEmailVerificationRequired,
    isPasswordSetupRequired,
  } = useAuth();

  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const lastCheckRef = useRef<number>(0);
  const validationTimeoutRef = useRef<number | null>(null);
  const isValidatingRef = useRef(false);
  const hasRedirectedRef = useRef(false); // Prevent multiple redirects

  // Function to perform auth validation
  const validateAuth = async (force = false) => {
    // Prevent concurrent validations
    if (isValidatingRef.current) {
      console.log('Validation already in progress, skipping');
      return isValid;
    }

    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckRef.current;

    if (!force && timeSinceLastCheck < checkInterval) {
      console.log(`Skipping validation, only ${timeSinceLastCheck}ms since last check`);
      return isValid;
    }

    try {
      isValidatingRef.current = true;
      setIsValidating(true);
      lastCheckRef.current = now;

      console.log('Starting auth validation...');
      const authStatus = await checkAuthStatus();

      if (!authStatus) {
        console.log('Auth validation failed - user not authenticated on server');
        setIsValid(false);
        await logout();
        return false;
      }

      console.log('Auth validation successful');
      setIsValid(true);
      return true;
    } catch (error) {
      console.error('Auth validation error:', error);
      setIsValid(false);
      
      // Only logout on specific auth errors, not network errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 401 || status === 403) {
          await logout();
        }
      }
      
      return false;
    } finally {
      isValidatingRef.current = false;
      setIsValidating(false);
    }
  };

  // Handle navigation based on auth and setup status
  const handleNavigation = () => {
    if (hasRedirectedRef.current) {
      return; // Prevent multiple redirects
    }

    if (!isInitialized) {
      console.log('Auth not initialized yet, waiting...');
      return;
    }

    // NEW: For auth routes that allow authenticated access (like forgot-password), 
    // allow both authenticated and non-authenticated users
    if (allowAuthenticatedAccess) {
      console.log('Auth route allows both authenticated and non-authenticated access');
      setIsValid(true);
      return;
    }

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to:', redirectTo);
      hasRedirectedRef.current = true;
      setIsValid(false);
      
      setTimeout(() => {
        router.replace(redirectTo as any);
        hasRedirectedRef.current = false; // Reset after navigation
      }, 100);
      return;
    }

    if (requireCompleteSetup) {
      if (isEmailSetupRequired) {
        console.log('Redirecting to email setup');
        hasRedirectedRef.current = true;
        setIsValid(false);
        
        setTimeout(() => {
          router.replace('/(auth)/set-email');
          hasRedirectedRef.current = false;
        }, 100);
        return;
      }

      if (isEmailVerificationRequired) {
        console.log('Redirecting to email verification');
        hasRedirectedRef.current = true;
        setIsValid(false);
        
        setTimeout(() => {
          router.replace('/(auth)/verify-email');
          hasRedirectedRef.current = false;
        }, 100);
        return;
      }

      if (isPasswordSetupRequired) {
        console.log('Redirecting to password setup');
        hasRedirectedRef.current = true;
        setIsValid(false);
        
        setTimeout(() => {
          router.replace('/(auth)/set-password');
          hasRedirectedRef.current = false;
        }, 100);
        return;
      }
    }

    // If we reach here, user is properly authenticated and setup is complete
    if (!isValid && isAuthenticated) {
      console.log('User is authenticated and setup is complete');
      setIsValid(true);
    }
  };

  // Main effect for handling navigation
  useEffect(() => {
    handleNavigation();
  }, [
    isAuthenticated, 
    isInitialized, 
    isEmailSetupRequired,
    isEmailVerificationRequired,
    isPasswordSetupRequired,
    requireCompleteSetup,
    redirectTo,
    allowAuthenticatedAccess
  ]);

  // Initial validation and periodic scheduling (only for authenticated routes)
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || allowAuthenticatedAccess) {
      return;
    }

    // Only start validation if user is properly authenticated and setup
    if (!isEmailSetupRequired && !isEmailVerificationRequired && !isPasswordSetupRequired) {
      console.log('Starting initial auth validation for complete user');
      
      // Perform initial validation
      validateAuth(true).then((valid) => {
        if (valid) {
          console.log('Initial validation successful, scheduling periodic checks');
          
          // Clear any existing interval
          if (validationTimeoutRef.current) {
            clearInterval(validationTimeoutRef.current);
          }
          
          // Schedule periodic validation with longer interval
          const interval = setInterval(() => {
            if (isAuthenticated && !isValidatingRef.current) {
              console.log('Running periodic auth validation');
              validateAuth();
            }
          }, checkInterval);

          validationTimeoutRef.current = interval as unknown as number;
        }
      });
    }

    // Cleanup
    return () => {
      if (validationTimeoutRef.current) {
        console.log('Cleaning up validation interval');
        clearInterval(validationTimeoutRef.current);
      }
    };
  }, [
    isAuthenticated, 
    isInitialized, 
    isEmailSetupRequired,
    isEmailVerificationRequired,
    isPasswordSetupRequired,
    user?.id,
    allowAuthenticatedAccess
  ]);

  // Handle app focus for validation - but with throttling (only for authenticated routes)
  useEffect(() => {
    if (allowAuthenticatedAccess) return;

    let lastFocusValidation = 0;
    const FOCUS_VALIDATION_THROTTLE = 60000; // 1 minute

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated && isValid) {
        const now = Date.now();
        if (now - lastFocusValidation > FOCUS_VALIDATION_THROTTLE) {
          console.log('App became active, validating auth');
          lastFocusValidation = now;
          validateAuth(true);
        } else {
          console.log('App focus validation throttled');
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription.remove();
  }, [isAuthenticated, isValid, allowAuthenticatedAccess]);

  const isLoading = !isInitialized || isValidating || hasRedirectedRef.current;
  const isAuthorized = allowAuthenticatedAccess ? true : (isAuthenticated && isValid && isInitialized);

  return {
    isLoading,
    isAuthorized,
  };
};

// Hook for protected routes (requires complete setup)
export const useProtectedRoute = (options: Omit<UseRequireAuthOptions, 'requireCompleteSetup' | 'allowAuthenticatedAccess'> = {}) => {
  return useRequireAuth({
    ...options,
    requireCompleteSetup: true,
    allowAuthenticatedAccess: false,
  });
};

// Hook for auth routes (allows incomplete setup AND allows authenticated users)
export const useAuthRoute = (options: Omit<UseRequireAuthOptions, 'requireCompleteSetup' | 'allowAuthenticatedAccess'> = {}) => {
  return useRequireAuth({
    ...options,
    requireCompleteSetup: false,
    allowAuthenticatedAccess: true, // NEW: Allow authenticated users on auth routes
  });
};