import React, { useEffect, useRef } from 'react';
import './GoogleAuthButton.css';

// This component renders Google's official sign-in button
// and calls onCredential(credential) when user picks their account
export default function GoogleAuthButton({ onCredential, label = 'Continue with Google' }) {
  const btnRef = useRef(null);

  useEffect(() => {
    // Wait for the Google script to load
    const initGoogle = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            onCredential(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        width: btnRef.current?.offsetWidth || 400,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    };

    // If script already loaded
    if (window.google) {
      initGoogle();
    } else {
      // Wait for script to load
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onCredential]);

  return (
    <div className="google-btn-wrap">
      <div ref={btnRef} className="google-btn-inner" />
    </div>
  );
}
