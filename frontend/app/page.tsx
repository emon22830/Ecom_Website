import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slideUp">
                Welcome to CampusCart
              </h1>
              <p className="text-xl mb-8 animate-slideUp animation-delay-200">
                Your institution-based marketplace for buying and selling products within your campus community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-slideUp animation-delay-300">
                <Link 
                  href="/marketplace" 
                  className="btn bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg"
                >
                  Browse Marketplace
                </Link>
                <Link 
                  href="/auth/register" 
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-md font-semibold text-lg transition-colors"
                >
                  Join Now
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 animate-slideLeft">
              <div className="relative h-80 w-full">
                <Image 
                  src="/images/hero-image.svg" 
                  alt="CampusCart Marketplace" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CampusCart?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="bg-primary-light w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Secure & Trusted</h3>
              <p className="text-gray-600 text-center">
                All sellers are verified students from your institution, creating a safe and trusted marketplace environment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="bg-success w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Multiple Payment Options</h3>
              <p className="text-gray-600 text-center">
                Pay with credit cards, digital wallets, or even cryptocurrency for maximum flexibility.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="bg-highlight w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Direct Messaging</h3>
              <p className="text-gray-600 text-center">
                Communicate directly with sellers to ask questions or negotiate prices before making a purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600 text-center">
                Create an account using your institution email to verify your student status.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
              <p className="text-gray-600 text-center">
                Explore products listed by verified sellers from your institution.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Purchase Securely</h3>
              <p className="text-gray-600 text-center">
                Add items to your cart and checkout using your preferred payment method.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white font-bold text-xl">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Become a Seller</h3>
              <p className="text-gray-600 text-center">
                Apply for seller verification to start listing your own products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-highlight to-highlight-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join CampusCart?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start buying and selling within your campus community today. Join thousands of students already using CampusCart!
          </p>
          <Link 
            href="/auth/register" 
            className="btn bg-white text-highlight hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </main>
  );
} 