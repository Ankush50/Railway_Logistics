import React, { useState, useEffect, createContext, useContext } from "react";
import StatusChain from "./components/StatusChain";
import BookingDetailsModal from "./components/BookingDetailsModal";
import ProfilePicture from "./components/ProfilePicture";
import NotificationBell from "./components/NotificationBell";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import PWASettings from "./components/PWASettings";
import usePWA from "./hooks/usePWA";
import {
  Search,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Package,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  EyeOff,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  Loader2,
  Download,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Settings,
  Tag,
  Phone,
  Mail,
  Camera,
  MapPin as LocationIcon,
} from "lucide-react";
import {
  register,
  login,
  logout as apiLogout,
  getMe,
  setAuthToken,
  getServices,
  searchServices,
  createService,
  updateService,
  deleteService,
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  requestCancellation,
  uploadExcel,
  updateProfile,
  changePassword,
  uploadProfilePicture,
} from "./api";

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved ? saved === 'dark' : prefersDark;
    try {
      document.documentElement.classList.toggle('dark', initial);
      document.documentElement.style.colorScheme = initial ? 'dark' : 'light';
      if (document.body && !initial && document.body.classList.contains('dark')) {
        document.body.classList.remove('dark');
      }
    } catch (_) {}
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
    // Improve native component theming and compatibility across devices
    try {
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      // Ensure body never carries a conflicting dark class
      if (document.body && document.body.classList.contains('dark') && !isDark) {
        document.body.classList.remove('dark');
      }
    } catch (_) {}
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// Profile Modal Component - Moved outside App component to fix focus issues
const ProfileModal = ({
  showProfileModal,
  setShowProfileModal,
  isEditingProfile,
  setIsEditingProfile,
  currentUser,
  isDark,
  startProfileEdit,
  cancelProfileEdit,
  handleLogout,
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  profilePhone,
  setProfilePhone,
  profileAddress,
  setProfileAddress,
  profileCurrentPassword,
  setProfileCurrentPassword,
  profileNewPassword,
  setProfileNewPassword,
  profileConfirmPassword,
  setProfileConfirmPassword,
  profileLoading,
  profileError,
  setProfileError,
  profileSuccess,
  setProfileSuccess,
  handleProfileUpdate,
  refreshUserData,
}) => {
  if (!showProfileModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Details</h2>
            <button
              onClick={() => {
                setShowProfileModal(false);
                // Reset form when modal is closed
                if (isEditingProfile) {
                  setIsEditingProfile(false);
                  setProfileName("");
                  setProfileEmail("");
                  setProfilePhone("");
                  setProfileAddress("");
                  setProfileCurrentPassword("");
                  setProfileNewPassword("");
                  setProfileConfirmPassword("");
                  setProfileError("");
                  setProfileSuccess("");
                }
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isEditingProfile ? (
            // View Mode
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ProfilePicture 
                    user={currentUser} 
                    isDark={isDark} 
                    onUpdate={() => refreshUserData()}
                    size="md"
                    showUploadButton={true}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{currentUser.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser.username}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white break-all">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{currentUser.role}</p>
                  </div>
                </div>

                {currentUser.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white break-all">{currentUser.phone}</p>
                    </div>
                  </div>
                )}

                {currentUser.address && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <LocationIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white break-all">{currentUser.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={startProfileEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 hover:scale-105"
                    title="Edit Profile"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  
                  <button
                    onClick={() => setShowPWASettings(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg transition-all duration-200 hover:scale-105"
                    title="PWA Settings"
                  >
                    <Smartphone className="h-5 w-5" />
                    <span className="text-sm font-medium">PWA</span>
                  </button>

                </div>
                
                <button
                  onClick={() => { setShowProfileModal(false); handleLogout(); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 hover:scale-105"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ProfilePicture 
                    user={currentUser} 
                    isDark={isDark} 
                    onUpdate={() => refreshUserData()}
                    size="md"
                    showUploadButton={true}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Edit Profile</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update your information</p>
                  </div>
                </div>
              </div>

              {/* Error and Success Messages */}
              {profileError && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                  {profileSuccess}
                </div>
              )}

              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Company Address
                  </label>
                  <textarea
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your company address"
                  />
                </div>

                {/* Password Change Section */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password (Optional)</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={profileCurrentPassword}
                        onChange={(e) => setProfileCurrentPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={profileNewPassword}
                        onChange={(e) => setProfileNewPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter new password"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Must be at least 8 characters with uppercase, lowercase, number, and special character
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={profileConfirmPassword}
                        onChange={(e) => setProfileConfirmPassword(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleProfileUpdate}
                  disabled={profileLoading}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Update Profile
                    </>
                  )}
                </button>
                
                <button
                  onClick={cancelProfileEdit}
                  className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState("search");
  const [railwayData, setRailwayData] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // PWA functionality
  const {
    isOnline,
    isInstalled,
    hasUpdate,
    updateServiceWorker,
    requestNotificationPermission,
    sendPushNotification,
    isPWAReady
  } = usePWA();

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPWASettings, setShowPWASettings] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  // Booking UI states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingQuantity, setBookingQuantity] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetailsModalOpen, setBookingDetailsModalOpen] = useState(false);

  // Profile editing state - using separate state variables for stability
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
  const [profileNewPassword, setProfileNewPassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // ensure axios has the header set
      setAuthToken(token);
      checkAuthStatus();
    }
  }, []);

  // Periodic refresh of user data to ensure changes are reflected across devices
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const interval = setInterval(() => {
        refreshUserData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentUser]);

  // Load services and bookings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadServices();
      loadBookings();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const userData = await getMe();
      setCurrentUser(userData);
      setIsAuthenticated(true);
      setCurrentView("search");
      
      // Force a refresh after a short delay to ensure profile pictures are loaded
      setTimeout(() => {
        refreshUserData();
      }, 1000);
      
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const services = await getServices();
      setRailwayData(services);
      setError(''); // Clear any error messages
      setSuccess(''); // Clear any success messages
    } catch (error) {
      console.error("Failed to load services:", error);
      setSuccess(''); // Clear any previous success messages
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const list = currentUser?.role === 'admin' ? await getAllBookings() : await getUserBookings();
      setBookings(list);
      setError(''); // Clear any error messages
      setSuccess(''); // Clear any success messages
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setSuccess(''); // Clear any previous success messages
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      await loadBookings();
      setError('');
      setSuccess('Status updated successfully');
    } catch (error) {
      console.error("Failed to update status:", error);
      setError("Failed to update status");
    }
  };

  const handleStatusUpdateFromChain = async (newStatus) => {
    if (selectedBooking) {
      await handleStatusUpdate(selectedBooking._id, newStatus);
    }
  };

  const refreshUserData = async () => {
    try {
      // Force a complete refresh by clearing any cached data
      const userData = await getMe();
      
      // Update the current user state
      setCurrentUser(userData);
      
      // Force re-render of all components that use user data
      // This ensures profile pictures are updated everywhere
      setTimeout(() => {
        setCurrentUser({ ...userData });
      }, 100);
      
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Login Component
  const LoginForm = () => {
    const [loginForm, setLoginForm] = useState({
      username: "",
      password: "",
    });
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
      if (!loginForm.username || !loginForm.password) {
        setLoginError("Please fill in all fields");
        return;
      }

      try {
        setLoginLoading(true);
        setLoginError("");
        const response = await login(loginForm);
        // persist token securely in localStorage and axios header
        if (response.token) {
          localStorage.setItem("token", response.token);
          setAuthToken(response.token);
        }
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        setCurrentView("search");
        setError(''); // Clear any error messages
        setSuccess(''); // Clear any success messages
      } catch (error) {
        console.error("Login failed:", error);
        setLoginError(
          error.response?.data?.message || "Login failed. Please try again."
        );
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-blue-300 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-indigo-400 blur-3xl animate-bounce" style={{animationDuration:'6s'}} />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-cyan-300 blur-3xl animate-bounce" style={{animationDuration:'7s', animationDirection:'reverse'}} />
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {loginError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                onKeyDown={(e) => { if (e.key === 'Enter') { handleLogin(); } }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleLogin(); } }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loginLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => setShowLogin(false)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Register Component
  const RegisterForm = () => {
    const [registerForm, setRegisterForm] = useState({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      name: "",
      role: "user",
    });
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
      // Validation
      if (
        !registerForm.username ||
        !registerForm.password ||
        !registerForm.email ||
        !registerForm.name
      ) {
        setRegisterError("All fields are required");
        return;
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        setRegisterError("Passwords do not match");
        return;
      }

      try {
        setRegisterLoading(true);
        setRegisterError("");
        const response = await register(registerForm);
        if (response.token) {
          localStorage.setItem("token", response.token);
          setAuthToken(response.token);
        }
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        setCurrentView("search");
        setError(''); // Clear any error messages
        setSuccess(''); // Clear any success messages
      } catch (error) {
        console.error("Registration failed:", error);
        setRegisterError(
          error.response?.data?.message ||
            "Registration failed. Please try again."
        );
      } finally {
        setRegisterLoading(false);
      }
    };

    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        {/* Animated doodles background */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-emerald-300 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -left-16 w-64 h-64 rounded-full bg-green-400 blur-3xl animate-bounce" style={{animationDuration:'6s'}} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-teal-300 blur-3xl animate-bounce" style={{animationDuration:'7s', animationDirection:'reverse'}} />
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600 mt-2">
              Join our railway logistics platform
            </p>
          </div>

          {registerError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {registerError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
                onKeyDown={(e) => { if (e.key === 'Enter') { handleRegister(); } }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                onKeyDown={(e) => { if (e.key === 'Enter') { handleRegister(); } }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, username: e.target.value })
                }
                onKeyDown={(e) => { if (e.key === 'Enter') { handleRegister(); } }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, password: e.target.value })
                  }
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleRegister(); } }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleRegister(); } }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={registerForm.role}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, role: e.target.value })
                }
              >
                <option value="user">Regular User</option>
                {/* <option value="admin">Administrator</option> */}
              </select>
            </div>

            <button
              onClick={handleRegister}
              disabled={registerLoading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {registerLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setShowLogin(true)}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Search Component
  const SearchInterface = () => {
    const [searchForm, setSearchForm] = useState({
      from: "",
      to: "",
      date: "",
      weight: "",
    });
    const [searchLoading, setSearchLoading] = useState(false);

    const handleSearch = async () => {
      try {
        setSearchLoading(true);
        const results = await searchServices(searchForm);
        setSearchResults(results);
        setError(''); // Clear any error messages
        setSuccess(''); // Clear any success messages
      } catch (error) {
        console.error("Search failed:", error);
        setSuccess(''); // Clear any previous success messages
        setError("Search failed. Please try again.");
      } finally {
        setSearchLoading(false);
      }
    };

    return (
      <div className="max-w-6xl mx-auto">
        <div className={`rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8 transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <div className="bg-blue-100 dark:bg-blue-900/20 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            Find Railway Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Origin city"
                  className={`pl-12 w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={searchForm.from}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, from: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Destination city"
                  className={`pl-12 w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={searchForm.to}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, to: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="date"
                  className={`pl-12 w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={searchForm.date}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Weight (tons)
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="number"
                  placeholder="Weight needed"
                  className={`pl-12 w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={searchForm.weight}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, weight: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {searchLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-3 h-5 w-5" />
                    Search Services
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={`rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-2xl font-bold mb-6 flex items-center ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <div className="bg-green-100 dark:bg-green-900/20 w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Available Services
            </h3>
            <div className="space-y-4">
              {searchResults.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onBook={handleBookService}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Service Card Component
  const ServiceCard = ({ service, onBook }) => {
    return (
      <div className={`border rounded-xl p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 ${
        isDark 
          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h4 className={`text-xl font-bold mb-3 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {service.route}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                <Clock className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Schedule</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {service.departure} - {service.arrival}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                <Package className="h-5 w-5 mr-3 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Capacity</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {service.available}/{service.capacity} tons
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg gap-4">
                <Tag className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                  <p className={`font-bold text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    ₹{service.pricePerTon}/ton
                  </p>
                </div>
                {currentUser?.role !== 'admin' && (
                  <button
                    onClick={() => onBook(service)}
                    className="ml-auto bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow hover:shadow-md font-medium"
                  >
                    Book
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Admin Panel Component
  const AdminPanel = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [newService, setNewService] = useState({
      route: "",
      departure: "",
      arrival: "",
      capacity: "",
      available: "",
      pricePerTon: "",
      contact: "",
      date: "",
    });
    const [adminLoading, setAdminLoading] = useState(false);

    // Check if user is admin
    if (currentUser.role !== "admin") {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-8 rounded-lg text-center">
            <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p>You need administrator privileges to access this section.</p>
          </div>
        </div>
      );
    }

    const handleAddService = async () => {
      if (
        !newService.route ||
        !newService.departure ||
        !newService.arrival ||
        !newService.capacity ||
        !newService.available ||
        !newService.pricePerTon ||
        !newService.contact ||
        !newService.date
      ) {
        setSuccess(''); // Clear any success messages
        setError("Please fill all fields");
        return;
      }

      try {
        setAdminLoading(true);
        const serviceData = {
          ...newService,
          capacity: parseInt(newService.capacity),
          available: parseInt(newService.available),
          pricePerTon: parseInt(newService.pricePerTon),
        };

        if (editingService) {
          await updateService(editingService._id, serviceData);
          setEditingService(null);
        } else {
          await createService(serviceData);
        }
        await loadServices(); // Reload services

        setNewService({
          route: "",
          departure: "",
          arrival: "",
          capacity: "",
          available: "",
          pricePerTon: "",
          contact: "",
          date: "",
        });
        setShowAddForm(false);
        setError(''); // Clear any error messages
        setSuccess(editingService ? 'Service updated successfully!' : 'Service added successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error("Failed to add service:", error);
        setSuccess(''); // Clear any success messages
        setError("Failed to add service. Please try again.");
      } finally {
        setAdminLoading(false);
      }
    };

    const handleEditService = (service) => {
      setEditingService(service);
      setNewService({
        route: service.route,
        departure: service.departure,
        arrival: service.arrival,
        capacity: service.capacity.toString(),
        available: service.available.toString(),
        pricePerTon: service.pricePerTon.toString(),
        contact: service.contact,
        date: service.date,
      });
      setShowAddForm(true);
    };

    const handleCancelEdit = () => {
      setEditingService(null);
      setNewService({
        route: "",
        departure: "",
        arrival: "",
        capacity: "",
        available: "",
        pricePerTon: "",
        contact: "",
        date: "",
      });
      setShowAddForm(false);
    };

    const handleDeleteService = async (id) => {
      if (window.confirm("Are you sure you want to delete this service?")) {
        try {
          setAdminLoading(true);
          await deleteService(id);
          await loadServices(); // Reload services
          setError(''); // Clear any error messages
          setSuccess('Service deleted successfully!');
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
          console.error("Failed to delete service:", error);
          setSuccess(''); // Clear any success messages
          setError("Failed to delete service. Please try again.");
        } finally {
          setAdminLoading(false);
        }
      }
    };

    const handleExcelUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setAdminLoading(true);
          await uploadExcel(file);
          await loadServices(); // Reload services
          setError(''); // Clear any error messages
          setSuccess('Excel file uploaded successfully!');
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
          console.error("Failed to upload Excel:", error);
          setSuccess(''); // Clear any success messages
          setError('Failed to upload Excel file. Please try again.');
        } finally {
          setAdminLoading(false);
        }
      }
    };

    return (
      <div className="max-w-6xl mx-auto">
        <div className={`rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold flex items-center ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <div className="bg-purple-100 dark:bg-purple-900/20 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Admin Panel
              </h2>
              <p className={`${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Manage railway services and system data
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center ${
                  showAddForm
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {showAddForm ? 'Cancel' : 'Add Service'}
              </button>
              <button
                onClick={() => {
                  // Create and download sample Excel template
                  const csvContent = "Route,Departure,Arrival,Capacity,Available,Price/Ton,Contact,Date\nDelhi - Mumbai,08:00,18:00,50,35,2000,9876543210,2025-08-15\nMumbai - Chennai,14:00,08:00+1,40,25,2500,9876543211,2025-08-16";
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'services_template.csv';
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center font-medium"
              >
                <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Download Template
              </button>
              <label className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center cursor-pointer font-medium">
                <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Upload Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Add Service Form */}
          {showAddForm && (
            <div className={`mb-6 sm:mb-8 p-4 sm:p-6 border rounded-xl ${
              isDark 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <input
                  type="text"
                  placeholder="Route (e.g., Delhi - Mumbai)"
                  className={`p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={newService.route}
                  onChange={(e) =>
                    setNewService({ ...newService, route: e.target.value })
                  }
                />
                <input
                  type="time"
                  placeholder="Departure"
                  className={`p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={newService.departure}
                  onChange={(e) =>
                    setNewService({ ...newService, departure: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Arrival (e.g., 18:00)"
                  className={`p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={newService.arrival}
                  onChange={(e) =>
                    setNewService({ ...newService, arrival: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Total Capacity (tons)"
                  className={`p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={newService.capacity}
                  onChange={(e) =>
                    setNewService({ ...newService, capacity: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Available (tons)"
                  className={`p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={newService.available}
                  onChange={(e) =>
                    setNewService({ ...newService, available: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Price per ton"
                  className={`p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={newService.pricePerTon}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      pricePerTon: e.target.value,
                    })
                  }
                />
                <input
                  type="tel"
                  placeholder="Contact number"
                  className={`p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={newService.contact}
                  onChange={(e) =>
                    setNewService({ ...newService, contact: e.target.value })
                  }
                />
                <input
                  type="date"
                  className={`p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={newService.date}
                  onChange={(e) =>
                    setNewService({ ...newService, date: e.target.value })
                  }
                />
                <div className="sm:col-span-2 lg:col-span-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddService}
                      disabled={adminLoading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex-1 sm:flex-none"
                    >
                      {adminLoading ? (editingService ? "Updating..." : "Adding...") : (editingService ? "Update Service" : "Add Service")}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex-1 sm:flex-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className={`${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Route
                  </th>
                  <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Time
                  </th>
                  <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Capacity
                  </th>
                  <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Price/Ton
                  </th>
                  <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Date
                  </th>
                  <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
              }`}>
                {railwayData.map((service) => (
                  <tr key={service._id} className={`hover:${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  } transition-colors duration-200`}>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {service.route}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {service.departure} - {service.arrival}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {service.available}/{service.capacity} tons
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      ₹{service.pricePerTon}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {service.date}
                    </td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex space-x-2 sm:space-x-3">
                        <button 
                          onClick={() => handleEditService(service)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Booking Interface
  const BookingInterface = () => {
    const [expandedUserForBookingId, setExpandedUserForBookingId] = useState(null);
    return (
      <div className="max-w-6xl mx-auto">
        <div className={`rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <div className="bg-green-100 dark:bg-green-900/20 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            {currentUser?.role === 'admin' ? 'All Bookings' : 'My Bookings'}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                No bookings yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className={`border rounded-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="space-y-3 flex-1 min-w-0">
                      <h4 className={`text-xl font-bold break-words ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>
                        {booking.route || booking.serviceId?.route}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg min-w-0">
                          <Package className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                            <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {booking.quantity} tons
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg min-w-0">
                          <Tag className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                            <p className={`font-bold truncate ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                              ₹{booking.total}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-w-0">
                          <Calendar className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Booked On</p>
                            <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 flex-shrink-0">
                      {/* User Details Button - Show on top for mobile */}
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => setExpandedUserForBookingId(expandedUserForBookingId === booking._id ? null : booking._id)}
                          className={`p-2 rounded-lg ${isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'}`}
                          title={expandedUserForBookingId === booking._id ? 'Hide user details' : 'Show user details'}
                          aria-label="Toggle user details"
                        >
                          <User className="h-5 w-5" />
                        </button>
                      )}
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
                        booking.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : booking.status === 'Declined'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : booking.status === 'Cancellation Requested'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : booking.status === 'Cancelled'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            : booking.status === 'Goods Received at Origin'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : booking.status === 'In Transit'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : booking.status === 'Arrived at Destination'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
                            : booking.status === 'Ready for Pickup'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                            : booking.status === 'Out for Delivery'
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
                            : booking.status === 'Delivered'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {booking.status}
                      </span>
                      
                      {/* View Details Button */}
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setBookingDetailsModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                      >
                        View Details
                      </button>
                      
                      {/* Admin Action Buttons */}
                      {currentUser?.role === 'admin' && booking.status === 'Pending' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={async () => { 
                              await updateBookingStatus(booking._id, 'Confirmed'); 
                              await loadBookings(); 
                              setError(''); // Clear any error messages
                              setSuccess(''); // Clear any success messages
                            }}
                            className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm whitespace-nowrap"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => { 
                              await updateBookingStatus(booking._id, 'Declined'); 
                              await loadBookings(); 
                              setError(''); // Clear any error messages
                              setSuccess(''); // Clear any success messages
                            }}
                            className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm whitespace-nowrap"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {currentUser?.role === 'admin' && booking.status === 'Cancellation Requested' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={async () => { 
                              await updateBookingStatus(booking._id, 'Cancelled'); 
                              await loadBookings(); 
                              setError(''); // Clear any error messages
                              setSuccess(''); // Clear any success messages
                            }}
                            className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm whitespace-nowrap"
                          >
                            Approve Cancellation
                          </button>
                          <button
                            onClick={async () => { 
                              await updateBookingStatus(booking._id, 'Pending'); 
                              await loadBookings(); 
                              setError(''); // Clear any error messages
                              setSuccess(''); // Clear any success messages
                            }}
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm whitespace-nowrap"
                          >
                            Reject Cancellation
                          </button>
                        </div>
                      )}
                      
                      {/* User Action Buttons */}
                      {currentUser?.role !== 'admin' && booking.status === 'Pending' && (
                        <button
                          onClick={() => {
                            setBookingToCancel(booking);
                            setCancellationModalOpen(true);
                          }}
                          className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors text-sm whitespace-nowrap"
                        >
                          Request Cancellation
                        </button>
                      )}
                      {currentUser?.role !== 'admin' && booking.status === 'Cancellation Requested' && (
                        <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-sm whitespace-nowrap">
                          Cancellation Pending
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* User Details Section - Now shows below for better mobile experience */}
                  {currentUser?.role === 'admin' && expandedUserForBookingId === booking._id && (
                    <div className={`mt-4 p-3 sm:p-4 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                      <div className="flex items-center mb-4">
                        <ProfilePicture 
                          user={booking.userId} 
                          isDark={isDark} 
                          size="md"
                        />
                        <div className="ml-3">
                          <h5 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>User Details</h5>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {booking.userId?.name || 'N/A'}
                            {booking.userId?.profilePicture && (
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                Has Profile Picture
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-2 sm:p-3 border ${isDark ? 'border-gray-500' : 'border-gray-200'} min-w-0`}>
                          <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Name</p>
                          <p className={`font-medium truncate text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{booking.userId?.name || '—'}</p>
                        </div>
                        <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-2 sm:p-3 border ${isDark ? 'border-gray-500' : 'border-gray-200'} min-w-0`}>
                          <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Username</p>
                          <p className={`font-medium truncate text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{booking.userId?.username || '—'}</p>
                        </div>
                        <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-2 sm:p-3 border ${isDark ? 'border-gray-500' : 'border-gray-200'} min-w-0`}>
                          <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Email</p>
                          <p className={`font-medium break-all text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{booking.userId?.email || '—'}</p>
                        </div>
                        <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-2 sm:p-3 border ${isDark ? 'border-gray-500' : 'border-gray-200'} min-w-0`}>
                          <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Mobile</p>
                          <p className={`font-medium break-all text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{booking.userId?.phone || '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Chain - Show only on desktop */}
                  <div className="mt-4 hidden lg:block">
                    <StatusChain 
                      currentStatus={booking.status} 
                      isDark={isDark} 
                      isAdmin={currentUser?.role === 'admin'}
                      onStatusUpdate={currentUser?.role === 'admin' ? 
                        (newStatus) => handleStatusUpdate(booking._id, newStatus) : 
                        undefined
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Sidebar Component
  const Sidebar = () => {
    const navItems = [
      { id: "search", label: "Search Services", icon: Search, color: "text-blue-600" },
      { id: "bookings", label: currentUser?.role === 'admin' ? "User Bookings" : "My Bookings", icon: Eye, color: "text-green-600" },
      ...(currentUser?.role === "admin" ? [{ id: "admin", label: "Admin Panel", icon: Shield, color: "text-purple-600" }] : []),
    ];

    return (
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Turbo Transit
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-6 px-3">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSidebarOpen(false);
                    setError(''); // Clear any error messages
                    setSuccess(''); // Clear any success messages
                  }}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    currentView === item.id
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${item.color}`} />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Logout moved to profile modal */}
          </nav>
        </div>
      </>
    );
  };

  // Handle booking (open modal)
  const handleBookService = (service) => {
    if (currentUser?.role === 'admin') {
      setError('Admins cannot make bookings.');
      return;
    }
    setSelectedService(service);
    setBookingQuantity("");
    setBookingModalOpen(true);
  };

  const submitBooking = async () => {
    if (!selectedService) return;
    const quantityNum = parseInt(bookingQuantity);
    if (!quantityNum || quantityNum <= 0) {
      setError("Please enter a valid quantity in tons");
      return;
    }
    if (quantityNum > selectedService.available) {
      setError("Quantity exceeds available capacity");
      return;
    }
    try {
      setBookingSubmitting(true);
      const bookingData = {
        serviceId: selectedService._id,
        quantity: quantityNum,
        total: quantityNum * selectedService.pricePerTon,
      };
      await createBooking(bookingData);
      await loadBookings();
      await loadServices();
      setBookingModalOpen(false);
      setError(''); // Clear any error messages
      setSuccess(''); // Clear any success messages
      setBookingSuccess({
        route: selectedService.route,
        quantity: quantityNum,
        total: bookingData.total,
      });
    } catch (error) {
      console.error("Booking failed:", error);
      setSuccess(''); // Clear any previous success messages
      setError("Booking failed. Please try again.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Handle logout
  // Profile update handler
  const handleProfileUpdate = async () => {
    // Validation
    if (!profileName || !profileEmail) {
      setProfileError("Name and email are required");
      return;
    }

    if (profileNewPassword && profileNewPassword !== profileConfirmPassword) {
      setProfileError("New passwords do not match");
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileSuccess("");

      // Prepare update data
      const updateData = {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        address: profileAddress,
      };

      // Add password update if provided
      if (profileNewPassword) {
        updateData.currentPassword = profileCurrentPassword;
        updateData.newPassword = profileNewPassword;
      }

      // Call the actual API
      const response = await updateProfile(updateData);
      setCurrentUser(response.user);
      
      setProfileSuccess("Profile updated successfully!");
      setError(''); // Clear any previous errors
      setSuccess(''); // Clear any previous success messages
      setIsEditingProfile(false);
      
      // Don't reset form immediately - let user see success message
      // Form will be reset when they close the modal

      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      console.error("Profile update failed:", error);
      setSuccess(''); // Clear any previous success messages
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const startProfileEdit = () => {
    // Set individual state variables for stability
    setProfileName(currentUser?.name || "");
    setProfileEmail(currentUser?.email || "");
    setProfilePhone(currentUser?.phone || "");
    setProfileAddress(currentUser?.address || "");
    setProfileCurrentPassword("");
    setProfileNewPassword("");
    setProfileConfirmPassword("");
    setIsEditingProfile(true);
    setProfileError("");
    setProfileSuccess("");
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileName("");
    setProfileEmail("");
    setProfilePhone("");
    setProfileAddress("");
    setProfileCurrentPassword("");
    setProfileNewPassword("");
    setProfileConfirmPassword("");
    setProfileError("");
    setProfileSuccess("");
  };

  const handleLogout = () => {
    apiLogout();
    try { localStorage.removeItem("token"); } catch(_) {}
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentView("search");
    setBookings([]);
    setRailwayData([]);
    setSearchResults([]);
    setError(''); // Clear any error messages
    setSuccess(''); // Clear any success messages
  };

  // Show loading screen while checking auth
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication forms if not logged in
  if (!isAuthenticated) {
    return showLogin ? <LoginForm /> : <RegisterForm />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Top Navigation Bar */}
      <nav className={`${sidebarOpen ? 'lg:ml-64' : ''} border-b transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm`}>
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Menu button (enabled on desktop as well) */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Page title */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentView === "search" && "Search Services"}
              {currentView === "bookings" && (currentUser?.role === 'admin' ? "User Bookings" : "My Bookings")}
              {currentView === "admin" && "Admin Panel"}
            </h1>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-yellow-400 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notification Bell */}
            <NotificationBell isDark={isDark} />

            {/* Profile button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ProfilePicture 
                user={currentUser} 
                isDark={isDark} 
                onUpdate={() => refreshUserData()}
                size="sm"
              />
              <span className="hidden sm:block text-sm font-medium">{currentUser.name}</span>
              {currentUser.role === "admin" && (
                <span className="hidden sm:block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Admin
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Error Display */}
      {error && (
        <div className={`${sidebarOpen ? 'lg:ml-64' : ''} px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`border rounded-xl px-6 py-4 shadow-lg ${
            isDark 
              ? 'bg-red-900/20 border-red-700 text-red-300' 
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError("")}
                className={`p-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors ${
                  isDark ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-800'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className={`${sidebarOpen ? 'lg:ml-64' : ''} px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`border rounded-xl px-6 py-4 shadow-lg ${
            isDark 
              ? 'bg-green-900/20 border-green-700 text-green-300' 
              : 'bg-green-100 border-green-400 text-green-700'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{success}</span>
              <button
                onClick={() => setSuccess("")}
                className={`p-1 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors ${
                  isDark ? 'text-green-300 hover:text-green-200' : 'text-green-600 hover:text-green-800'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'lg:ml-64' : ''} py-6 transition-all duration-300`}>
        <div className="px-4 sm:px-6 lg:px-8">
          {currentView === "search" && <SearchInterface />}
          {currentView === "admin" && <AdminPanel />}
          {currentView === "bookings" && <BookingInterface />}
        </div>
      </main>

      {/* Profile Modal */}
      <ProfileModal
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
        isEditingProfile={isEditingProfile}
        setIsEditingProfile={setIsEditingProfile}
        currentUser={currentUser}
        isDark={isDark}
        startProfileEdit={startProfileEdit}
        cancelProfileEdit={cancelProfileEdit}
        handleLogout={handleLogout}
        profileName={profileName}
        setProfileName={setProfileName}
        profileEmail={profileEmail}
        setProfileEmail={setProfileEmail}
        profilePhone={profilePhone}
        setProfilePhone={setProfilePhone}
        profileAddress={profileAddress}
        setProfileAddress={setProfileAddress}
        profileCurrentPassword={profileCurrentPassword}
        setProfileCurrentPassword={setProfileCurrentPassword}
        profileNewPassword={profileNewPassword}
        setProfileNewPassword={setProfileNewPassword}
        profileConfirmPassword={profileConfirmPassword}
        setProfileConfirmPassword={setProfileConfirmPassword}
        profileLoading={profileLoading}
        profileError={profileError}
        setProfileError={setProfileError}
        profileSuccess={profileSuccess}
        setProfileSuccess={setProfileSuccess}
        handleProfileUpdate={handleProfileUpdate}
        refreshUserData={refreshUserData}
      />

      {/* Booking Modal */}
      {bookingModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Book Service</h3>
                <button
                  onClick={() => setBookingModalOpen(false)}
                  className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3 mb-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Route</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedService.route}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Available</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedService.available} tons</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Price</p>
                  <p className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>₹{selectedService.pricePerTon}/ton</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Quantity (tons)</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedService.available}
                    value={bookingQuantity}
                    onChange={(e) => setBookingQuantity(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter quantity"
                  />
                </div>
                {bookingQuantity && parseInt(bookingQuantity) > 0 && (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>Estimated Total</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                      ₹{(parseInt(bookingQuantity) || 0) * selectedService.pricePerTon}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setBookingModalOpen(false)}
                  className={`px-5 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={submitBooking}
                  disabled={bookingSubmitting}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {bookingSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellationModalOpen && bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Cancellation</h3>
                <button
                  onClick={() => {
                    setCancellationModalOpen(false);
                    setBookingToCancel(null);
                  }}
                  className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3 mb-6">
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Are you sure you want to request cancellation for this booking?
                </p>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Route</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {bookingToCancel.route || bookingToCancel.serviceId?.route}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Quantity</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {bookingToCancel.quantity} tons
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setCancellationModalOpen(false);
                    setBookingToCancel(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setCancellationLoading(true);
                      console.log('Attempting to cancel booking:', bookingToCancel._id);
                      console.log('API URL being used:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
                      const result = await requestCancellation(bookingToCancel._id);
                      console.log('Cancellation result:', result);
                      await loadBookings();
                      setError(''); // Clear any previous errors
                      setSuccess('Cancellation request submitted successfully! Admin will review and approve.');
                      setTimeout(() => setSuccess(''), 3000);
                      setCancellationModalOpen(false);
                      setBookingToCancel(null);
                    } catch (error) {
                      console.error('Cancellation request failed:', error);
                      console.error('Error details:', error.response?.data || error.message);
                      console.error('Error status:', error.response?.status);
                      console.error('Error response:', error.response);
                      setSuccess(''); // Clear any previous success messages
                      let errorMessage = 'Failed to request cancellation. ';
                      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                        errorMessage += 'Please make sure the backend server is running.';
                      } else {
                        errorMessage += error.response?.data?.message || error.message || 'Unknown error';
                      }
                      setError(errorMessage);
                    } finally {
                      setCancellationLoading(false);
                    }
                  }}
                  disabled={cancellationLoading}
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {cancellationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Request Cancellation'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-center ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className={`p-8 ${isDark ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/30' : 'bg-gradient-to-br from-emerald-50 to-blue-50'}`}>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className={`text-3xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Hurray!</h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Your booking has been confirmed.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-6">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Route</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{bookingSuccess.route}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Quantity</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{bookingSuccess.quantity} tons</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Total</p>
                  <p className={`font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>₹{bookingSuccess.total}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => { setBookingSuccess(null); setCurrentView('bookings'); }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => setBookingSuccess(null)}
                  className={isDark ? 'bg-gray-700 text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-600' : 'bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={bookingDetailsModalOpen}
        onClose={() => {
          setBookingDetailsModalOpen(false);
          setSelectedBooking(null);
        }}
        isDark={isDark}
        currentUser={currentUser}
        onStatusUpdate={handleStatusUpdateFromChain}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt isDark={isDark} />

      {/* PWA Settings Modal */}
      <PWASettings 
        isDark={isDark}
        isOpen={showPWASettings}
        onClose={() => setShowPWASettings(false)}
      />

      {/* PWA Update Notification */}
      {hasUpdate && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`rounded-2xl shadow-2xl border p-4 ${
            isDark 
              ? 'bg-green-800 border-green-600 text-white' 
              : 'bg-green-100 border-green-400 text-green-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  isDark ? 'bg-green-700' : 'bg-green-200'
                }`}>
                  <span className="text-lg">🔄</span>
                </div>
                <div>
                  <p className="font-semibold">Update Available</p>
                  <p className="text-sm opacity-90">New version ready to install</p>
                </div>
              </div>
              <button
                onClick={updateServiceWorker}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  isDark 
                    ? 'bg-green-700 hover:bg-green-600' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 z-50">
          <div className={`rounded-xl shadow-lg border px-4 py-2 ${
            isDark 
              ? 'bg-red-800 border-red-600 text-white' 
              : 'bg-red-100 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                isDark ? 'bg-red-400' : 'bg-red-500'
              } animate-pulse`}></div>
              <span className="text-sm font-medium">Offline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap App with ThemeProvider
const AppWithTheme = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWithTheme;
