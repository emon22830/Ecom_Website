'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { toggleCart } from '@/store/slices/uiSlice';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { totalItems } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const openCart = () => {
    dispatch(toggleCart());
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-darkBg-primary shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="CampusCart"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-bold text-primary dark:text-white">
                CampusCart
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/marketplace"
              className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/sellers"
              className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              Sellers
            </Link>
            <Link
              href="/about"
              className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkBg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Search Button */}
            <button
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkBg-secondary transition-colors"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkBg-secondary transition-colors relative"
              aria-label="Cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary">
                    <Image
                      src={user?.avatar || '/images/default-avatar.jpg'}
                      alt={user?.name || 'User'}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-darkBg-secondary rounded-md shadow-lg py-1 z-10 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-darkBg-tertiary">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkBg-tertiary"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkBg-tertiary"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    {user?.role === 'seller' && (
                      <Link
                        href="/seller/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkBg-tertiary"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Seller Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkBg-tertiary"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-gray-100 dark:hover:bg-darkBg-tertiary"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkBg-secondary transition-colors"
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-darkBg-tertiary animate-slideDown">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/marketplace"
                className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/sellers"
                className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sellers
              </Link>
              <Link
                href="/about"
                className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              {!isAuthenticated && (
                <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-darkBg-tertiary">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 