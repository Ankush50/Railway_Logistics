import React, { useState, useEffect, createContext, useContext } from "react";
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
  CreditCard,
  Phone,
  Mail,
  MapPin as LocationIcon,
} from "lucide-react";
import {
  register,
  login,
  logout as apiLogout,
  getMe,
  getServices,
  searchServices,
  createService,
  updateService,
  deleteService,
  createBooking,
  getUserBookings,
  uploadExcel,
} from "./api";

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
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
      const userBookings = await getUserBookings();
      setBookings(userBookings);
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

    const handleLogin = async () => {
      if (!loginForm.username || !loginForm.password) {
        setLoginError("Please fill in all fields");
        return;
      }

      try {
        setLoginLoading(true);
        setLoginError("");
        const response = await login(loginForm);
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        setCurrentView("search");
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-6">
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />
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
              <input
                type="password"
                placeholder="Create a password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={registerForm.confirmPassword}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
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
        <div className={`rounded-2xl shadow-xl p-8 mb-8 transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h2 className={`text-3xl font-bold mb-8 flex items-center ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <div className="bg-blue-100 dark:bg-blue-900/20 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
              <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            Find Railway Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <div className="flex justify-between items-start">
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
              <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <CreditCard className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                  <p className={`font-bold text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    ₹{service.pricePerTon}/ton
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onBook(service)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
          >
            Book Now
          </button>
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
        <div className={`rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className={`text-3xl font-bold flex items-center ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <div className="bg-purple-100 dark:bg-purple-900/20 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Admin Panel
              </h2>
              <p className={`${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Manage railway services and system data
              </p>
            </div>
            <div className="space-x-3">
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
            <div className={`mb-8 p-6 border rounded-xl ${
              isDark 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-xl font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <thead className={`${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Route
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Time
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Capacity
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Price/Ton
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-medium ${
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
                    <td className={`px-6 py-4 text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {service.route}
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {service.departure} - {service.arrival}
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {service.available}/{service.capacity} tons
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      ₹{service.pricePerTon}
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {service.date}
                    </td>
                    <td className={`px-6 py-4 text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
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
        <div className={`rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h2 className={`text-3xl font-bold mb-8 flex items-center ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
              <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            My Bookings
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
                No bookings yet. Search for services to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className={`border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <h4 className={`text-xl font-bold ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>
                        {booking.route || booking.serviceId?.route}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                          <Package className="h-5 w-5 mr-3 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {booking.quantity} tons
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <CreditCard className="h-5 w-5 mr-3 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                            <p className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                              ₹{booking.total}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Booked On</p>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {booking.status}
                    </span>
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
      { id: "bookings", label: "My Bookings", icon: Eye, color: "text-green-600" },
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
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
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

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                    <p className="font-medium text-gray-900 dark:text-white">{currentUser.email}</p>
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
                      <p className="font-medium text-gray-900 dark:text-white">{currentUser.phone}</p>
                    </div>
                  </div>
                )}

                {currentUser.address && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <LocationIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white">{currentUser.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle booking
  const handleBookService = async (service) => {
    const quantity = prompt("Enter quantity in tons:");
    if (quantity && !isNaN(quantity)) {
      try {
        setLoading(true);
        const bookingData = {
          serviceId: service._id,
          quantity: parseInt(quantity),
          total: parseInt(quantity) * service.pricePerTon,
        };

        await createBooking(bookingData);
        await loadBookings(); // Reload bookings
        await loadServices(); // Reload services to update availability

        alert(`Booking confirmed! Total: ₹${bookingData.total}`);
        setCurrentView("bookings");
      } catch (error) {
        console.error("Booking failed:", error);
        alert("Booking failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    apiLogout();
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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Top Navigation Bar */}
      <nav className={`lg:ml-64 border-b transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-sm`}>
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Page title */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentView === "search" && "Search Services"}
              {currentView === "bookings" && "My Bookings"}
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
        <div className="lg:ml-64 px-4 sm:px-6 lg:px-8 mt-4">
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

      {/* Main Content */}
      <main className="lg:ml-64 py-6 transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-8">
          {currentView === "search" && <SearchInterface />}
          {currentView === "admin" && <AdminPanel />}
          {currentView === "bookings" && <BookingInterface />}
        </div>
      </main>

      {/* Profile Modal */}
      <ProfileModal />
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
