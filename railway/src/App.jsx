import React, { useState, useEffect } from "react";
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Search className="mr-2" />
            Find Railway Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Origin city"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={searchForm.from}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, from: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Destination city"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={searchForm.to}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, to: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={searchForm.date}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (tons)
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Weight needed"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Services
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
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
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800">
              {service.route}
            </h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Departure: {service.departure} | Arrival: {service.arrival}
              </div>
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Available: {service.available}/{service.capacity} tons
              </div>
              <div className="flex items-center">
                <span className="font-medium">₹{service.pricePerTon}/ton</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onBook(service)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Shield className="mr-2 text-blue-600" />
                Admin Panel
              </h2>
              <p className="text-gray-600">
                Manage railway services and system data
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Service
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
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </button>
              <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
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
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Route (e.g., Delhi - Mumbai)"
                  className="p-3 border border-gray-300 rounded-lg"
                  value={newService.route}
                  onChange={(e) =>
                    setNewService({ ...newService, route: e.target.value })
                  }
                />
                <input
                  type="time"
                  placeholder="Departure"
                  className="p-3 border border-gray-300 rounded-lg"
                  value={newService.departure}
                  onChange={(e) =>
                    setNewService({ ...newService, departure: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Arrival (e.g., 18:00)"
                  className="p-3 border border-gray-300 rounded-lg"
                  value={newService.arrival}
                  onChange={(e) =>
                    setNewService({ ...newService, arrival: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Total Capacity (tons)"
                  className="p-3 border border-gray-300 rounded-lg"
                  value={newService.capacity}
                  onChange={(e) =>
                    setNewService({ ...newService, capacity: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Available (tons)"
                  className="p-3 border border-gray-300 rounded-lg"
                  value={newService.available}
                  onChange={(e) =>
                    setNewService({ ...newService, available: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Price per ton"
                  className="p-3 border border-gray-300 rounded-lg"
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
                  className="p-3 border border-gray-300 rounded-lg"
                  value={newService.contact}
                  onChange={(e) =>
                    setNewService({ ...newService, contact: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="p-3 border border-gray-300 rounded-lg"
                  value={newService.date}
                  onChange={(e) =>
                    setNewService({ ...newService, date: e.target.value })
                  }
                />
                <div className="md:col-span-4">
                  <button
                    onClick={handleAddService}
                    disabled={adminLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adminLoading ? (editingService ? "Updating..." : "Adding...") : (editingService ? "Update Service" : "Add Service")}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
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
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Capacity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Price/Ton
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {railwayData.map((service) => (
                  <tr key={service._id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {service.route}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {service.departure} - {service.arrival}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {service.available}/{service.capacity} tons
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ₹{service.pricePerTon}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {service.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditService(service)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h2>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500">
                No bookings yet. Search for services to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">
                        {booking.route || booking.serviceId?.route}
                      </h4>
                      <p className="text-gray-600">
                        Quantity: {booking.quantity} tons
                      </p>
                      <p className="text-gray-600">Total: ₹{booking.total}</p>
                      <p className="text-gray-600">
                        Date: {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
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
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Turbo Transit
              </h1>
            </div>

            {/* User info and navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{currentUser.name}</span>
                {currentUser.role === "admin" && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Admin
                  </span>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView("search")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === "search"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Search className="inline h-4 w-4 mr-1" />
                  Search
                </button>

                <button
                  onClick={() => setCurrentView("bookings")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === "bookings"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Eye className="inline h-4 w-4 mr-1" />
                  My Bookings
                </button>

                {currentUser.role === "admin" && (
                  <button
                    onClick={() => setCurrentView("admin")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Shield className="inline h-4 w-4 mr-1" />
                    Admin
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-800"
                >
                  <LogOut className="inline h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError("")}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="py-6">
        {currentView === "search" && <SearchInterface />}
        {currentView === "admin" && <AdminPanel />}
        {currentView === "bookings" && <BookingInterface />}
      </main>
    </div>
  );
}

export default App;
