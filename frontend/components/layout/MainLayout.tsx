'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAppSelector } from '@/store/store';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { cartOpen } = useAppSelector((state) => state.ui);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      
      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>
            
            {/* Cart Panel */}
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white dark:bg-darkBg-primary shadow-xl overflow-y-auto">
                  {/* Cart Header */}
                  <div className="px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Shopping Cart
                      </h2>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-white dark:bg-darkBg-primary rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <span className="sr-only">Close panel</span>
                          <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cart Items */}
                  <div className="flex-1 py-6 px-4 sm:px-6">
                    <div className="mt-8">
                      <div className="flow-root">
                        <ul className="-my-6 divide-y divide-gray-200 dark:divide-darkBg-tertiary">
                          {/* Cart is empty state */}
                          <li className="py-6 flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400">
                              Your cart is empty
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cart Footer */}
                  <div className="border-t border-gray-200 dark:border-darkBg-tertiary py-6 px-4 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                      <p>Subtotal</p>
                      <p>$0.00</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      Shipping and taxes calculated at checkout.
                    </p>
                    <div className="mt-6">
                      <a
                        href="#"
                        className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark"
                      >
                        Checkout
                      </a>
                    </div>
                    <div className="mt-6 flex justify-center text-sm text-center text-gray-500 dark:text-gray-400">
                      <p>
                        or{' '}
                        <button
                          type="button"
                          className="text-primary hover:text-primary-dark font-medium"
                        >
                          Continue Shopping
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout; 