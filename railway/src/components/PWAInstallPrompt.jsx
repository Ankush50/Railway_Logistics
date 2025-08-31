import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';

const PWAInstallPrompt = ({ isDark }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches ||
          window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
      
      // Check if running in TWA (Trusted Web Activity)
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true);
        return;
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      // Show success message
      if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Turbo Transit Installed! 🎉', {
            body: 'Your railway logistics app is now installed and ready to use.',
            icon: '/icon-192x192.png',
            badge: '/icon-72x72.png',
            tag: 'install-success'
          });
        });
      }
    };

    // Check if already installed
    checkIfInstalled();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check periodically for installation status
    const checkInterval = setInterval(checkIfInstalled, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearInterval(checkInterval);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstallLoading(true);
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
        // Hide prompt for a while, then show again later
        setTimeout(() => setShowInstallPrompt(true), 30000);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setInstallLoading(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Show again after 1 hour
    setTimeout(() => setShowInstallPrompt(true), 3600000);
  };

  const handleLearnMore = () => {
    // Open help modal or navigate to help page
    window.open('https://web.dev/installable/', '_blank');
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className={`relative rounded-2xl shadow-2xl border transition-all duration-300 transform ${
        isDark 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {/* Close button */}
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
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 ${
              isDark ? 'bg-blue-900/20' : 'bg-blue-100'
            }`}>
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <Smartphone className={`h-4 w-4 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
              <span className="text-sm">Quick access from home screen</span>
            </div>
            <div className="flex items-center space-x-3">
              <Monitor className={`h-4 w-4 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
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

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleInstallClick}
              disabled={installLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

          {/* Footer note */}
          <p className={`text-xs mt-4 text-center ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Free to install • No additional storage required
          </p>
        </div>

        {/* Decorative elements */}
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
