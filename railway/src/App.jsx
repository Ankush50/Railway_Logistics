import React, { useState, useEffect, createContext, useContext } from "react";
import { SecurityProvider, useSecurity } from "./contexts/SecurityContext.jsx";
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
  uploadExcel,
  updateProfile,
  changePassword,
  deleteAccount,
  getSecurityLog,
  enableTwoFactor,
  disableTwoFactor,
  checkConnection,
} from "./api";

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Use the theme that was set by the HTML script
    if (typeof window !== 'undefined' && window.__INITIAL_THEME__) {
      return window.__INITIAL_THEME__ === 'dark';
    }
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // Sync with Tailwind's dark mode
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

function App() {
  const [currentView, setCurrentView] = useState("search");
  const [railwayData, setRailwayData] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  // Security context
  const { 
    securityAlerts, 
    acknowledgeAlert, 
    clearSecurityAlerts,
    isAccountLocked,
    checkSecurityHealth,
    SECURITY_CONFIG,
    twoFactorEnabled,
    enableTwoFactor,
    disableTwoFactor
  } = useSecurity();

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  // Booking UI states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingQuantity, setBookingQuantity] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Profile editing state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Security state
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [securityLog, setSecurityLog] = useState([]);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // ensure axios has the header set
      setAuthToken(token);
      checkAuthStatus();
    }
  }, []);

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
    } catch (error) {
      console.error("Failed to load services:", error);
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
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
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
    const [loginStep, setLoginStep] = useState(""); // Track login progress
    const [connectionStatus, setConnectionStatus] = useState("checking"); // Connection status

    // Security context for login
    const { 
      recordFailedLogin, 
      recordSuccessfulLogin, 
      isAccountLocked,
      failedLoginAttempts,
      lastFailedLogin 
    } = useSecurity();

    // Check connection status on component mount
    useEffect(() => {
      const checkServerStatus = async () => {
        try {
          setConnectionStatus("checking");
          const isConnected = await checkConnection();
          setConnectionStatus(isConnected ? "connected" : "disconnected");
        } catch (error) {
          setConnectionStatus("disconnected");
        }
      };
      
      checkServerStatus();
    }, []);

    const handleLogin = async () => {
      // Check if account is locked
      if (isAccountLocked) {
        const remainingTime = Math.ceil((SECURITY_CONFIG.LOCKOUT_DURATION - (Date.now() - lastFailedLogin.getTime())) / 1000 / 60);
        setLoginError(`Account is temporarily locked. Please try again in ${remainingTime} minutes.`);
        return;
      }

      if (!loginForm.username || !loginForm.password) {
        setLoginError("Please fill in all fields");
        return;
      }

      try {
        setLoginLoading(true);
        setLoginError("");
        setLoginStep("Checking server connection...");
        
        // Check connection first
        const isConnected = await checkConnection();
        if (!isConnected) {
          setLoginStep("Server connection failed");
          throw new Error("Cannot connect to server. Please check your internet connection.");
        }
        
        setLoginStep("Authenticating credentials...");
        const response = await login(loginForm);
        
        setLoginStep("Setting up session...");
        // Login successful
        if (response.token) {
          localStorage.setItem("token", response.token);
          setAuthToken(response.token);
          recordSuccessfulLogin(); // Record successful login
        }
        
        setLoginStep("Loading user data...");
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        setCurrentView("search");
      } catch (error) {
        console.error("Login failed:", error);
        recordFailedLogin(); // Record failed login attempt
        
        let errorMessage = "Login failed. Please try again.";
        
        // Handle specific error types
        if (error.code === 'ERR_NETWORK') {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.response?.status === 0) {
          errorMessage = "CORS error. Please check if the backend is accessible.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message.includes("Cannot connect to server")) {
          errorMessage = error.message;
        }
        
        setLoginError(errorMessage);
        
        // Show remaining attempts
        if (failedLoginAttempts > 0) {
          const remainingAttempts = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - failedLoginAttempts;
          setLoginError(`${errorMessage} (${remainingAttempts} attempts remaining)`);
        }
      } finally {
        setLoginLoading(false);
        setLoginStep("");
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {/* Connection Status */}
          <div className={`mb-4 p-3 rounded-lg ${
            connectionStatus === "connected" ? "bg-green-50 border border-green-200" :
            connectionStatus === "disconnected" ? "bg-red-50 border border-red-200" :
            "bg-gray-50 border border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected" ? "bg-green-500" :
                  connectionStatus === "disconnected" ? "bg-red-500" :
                  "bg-gray-400 animate-pulse"
                }`}></div>
                <span className={
                  connectionStatus === "connected" ? "text-green-700" :
                  connectionStatus === "disconnected" ? "text-red-700" :
                  "text-gray-600"
                }>
                  {connectionStatus === "connected" ? "Server connected" :
                   connectionStatus === "disconnected" ? "Server disconnected" :
                   "Checking server status..."}
                </span>
              </div>
              {connectionStatus === "disconnected" && (
                <button
                  onClick={async () => {
                    setConnectionStatus("checking");
                    try {
                      const isConnected = await checkConnection();
                      setConnectionStatus(isConnected ? "connected" : "disconnected");
                    } catch (error) {
                      setConnectionStatus("disconnected");
                    }
                  }}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
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
                  {loginStep || "Connecting to server..."}
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
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-6">
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
      } catch (error) {
        console.error("Search failed:", error);
        setError("Search failed. Please try again.");
      } finally {
        setSearchLoading(false);
      }
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl shadow-xl p-8 mb-8 transition-colors duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-8 flex items-center text-gray-800 dark:text-white">
            <div className="bg-blue-100 dark:bg-blue-900/20 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
              <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            Find Railway Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-200">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Origin city"
                  className="pl-12 w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={searchForm.from}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, from: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-200">
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Destination city"
                  className="pl-12 w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={searchForm.to}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, to: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-200">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="date"
                  className="pl-12 w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={searchForm.date}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-200">
                Weight (tons)
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="number"
                  placeholder="Weight needed"
                  className="pl-12 w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={searchForm.weight}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, weight: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
          <div className="rounded-2xl shadow-xl p-8 transition-colors duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-white">
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
      <div className="border rounded-xl p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
              {service.route}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                <Clock className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Schedule</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {service.departure} - {service.arrival}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                <Package className="h-5 w-5 mr-3 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Capacity</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {service.available}/{service.capacity} tons
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg gap-4">
                <Tag className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                  <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    ₹{service.pricePerTon}/ton
                  </p>
                </div>
                <button
                  onClick={() => onBook(service)}
                  className="ml-auto bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow hover:shadow-md font-medium"
                >
                  Book
                </button>
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
        alert("Please fill all fields");
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
      } catch (error) {
        console.error("Failed to add service:", error);
        alert("Failed to add service. Please try again.");
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
        } catch (error) {
          console.error("Failed to delete service:", error);
          alert("Failed to delete service. Please try again.");
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
          alert("Excel file uploaded successfully!");
        } catch (error) {
          console.error("Failed to upload Excel:", error);
          alert("Failed to upload Excel file. Please try again.");
        } finally {
          setAdminLoading(false);
        }
      }
    };

    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl shadow-xl p-8 transition-colors duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold flex items-center text-gray-800 dark:text-white">
                <div className="bg-purple-100 dark:bg-purple-900/20 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Admin Panel
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage railway services and system data
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center ${
                  showAddForm
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                <Plus className="mr-2 h-5 w-5" />
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
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center font-medium"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Template
              </button>
              <label className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center cursor-pointer font-medium">
                <Upload className="mr-2 h-5 w-5" />
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
            <div className="mb-8 p-6 border rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <input
                  type="text"
                  placeholder="Route (e.g., Delhi - Mumbai)"
                  className="p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={newService.route}
                  onChange={(e) =>
                    setNewService({ ...newService, route: e.target.value })
                  }
                />
                <input
                  type="time"
                  placeholder="Departure"
                  className="p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={newService.departure}
                  onChange={(e) =>
                    setNewService({ ...newService, departure: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Arrival (e.g., 18:00)"
                  className="p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={newService.arrival}
                  onChange={(e) =>
                    setNewService({ ...newService, arrival: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Total Capacity (tons)"
                  className="p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={newService.capacity}
                  onChange={(e) =>
                    setNewService({ ...newService, capacity: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Available (tons)"
                  className="p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={newService.available}
                  onChange={(e) =>
                    setNewService({ ...newService, available: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Price per ton"
                  className="p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
                  className="p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={newService.contact}
                  onChange={(e) =>
                    setNewService({ ...newService, contact: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  value={newService.date}
                  onChange={(e) =>
                    setNewService({ ...newService, date: e.target.value })
                  }
                />
                <div className="md:col-span-4">
                  <button
                    onClick={handleAddService}
                    disabled={adminLoading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 mr-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                  >
                    {adminLoading ? (editingService ? "Updating..." : "Adding...") : (editingService ? "Update Service" : "Add Service")}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-500 text-white px-8 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Route
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Price/Ton
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {railwayData.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {service.route}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {service.departure} - {service.arrival}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {service.available}/{service.capacity} tons
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      ₹{service.pricePerTon}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {service.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleEditService(service)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
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
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl shadow-xl p-8 transition-colors duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-8 flex items-center text-gray-800 dark:text-white">
            <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
              <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            {currentUser?.role === 'admin' ? 'User Bookings' : 'My Bookings'}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-lg text-gray-500 dark:text-gray-300">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-300">
                No bookings yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border rounded-xl p-6 transition-all duration-200 hover:shadow-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                        {booking.route || booking.serviceId?.route}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                          <Package className="h-5 w-5 mr-3 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {booking.quantity} tons
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Tag className="h-5 w-5 mr-3 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                            <p className="font-bold text-green-600 dark:text-green-400">
                              ₹{booking.total}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Booked On</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {currentUser?.role === 'admin' && (
                          <div className="md:col-span-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-300">User</p>
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {booking.userId?.name} ({booking.userId?.username})
                              </p>
                              <p className="text-sm break-all text-gray-600 dark:text-gray-300">
                                {booking.userId?.email}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        booking.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : booking.status === 'Declined'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {booking.status}
                      </span>
                      {currentUser?.role === 'admin' && booking.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={async () => { await updateBookingStatus(booking._id, 'Confirmed'); await loadBookings(); }}
                            className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => { await updateBookingStatus(booking._id, 'Declined'); await loadBookings(); }}
                            className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
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
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

  // Profile Modal Component
  const ProfileModal = () => {
    if (!showProfileModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Details</h2>
              <button
                onClick={() => setShowProfileModal(false)}
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
                    <div className="bg-blue-100 dark:bg-blue-800 w-12 h-12 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{currentUser.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser.username}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white break-all">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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

                <div className="pt-4 space-y-3">
                  <button
                    onClick={startProfileEdit}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Edit className="h-5 w-5 mr-2" /> Edit Profile
                  </button>
                  <button
                    onClick={() => setShowSecuritySettings(true)}
                    className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Shield className="h-5 w-5 mr-2" /> Security Settings
                  </button>
                  <button
                    onClick={() => { setShowProfileModal(false); handleLogout(); }}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <LogOut className="h-5 w-5 mr-2" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-800 w-12 h-12 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
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
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
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
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
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
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Company Address
                    </label>
                    <textarea
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
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
                          value={profileForm.currentPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
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
                          value={profileForm.newPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
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
                          value={profileForm.confirmPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Settings Section */}
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Settings</h4>
                    
                    <div className="space-y-4">
                      {/* Two-Factor Authentication */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {twoFactorEnabled ? 'Enabled' : 'Disabled'} - Add an extra layer of security
                          </p>
                        </div>
                        <button
                          onClick={twoFactorEnabled ? handleDisableTwoFactor : handleEnableTwoFactor}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            twoFactorEnabled
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>

                      {/* Security Log */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900 dark:text-white">Security Activity</h5>
                          <button
                            onClick={loadSecurityLog}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                          >
                            Refresh
                          </button>
                        </div>
                        {securityLog.length > 0 ? (
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {securityLog.slice(0, 5).map((log, index) => (
                              <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(log.timestamp).toLocaleString()} - {log.action}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                        )}
                      </div>

                      {/* Account Deletion */}
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h5>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                          onClick={() => setShowDeleteAccountModal(true)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Delete Account
                        </button>
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

  // Handle booking (open modal)
  const handleBookService = (service) => {
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
      setBookingSuccess({
        route: selectedService.route,
        quantity: quantityNum,
        total: bookingData.total,
      });
    } catch (error) {
      console.error("Booking failed:", error);
      setError("Booking failed. Please try again.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Handle logout
  const handleProfileUpdate = async () => {
    // Validation
    if (!profileForm.name || !profileForm.email) {
      setProfileError("Name and email are required");
      return;
    }

    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileError("New passwords do not match");
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileSuccess("");

      // Prepare update data
      const updateData = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address,
      };

      // Add password update if provided
      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      // Call the actual API
      const response = await updateProfile(updateData);
      setCurrentUser(response.user);
      
      setProfileSuccess("Profile updated successfully!");
      setIsEditingProfile(false);
      
      // Reset form
      setProfileForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      console.error("Profile update failed:", error);
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const startProfileEdit = () => {
    setProfileForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      address: currentUser.address || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditingProfile(true);
    setProfileError("");
    setProfileSuccess("");
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setProfileError("");
    setProfileSuccess("");
  };

  // Security functions
  const handleDeleteAccount = async () => {
    if (!deleteAccountPassword) {
      setProfileError("Password is required to delete account");
      return;
    }

    try {
      setDeleteAccountLoading(true);
      await deleteAccount({ password: deleteAccountPassword });
      
      // Account deleted successfully, logout user
      handleLogout();
    } catch (error) {
      setProfileError(error.message || "Failed to delete account");
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      const response = await enableTwoFactor();
      setProfileSuccess("Two-factor authentication enabled successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      setProfileError(error.message || "Failed to enable two-factor authentication");
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!profileForm.currentPassword) {
      setProfileError("Current password is required to disable 2FA");
      return;
    }

    try {
      await disableTwoFactor({ password: profileForm.currentPassword });
      setProfileSuccess("Two-factor authentication disabled successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      setProfileError(error.message || "Failed to disable two-factor authentication");
    }
  };

  const loadSecurityLog = async () => {
    try {
      const log = await getSecurityLog();
      setSecurityLog(log);
    } catch (error) {
      console.error("Failed to load security log:", error);
    }
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
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Top Navigation Bar */}
      <nav className={`${sidebarOpen ? 'lg:ml-64' : ''} border-b transition-colors duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Menu button (enabled on desktop as well) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Page title */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentView === "search" && "Search Services"}
              {currentView === "bookings" && (currentUser?.role === 'admin' ? 'User Bookings' : 'My Bookings')}
              {currentView === "admin" && "Admin Panel"}
            </h1>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Security Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                checkSecurityHealth().healthy ? 'bg-green-500' : 'bg-red-500'
              }`} title={checkSecurityHealth().healthy ? 'Security OK' : 'Security Issues Detected'} />
              <span className="hidden lg:block text-xs text-gray-500 dark:text-gray-400">
                {checkSecurityHealth().score}/100
              </span>
            </div>

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

            {/* Profile button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
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
          <div className="border rounded-xl px-6 py-4 shadow-lg bg-red-100 dark:bg-red-900/20 border-red-400 dark:border-red-700 text-red-700 dark:text-red-300">
            <div className="flex items-center justify-between">
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError("")}
                className="p-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Alerts Display */}
      {securityAlerts.length > 0 && (
        <div className={`${sidebarOpen ? 'lg:ml-64' : ''} px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className="border rounded-xl px-6 py-4 shadow-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Security Alerts</h3>
              <button
                onClick={clearSecurityAlerts}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {securityAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg ${
                  alert.level === 'critical' ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                  alert.level === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                  'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        alert.level === 'critical' ? 'text-red-800 dark:text-red-200' :
                        alert.level === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                        'text-blue-800 dark:text-blue-200'
                      }`}>
                        {alert.message}
                      </p>
                      <p className={`text-xs ${
                        alert.level === 'critical' ? 'text-red-600 dark:text-red-400' :
                        alert.level === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="ml-3 text-xs px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {securityAlerts.length > 3 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                  +{securityAlerts.length - 3} more alerts
                </p>
              )}
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
      <ProfileModal />

      {/* Security Settings Modal */}
      {showSecuritySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
                <button
                  onClick={() => setShowSecuritySettings(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        twoFactorEnabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={twoFactorEnabled ? handleDisableTwoFactor : handleEnableTwoFactor}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          twoFactorEnabled
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {twoFactorEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                  
                  {!twoFactorEnabled && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Two-factor authentication adds an extra layer of security by requiring a second form of verification.
                      </p>
                    </div>
                  )}
                </div>

                {/* Security Log */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Activity Log</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Monitor your account's security events
                      </p>
                    </div>
                    <button
                      onClick={loadSecurityLog}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Refresh Log
                    </button>
                  </div>
                  
                  {securityLog.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {securityLog.map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{log.action}</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{log.details}</p>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No security events recorded</p>
                    </div>
                  )}
                </div>

                {/* Account Deletion */}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Once you delete your account, there is no going back. All your data, bookings, and account information will be permanently deleted.
                  </p>
                  <button
                    onClick={() => {
                      setShowSecuritySettings(false);
                      setShowDeleteAccountModal(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Account</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={deleteAccountPassword}
                    onChange={(e) => setDeleteAccountPassword(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your password to confirm"
                  />
                </div>

                {profileError && (
                  <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                    {profileError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteAccountModal(false);
                    setDeleteAccountPassword("");
                    setProfileError("");
                  }}
                  className="px-5 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountLoading || !deleteAccountPassword}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                >
                  {deleteAccountLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                    ) : (
                      'Delete Account'
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Book Service</h3>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">Route</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedService.route}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">Available</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedService.available} tons</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">Price</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">₹{selectedService.pricePerTon}/ton</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Quantity (tons)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedService.available}
                  value={bookingQuantity}
                  onChange={(e) => setBookingQuantity(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter quantity"
                />
              </div>
              {bookingQuantity && parseInt(bookingQuantity) > 0 && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm text-green-700 dark:text-green-300">Estimated Total</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">
                    ₹{(parseInt(bookingQuantity) || 0) * selectedService.pricePerTon}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBookingModalOpen(false)}
                className="px-5 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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

      {/* Booking Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                  <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="p-8 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/40 dark:to-blue-900/30">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">Hurray!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Your booking has been confirmed.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-6">
              <div className="p-4 rounded-xl bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-300">Route</p>
                <p className="font-semibold text-gray-900 dark:text-white">{bookingSuccess.route}</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-300">Quantity</p>
                <p className="font-semibold text-gray-900 dark:text-white">{bookingSuccess.quantity} tons</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-300">Total</p>
                <p className="font-bold text-green-700 dark:text-green-400">₹{bookingSuccess.total}</p>
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
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

// Wrap App with ThemeProvider and SecurityProvider
const AppWithTheme = () => (
  <SecurityProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </SecurityProvider>
);

export default AppWithTheme;
