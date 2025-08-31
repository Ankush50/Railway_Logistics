import { useState, useEffect, useCallback } from 'react';

const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [waitingWorker, setWaitingWorker] = useState(null);

  // Check if app is installed
  const checkInstallationStatus = useCallback(() => {
    // Check for standalone mode (iOS Safari)
    if (window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check for standalone mode (Android Chrome)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if running in TWA (Trusted Web Activity)
    if (document.referrer.includes('android-app://')) {
      setIsInstalled(true);
      return;
    }

    // Check if running in Electron or other desktop wrapper
    if (window.navigator.userAgent.includes('Electron')) {
      setIsInstalled(true);
      return;
    }

    setIsInstalled(false);
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        setRegistration(reg);
        console.log('Service Worker registered successfully:', reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true);
                setWaitingWorker(newWorker);
              }
            });
          }
        });

        // Handle service worker updates
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        return reg;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Update service worker
  const updateServiceWorker = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setHasUpdate(false);
      setWaitingWorker(null);
    }
  }, [waitingWorker]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Send push notification
  const sendPushNotification = useCallback(async (title, options = {}) => {
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          ...options
        });
        return true;
      } catch (error) {
        console.error('Failed to send push notification:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Check for periodic sync support
  const checkPeriodicSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
        return status.state === 'granted';
      } catch (error) {
        console.log('Periodic sync not supported:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Register periodic sync
  const registerPeriodicSync = useCallback(async (tag = 'content-update') => {
    if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.periodicSync.register(tag, {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
        return true;
      } catch (error) {
        console.error('Failed to register periodic sync:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Check cache status
  const checkCacheStatus = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const cacheInfo = await Promise.all(
          cacheNames.map(async (name) => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            return {
              name,
              size: keys.length,
              timestamp: Date.now()
            };
          })
        );
        return cacheInfo;
      } catch (error) {
        console.error('Failed to check cache status:', error);
        return [];
      }
    }
    return [];
  }, []);

  // Clear old caches
  const clearOldCaches = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const currentCaches = ['turbo-transit-static-v1.0.0', 'turbo-transit-dynamic-v1.0.0'];
        
        await Promise.all(
          cacheNames
            .filter(name => !currentCaches.includes(name))
            .map(name => caches.delete(name))
        );
        
        return true;
      } catch (error) {
        console.error('Failed to clear old caches:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Get app version
  const getAppVersion = useCallback(async () => {
    if (registration) {
      try {
        const messageChannel = new MessageChannel();
        return new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data.version);
          };
          registration.active.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
        });
      } catch (error) {
        console.error('Failed to get app version:', error);
        return 'unknown';
      }
    }
    return 'unknown';
  }, [registration]);

  // Initialize PWA features
  useEffect(() => {
    checkInstallationStatus();
    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check installation status periodically
    const installCheckInterval = setInterval(checkInstallationStatus, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(installCheckInterval);
    };
  }, [checkInstallationStatus, registerServiceWorker]);

  // Check for app updates
  useEffect(() => {
    if (registration) {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdate(true);
              setWaitingWorker(newWorker);
            }
          });
        }
      });
    }
  }, [registration]);

  return {
    // State
    isOnline,
    isInstalled,
    hasUpdate,
    registration,
    
    // Methods
    updateServiceWorker,
    requestNotificationPermission,
    sendPushNotification,
    checkPeriodicSync,
    registerPeriodicSync,
    checkCacheStatus,
    clearOldCaches,
    getAppVersion,
    
    // Utilities
    isPWAReady: !!registration,
    canInstall: !isInstalled && 'serviceWorker' in navigator,
    canUseNotifications: 'Notification' in window,
    canUsePeriodicSync: 'periodicSync' in window.ServiceWorkerRegistration.prototype
  };
};

export default usePWA;
