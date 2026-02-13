import { useCallback } from 'react';
import { GoogleSignin, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { authClient } from '@/lib/auth-client';
import { uiLogger } from '@/lib/loggers';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

interface GoogleSignInResult {
  success: boolean;
  error?: string;
}

export function useGoogleSignIn() {
  const signInWithGoogle = useCallback(async (): Promise<GoogleSignInResult> => {
    try {
      uiLogger.debug('Google Sign-In: Checking play services...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      uiLogger.debug('Google Sign-In: Opening Google sign-in flow...');
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        uiLogger.warn('Google Sign-In: User cancelled or invalid response');
        return { success: false, error: 'Google Sign-In was cancelled' };
      }

      const idToken = response.data?.idToken;
      if (!idToken) {
        uiLogger.error('Google Sign-In: No ID token in response');
        return { success: false, error: 'Failed to get ID token from Google' };
      }

      uiLogger.debug('Google Sign-In: Exchanging token with backend...');
      const result = await authClient.signIn.social({
        provider: 'google',
        idToken: { token: idToken },
      });

      if (result.error) {
        uiLogger.error('Better Auth sign-in failed:', result.error.message);
        return { success: false, error: result.error.message };
      }

      uiLogger.info('Google Sign-In: Success');
      return { success: true };
    } catch (error: unknown) {
      const errorObj = error as { code?: string; message?: string; toString?: () => string } | null;
      const errorCode = errorObj?.code;
      const errorMessage = errorObj?.message ?? errorObj?.toString?.() ?? String(error);
      const isEmptyObject = Object.keys(errorObj ?? {}).length === 0;

      if (isEmptyObject) {
        uiLogger.error(
          'Google Sign-In failed: Unknown error (likely cancelled by user or simulator). ' +
          `Error: "${errorMessage}". This usually means: 1) User cancelled, 2) Running on simulator (not supported), 3) No Google app installed.`
        );
      } else if (errorCode) {
        uiLogger.error(`Google Sign-In failed with code "${errorCode}": ${errorMessage}`);
      } else {
        uiLogger.error(`Google Sign-In failed: ${errorMessage}`);
      }

      if (errorCode === statusCodes.SIGN_IN_CANCELLED || isEmptyObject) {
        return { success: false, error: 'Sign in was cancelled' };
      }
      if (errorCode === statusCodes.IN_PROGRESS) {
        return { success: false, error: 'Sign in already in progress' };
      }
      if (errorCode === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { success: false, error: 'Google Play Services not available' };
      }

      return { success: false, error: 'Failed to sign in with Google' };
    }
  }, []);

  return { signInWithGoogle };
}
