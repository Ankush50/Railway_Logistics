import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Bell, 
  Wifi, 
  WifiOff, 
  Download, 
  RefreshCw, 
  Settings,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import usePWA from '../hooks/usePWA';

const PWASettings = ({ isDark, isOpen, onClose }) => {
  const {
    isOnline,
    isInstalled,
    hasUpdate,
    updateServiceWorker,
    requestNotificationPermission,
    sendPushNotification,
    checkPeriodicSync,
    registerPeriodicSync,
    checkCacheStatus,
    clearOldCaches,
    getAppVersion,
    isPWAReady,
    canUseNotifications,
    canUsePeriodicSync
  } = usePWA();

  const [notificationPermission, setNotificationPermission] = useState('default');
  const [periodicSyncEnabled, setPeriodicSyncEnabled] = useState(false);
  const [cacheInfo, setCacheInfo] = useState([]);
  const [appVersion, setAppVersion] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPWAData();
    }
  }, [isOpen]);

  const loadPWAData = async () => {
    setIsLoading(true);
    try {
      // Get notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }

      // Check periodic sync status
      if (canUsePeriodicSync) {
        const hasPeriodicSync = await checkPeriodicSync();
        setPeriodicSyncEnabled(hasPeriodicSync);
      }

      // Get cache info
      const cacheData = await checkCacheStatus();
      setCacheInfo(cacheData);

      // Get app version
      const version = await getAppVersion();
      setAppVersion(version);
    } catch (error) {
      console.error('Failed to load PWA data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async () => {
    if (notificationPermission === 'granted') {
      // Cannot revoke permission, but we can show current status
      return;
    }

    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      // Show test notification
      await sendPushNotification('Notifications Enabled! 🎉', {
        body: 'You will now receive important updates about your bookings.',
        tag: 'notification-test'
      });
    }
  };

  const handlePeriodicSyncToggle = async () => {
    if (periodicSyncEnabled) {
      // Note: Periodic sync cannot be unregistered, but we can show status
      setPeriodicSyncEnabled(false);
    } else {
      const success = await registerPeriodicSync();
      if (success) {
        setPeriodicSyncEnabled(true);
      }
    }
  };

  const handleClearCache = async () => {
    const success = await clearOldCaches();
    if (success) {
      await loadPWAData(); // Reload cache info
    }
  };

  const handleTestNotification = async () => {
    await sendPushNotification('Test Notification 🚂', {
      body: 'This is a test notification from Turbo Transit.',
      tag: 'test-notification'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                isDark ? 'bg-blue-900/20' : 'bg-blue-100'
              }`}>
                <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  PWA Settings
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Progressive Web App Configuration
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-red-600 mb-4" />
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Loading PWA settings...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PWA Status */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-3 flex items-center ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  <Smartphone className="h-4 w-4 mr-2" />
                  App Status
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>PWA Ready:</span>
                    <span className={`flex items-center ${
                      isPWAReady ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isPWAReady ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                      {isPWAReady ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Installed:</span>
                    <span className={`flex items-center ${
                      isInstalled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {isInstalled ? <CheckCircle className="h-4 w-4 mr-1" /> : <Info className="h-4 w-4 mr-1" />}
                      {isInstalled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Online:</span>
                    <span className={`flex items-center ${
                      isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isOnline ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
                      {isOnline ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Version:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{appVersion}</span>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              {canUseNotifications && (
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`font-semibold mb-3 flex items-center ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Permission:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notificationPermission === 'granted' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : notificationPermission === 'denied'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {notificationPermission}
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleNotificationToggle}
                        disabled={notificationPermission === 'granted'}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          notificationPermission === 'granted'
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {notificationPermission === 'granted' ? 'Enabled' : 'Enable'}
                      </button>
                      {notificationPermission === 'granted' && (
                        <button
                          onClick={handleTestNotification}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          Test
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Periodic Sync */}
              {canUsePeriodicSync && (
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`font-semibold mb-3 flex items-center ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Background Sync
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        periodicSyncEnabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {periodicSyncEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <button
                      onClick={handlePeriodicSyncToggle}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        periodicSyncEnabled
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {periodicSyncEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              )}

              {/* Cache Management */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-3 flex items-center ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  <Download className="h-4 w-4 mr-2" />
                  Cache Management
                </h3>
                <div className="space-y-3">
                  {cacheInfo.length > 0 ? (
                    <div className="space-y-2">
                      {cacheInfo.map((cache, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {cache.name}
                          </span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {cache.size} items
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No cache information available
                    </p>
                  )}
                  <button
                    onClick={handleClearCache}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                  >
                    Clear Old Caches
                  </button>
                </div>
              </div>

              {/* Update Available */}
              {hasUpdate && (
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-green-900/20 border-green-600' : 'bg-green-50 border-green-400'
                }`}>
                  <h3 className={`font-semibold mb-3 flex items-center ${
                    isDark ? 'text-green-300' : 'text-green-800'
                  }`}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Available
                  </h3>
                  <p className={`text-sm mb-3 ${
                    isDark ? 'text-green-200' : 'text-green-700'
                  }`}>
                    A new version of the app is available. Update to get the latest features and improvements.
                  </p>
                  <button
                    onClick={updateServiceWorker}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    Update Now
                  </button>
                </div>
              )}

              {/* Manual Install Instructions */}
              {!isInstalled && (
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-400'
                }`}>
                  <h3 className={`font-semibold mb-3 flex items-center ${
                    isDark ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    <Download className="h-4 w-4 mr-2" />
                    Install Instructions
                  </h3>
                  <div className={`text-sm space-y-2 ${
                    isDark ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    <p className="font-medium">Desktop Installation:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {/* <li><strong>Chrome/Edge/Brave:</strong> Look for the install icon (⊕) in the address bar</li> */}
                      <li><strong>Chrome/Edge/Brave:</strong> Click on browser menu, then click on "Save and Share" and select "Install page as App"</li>
                      <li><strong>Firefox:</strong> Click the menu button (≡) and select "Share -- Install"</li>
                      <li><strong>Safari:</strong> Go to File → Add to Dock</li>
                    </ul>
                    <p className="font-medium mt-3">Mobile Installation:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Android:</strong> Tap "Add to Home Screen" when prompted or go to the browser menu and select "Add to Home Screen"</li>
                      <li><strong>iOS:</strong> Tap the share button and select "Add to Home Screen" or go to the browser menu and select "Add to Home Screen"</li>
                    </ul>
                    <div className={`mt-3 p-2 rounded-lg ${
                      isDark ? 'bg-blue-800/30' : 'bg-blue-100'
                    }`}>
                      <p className="text-xs">
                        💡 <strong>Tip:</strong> Make sure you're using a modern browser and have visited the site at least once before.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWASettings;
