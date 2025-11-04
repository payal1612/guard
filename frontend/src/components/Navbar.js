import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Shield, LogOut, Menu, X } from 'lucide-react';
import AuthModal from './vscode-remote://vscode-33be3a56-3398-400e-b645-718a451a752e.preview.emergentagent.com/app/frontend/plugins/visual-editsAuthModal';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/verify', label: 'Verify', protected: true },
    { path: '/trending', label: 'Trending Verifications' },
    { path: '/trending-news', label: 'Trending News' },
    { path: '/history', label: 'History', protected: true },
    { path: '/about', label: 'About' },
  ];

  return (
    <>
      <nav className="glass sticky top-0 z-50 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2" data-testid="nav-logo">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                TruthGuard
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                if (link.protected && !user) return null;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    data-testid={`nav-${link.label.toLowerCase()}`}
                    className={`px-4 py-2 rounded-full font-medium ${
                      isActive(link.path)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700" data-testid="user-name">Hi, {user.name}</span>
                  <button
                    onClick={logout}
                    data-testid="logout-button"
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  data-testid="login-signup-button"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl"
                >
                  Login / Sign Up
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/30">
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => {
                  if (link.protected && !user) return null;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        isActive(link.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-white/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-left"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Navbar;