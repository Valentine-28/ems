import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiBriefcase, FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/');
    }
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const features = [
    { icon: FiUsers, text: 'Employee Management' },
    { icon: FiCalendar, text: 'Attendance Tracking' },
    { icon: FiDollarSign, text: 'Payroll Processing' },
    { icon: FiBriefcase, text: 'Performance Reviews' }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <svg className="absolute bottom-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.1 }} />
                <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.05 }} />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#gradient)" />
            <circle cx="20%" cy="80%" r="300" fill="#ffffff" opacity="0.1" />
            <circle cx="80%" cy="20%" r="200" fill="#ffffff" opacity="0.08" />
            <circle cx="90%" cy="90%" r="150" fill="#ffffff" opacity="0.06" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <FiLogIn className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">HR System</h1>
                <p className="text-blue-100 text-sm">SmartTech Ltd</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome Back
              </h2>
              <p className="text-blue-100 text-lg">
                Access your HR management dashboard to manage employees, track attendance, process payroll, and more.
              </p>
            </div>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 text-white">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <feature.icon className="text-blue-100" size={18} />
                  </div>
                  <span className="text-blue-50">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-blue-200 text-sm">
            <p>© 2024 SmartTech Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <FiLogIn className="text-white text-3xl" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              HR System
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <FiLogIn className="text-white text-3xl" />
            </div>
            <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">
              Sign In
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-gray-400 hover:text-gray-600 transition-colors" size={18} />
                    ) : (
                      <FiEye className="text-gray-400 hover:text-gray-600 transition-colors" size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
            
            {/* Register Link for Mobile */}
            <div className="text-center lg:hidden">
              <Link to="/register" className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
                Don't have an account? Register here
              </Link>
            </div>
          </form>
          
          {/* Demo Credentials Card */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-center">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
                Demo Credentials
              </p>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Email:</span> hr@smarttech.com
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Password:</span> password123
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use these credentials to test the system
              </p>
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-700 transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-700 transition-colors">Help</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;