import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';

const PWAInstallPrompt = ({ isDark }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);

  useEffect(() => {
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        setIsInstalled(true);
      }
    };

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e;
      if (!isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      window.deferredPrompt = null;
      if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Turbo Transit Installed! 🎉', {
            body: 'Your railway logistics app is now installed and ready to use.',
            icon: '/favicon2.ico',
            badge: '/favicon2.ico',
            tag: 'install-success'
          });
        });
      }
    };

    checkIfInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const checkInterval = setInterval(checkIfInstalled, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearInterval(checkInterval);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstallLoading(true);

    try {
      // Show the native browser install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // The 'appinstalled' event will handle hiding the prompt
      } else {
        console.log('User dismissed the install prompt');
      }

    } catch (error) {
      console.error('Installation failed:', error);
      // Fallback to manual install instructions if prompt fails
      handleManualInstall();
    } finally {
      // The prompt can only be used once, so we clear it.
      setDeferredPrompt(null);
      window.deferredPrompt = null;
      // We only hide the prompt if the user dismissed it.
      // If accepted, the 'appinstalled' event will hide it.
      if ((await deferredPrompt.userChoice).outcome !== 'accepted') {
        setShowInstallPrompt(false);
      }
      setInstallLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  const handleManualInstall = () => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    let instructions = '';
    if (isChrome || isEdge) {
      instructions = 'Click on browser menu, then click on "Save and Share" and select "Install page as App"';
    } else if (isFirefox) {
      instructions = 'Click the menu button (≡) and select "Install"';
    } else {
      instructions = 'Look for an install option in your browser menu or address bar';
    }

    alert(`To install this app:\n\n${instructions}\n\nOr use your browser's "Add to Home Screen" option.`);
  };

  const handleLearnMore = () => {
    window.open('https://web.dev/installable/', '_blank');
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-sm mx-auto">
      <div className={`relative rounded-2xl shadow-2xl border transition-all duration-300 transform ${
        isDark 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <button
          onClick={handleDismiss}
          className={`absolute top-3 right-3 p-1 rounded-lg transition-colors ${
            isDark 
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 ${
              isDark ? 'bg-blue-900/20' : 'bg-blue-100'
            }`}>
              <Download className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Install Turbo Transit</h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Get the app experience
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <Smartphone className={`h-4 w-4 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
              <span className="text-sm">Quick access from home screen</span>
            </div>
            <div className="flex items-center space-x-3">
              <Monitor className={`h-4 w-4 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`} />
              <span className="text-sm">Works offline</span>
            </div>
            <div className="flex items-center space-x-3">
              <Tablet className={`h-4 w-4 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <span className="text-sm">Faster loading</span>
            </div>
          </div>

          <div className="flex space-x-3">
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                disabled={installLoading}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {installLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleManualInstall}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Install App
              </button>
            )}
            
            <button
              onClick={handleLearnMore}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Learn More
            </button>
          </div>

          <p className={`text-xs mt-4 text-center ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Free to install • No additional storage required
          </p>
        </div>

        <div className={`absolute -top-2 -left-2 w-4 h-4 rounded-full ${
          isDark ? 'bg-blue-500' : 'bg-blue-400'
        } opacity-20 animate-pulse`}></div>
        <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full ${
          isDark ? 'bg-green-500' : 'bg-green-400'
        } opacity-20 animate-pulse`} style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;