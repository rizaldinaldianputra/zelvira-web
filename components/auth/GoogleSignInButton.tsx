'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';
import { authService, AuthUser } from '@/services/auth.service';
import { getApiBaseUrl } from '@/services/api.client';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (user: AuthUser) => void;
  onError: (error: any) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  label?: string;
  className?: string;
}

const DEFAULT_CLIENT_ID = '76456849266-1h2btpc4a06lcaoo9d7ku2g8vh9dperu.apps.googleusercontent.com';

export function GoogleSignInButton({
  onSuccess,
  onError,
  text = 'continue_with',
  label = 'Lanjutkan dengan Google',
  className = '',
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [renderSuccess, setRenderSuccess] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      const idToken = response?.credential;
      if (!idToken) {
        onError(new Error('Google ID token tidak ditemukan dari respon Google.'));
        return;
      }

      setIsAuthenticating(true);
      try {
        const user = await authService.loginWithGoogle(idToken);
        onSuccess(user);
      } catch (err: any) {
        console.error('[GoogleSignIn] Backend exchange error:', err);
        onError(err);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [onSuccess, onError]
  );

  const initGoogleIdentity = useCallback(() => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'left',
          width: 360,
        });
        setRenderSuccess(true);
      }
    } catch (err) {
      console.warn('[GoogleSignIn] renderButton issue:', err);
    }
  }, [clientId, handleCredentialResponse, text]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      setIsGsiLoaded(true);
      initGoogleIdentity();
    }
  }, [initGoogleIdentity]);

  const handleCustomButtonClick = () => {
    if (isAuthenticating) return;

    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        initGoogleIdentity();
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('[GoogleSignIn] Prompt skipped or not displayed, redirecting to backend OAuth flow:', notification.getNotDisplayedReason());
            window.location.href = `${getApiBaseUrl()}/v1/auth/google/login`;
          }
        });
      } catch (e) {
        console.warn('[GoogleSignIn] Prompt error, redirecting to backend OAuth flow:', e);
        window.location.href = `${getApiBaseUrl()}/v1/auth/google/login`;
      }
    } else {
      window.location.href = `${getApiBaseUrl()}/v1/auth/google/login`;
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {/* Load Google Identity Services Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setIsGsiLoaded(true);
          initGoogleIdentity();
        }}
        onError={() => {
          console.warn('[GoogleSignIn] Failed to load Google Identity Services SDK script');
        }}
      />

      {/* Official Google Button Container (rendered if GSI succeeds) */}
      <div
        ref={containerRef}
        className={`w-full flex justify-center min-h-[44px] transition-opacity duration-200 ${
          renderSuccess && !isAuthenticating ? 'block' : 'hidden'
        }`}
      />

      {/* Fallback / Loading Styled Custom Button */}
      {(!renderSuccess || isAuthenticating) && (
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={isAuthenticating}
          className="w-full h-12 px-5 flex items-center justify-center gap-3 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-100 font-semibold text-sm shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
              <span>Memverifikasi akun Google...</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 relative flex-shrink-0">
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span>{label}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
