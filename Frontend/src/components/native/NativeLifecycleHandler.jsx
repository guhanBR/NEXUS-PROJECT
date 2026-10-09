import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

export function NativeLifecycleHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Configure Status Bar for modern dark styling
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#18191E' });
    } catch (e) {
      console.warn('StatusBar configuration not supported in current environment', e);
    }

    // 2. Configure Android Hardware Back Button listener
    let backButtonHandle;
    try {
      backButtonHandle = CapApp.addListener('backButton', ({ canGoBack }) => {
        const path = location.pathname;
        if (path === '/' || path === '/login' || path === '/overview') {
          // If on main landing / root overview, exit app
          CapApp.exitApp();
        } else if (canGoBack) {
          navigate(-1);
        } else {
          navigate('/overview', { replace: true });
        }
      });
    } catch (e) {
      console.warn('BackButton listener error', e);
    }

    // 3. Configure Keyboard avoidance
    try {
      Keyboard.setAccessoryBarVisible({ isVisible: true });
    } catch (e) {
      // ignore
    }

    return () => {
      if (backButtonHandle && typeof backButtonHandle.remove === 'function') {
        backButtonHandle.remove();
      }
    };
  }, [navigate, location]);

  return null;
}
