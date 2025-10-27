import React, { useState } from 'react';
import { Menu, X, User, ChevronDown, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false); // Close mobile menu when navigating
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Articles', path: '/articles' },
    { name: 'Rewritten Articles', path: '/rewritten-articles' },
    { name: 'Settings', path: '/settings' }
  ];

  // Function to check if current path matches the nav item
  const isActivePath = (path) => {
    if (path === '/articles') {
      // For articles, also consider article detail pages as active
      return location.pathname === '/articles' || location.pathname.startsWith('/articles/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-xl border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                {/* Logo Icon */}
                <div 
                  className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                {/* Brand Text */}
                <div 
                  className="flex flex-col cursor-pointer"
                  onClick={() => handleNavigation('/dashboard')}
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">ArticlePro</span>
                  <span className="text-sm text-indigo-600 font-semibold -mt-1 tracking-wide">Content Studio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Menu - Centered */}
          <div className="hidden md:block flex-1">
            <div className="flex items-center justify-center space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'text-indigo-600 bg-indigo-50 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {item.name}
                  {isActivePath(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200">
              <Bell className="h-6 w-6" />
              <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            </button>

            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-800">John Doe</div>
                  <div className="text-xs text-gray-500">Content Creator</div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">John Doe</p>
                    <p className="text-xs text-gray-500">john.doe@example.com</p>
                  </div>
                  <button 
                    onClick={() => {
                      handleNavigation('/profile');
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                  >
                    Your Profile
                  </button>
                  <button 
                    onClick={() => {
                      handleNavigation('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                  >
                    Account Settings
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200">
                    Billing
                  </button>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200">
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-4 pt-4 pb-3 space-y-2 bg-gradient-to-b from-white to-gray-50">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`w-full text-left block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {item.name}
              </button>
            ))}
            
            {/* Mobile Profile Section */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <div className="flex items-center px-4 py-3">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-base font-semibold text-gray-800">John Doe</div>
                  <div className="text-sm text-gray-500">john.doe@example.com</div>
                </div>
                <div className="ml-auto relative">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="mt-3 space-y-1 px-4">
                <button 
                  onClick={() => handleNavigation('/profile')}
                  className="w-full text-left block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                >
                  Your Profile
                </button>
                <button 
                  onClick={() => handleNavigation('/settings')}
                  className="w-full text-left block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                >
                  Account Settings
                </button>
                <button className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;