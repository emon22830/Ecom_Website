'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Product } from '@/store/slices/productSlice';

// Mock product data (in a real app, this would come from an API)
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Textbook - Introduction to Computer Science',
    slug: 'textbook-introduction-to-computer-science',
    description: 'A comprehensive introduction to computer science principles.',
    price: 45.99,
    discountPrice: 39.99,
    category: 'books',
    subcategory: 'textbooks',
    tags: ['computer science', 'programming', 'textbook'],
    images: ['/images/products/textbook1.jpg'],
    thumbnailImage: '/images/products/textbook1.jpg',
    seller: {
      _id: '101',
      name: 'John Smith',
      avatar: '/images/default-avatar.svg',
      isVerified: true,
    },
    institution: {
      _id: '1',
      name: 'University of Example',
      logo: '/images/logo.svg',
    },
    quantity: 5,
    sold: 12,
    isAvailable: true,
    isApproved: true,
    approvalStatus: 'approved',
    condition: 'good',
    averageRating: 4.5,
    numberOfRatings: 8,
    featured: true,
    views: 120,
    createdAt: '2023-01-15T00:00:00.000Z',
    updatedAt: '2023-01-15T00:00:00.000Z',
  },
  {
    _id: '2',
    name: 'Graphing Calculator - TI-84 Plus',
    slug: 'graphing-calculator-ti-84-plus',
    description: 'Slightly used TI-84 Plus graphing calculator in excellent condition.',
    price: 89.99,
    category: 'electronics',
    subcategory: 'calculators',
    tags: ['calculator', 'math', 'engineering'],
    images: ['/images/products/calculator1.jpg'],
    thumbnailImage: '/images/products/calculator1.jpg',
    seller: {
      _id: '102',
      name: 'Emily Johnson',
      avatar: '/images/default-avatar.svg',
      isVerified: true,
    },
    institution: {
      _id: '1',
      name: 'University of Example',
      logo: '/images/logo.svg',
    },
    quantity: 1,
    sold: 0,
    isAvailable: true,
    isApproved: true,
    approvalStatus: 'approved',
    condition: 'like_new',
    averageRating: 0,
    numberOfRatings: 0,
    featured: false,
    views: 45,
    createdAt: '2023-02-10T00:00:00.000Z',
    updatedAt: '2023-02-10T00:00:00.000Z',
  },
  {
    _id: '3',
    name: 'Desk Lamp - LED with USB Charging Port',
    slug: 'desk-lamp-led-with-usb-charging-port',
    description: 'Modern LED desk lamp with adjustable brightness and USB charging port.',
    price: 34.99,
    discountPrice: 29.99,
    category: 'electronics',
    subcategory: 'lighting',
    tags: ['lamp', 'LED', 'desk', 'dorm'],
    images: ['/images/products/lamp1.jpg'],
    thumbnailImage: '/images/products/lamp1.jpg',
    seller: {
      _id: '103',
      name: 'Michael Brown',
      avatar: '/images/default-avatar.svg',
      isVerified: true,
    },
    institution: {
      _id: '1',
      name: 'University of Example',
      logo: '/images/logo.svg',
    },
    quantity: 3,
    sold: 7,
    isAvailable: true,
    isApproved: true,
    approvalStatus: 'approved',
    condition: 'new',
    averageRating: 4.8,
    numberOfRatings: 5,
    featured: true,
    views: 89,
    createdAt: '2023-01-25T00:00:00.000Z',
    updatedAt: '2023-01-25T00:00:00.000Z',
  },
  {
    _id: '4',
    name: 'Dorm Room Mini Fridge - 3.2 Cu Ft',
    slug: 'dorm-room-mini-fridge-3-2-cu-ft',
    description: 'Compact mini fridge perfect for dorm rooms. Includes freezer compartment.',
    price: 129.99,
    category: 'furniture',
    subcategory: 'appliances',
    tags: ['fridge', 'dorm', 'appliance'],
    images: ['/images/products/fridge1.jpg'],
    thumbnailImage: '/images/products/fridge1.jpg',
    seller: {
      _id: '104',
      name: 'Sarah Wilson',
      avatar: '/images/default-avatar.svg',
      isVerified: true,
    },
    institution: {
      _id: '1',
      name: 'University of Example',
      logo: '/images/logo.svg',
    },
    quantity: 1,
    sold: 2,
    isAvailable: true,
    isApproved: true,
    approvalStatus: 'approved',
    condition: 'good',
    averageRating: 4.0,
    numberOfRatings: 2,
    featured: false,
    views: 67,
    createdAt: '2023-02-05T00:00:00.000Z',
    updatedAt: '2023-02-05T00:00:00.000Z',
  },
  {
    _id: '5',
    name: 'Wireless Noise Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    description: 'Premium wireless headphones with active noise cancellation. Great for studying.',
    price: 199.99,
    discountPrice: 169.99,
    category: 'electronics',
    subcategory: 'audio',
    tags: ['headphones', 'wireless', 'audio'],
    images: ['/images/products/headphones1.jpg'],
    thumbnailImage: '/images/products/headphones1.jpg',
    seller: {
      _id: '105',
      name: 'David Lee',
      avatar: '/images/default-avatar.svg',
      isVerified: true,
    },
    institution: {
      _id: '1',
      name: 'University of Example',
      logo: '/images/logo.svg',
    },
    quantity: 2,
    sold: 8,
    isAvailable: true,
    isApproved: true,
    approvalStatus: 'approved',
    condition: 'like_new',
    averageRating: 4.9,
    numberOfRatings: 12,
    featured: true,
    views: 210,
    createdAt: '2023-01-10T00:00:00.000Z',
    updatedAt: '2023-01-10T00:00:00.000Z',
  },
  {
    _id: '6',
    name: 'Ergonomic Desk Chair',
    slug: 'ergonomic-desk-chair',
    description: 'Comfortable ergonomic desk chair with lumbar support and adjustable height.',
    price: 149.99,
    category: 'furniture',
    subcategory: 'chairs',
    tags: ['chair', 'desk', 'ergonomic'],
    images: ['/images/products/chair1.jpg'],
    thumbnailImage: '/images/products/chair1.jpg',
    seller: {
      _id: '106',
      name: 'Jessica Martinez',
      avatar: '/images/default-avatar.svg',
      isVerified: true,
    },
    institution: {
      _id: '1',
      name: 'University of Example',
      logo: '/images/logo.svg',
    },
    quantity: 1,
    sold: 3,
    isAvailable: true,
    isApproved: true,
    approvalStatus: 'approved',
    condition: 'good',
    averageRating: 4.2,
    numberOfRatings: 4,
    featured: false,
    views: 78,
    createdAt: '2023-02-15T00:00:00.000Z',
    updatedAt: '2023-02-15T00:00:00.000Z',
  },
];

// Mock categories
const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'books', name: 'Books & Textbooks' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'furniture', name: 'Furniture' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'services', name: 'Services' },
  { id: 'other', name: 'Other' },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading products from API
  useEffect(() => {
    const fetchProducts = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setIsLoading(false);
      }, 1000);
    };

    fetchProducts();
  }, []);

  // Filter products when category, search term, or sort option changes
  useEffect(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((product) => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Sort products
    switch (sortBy) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'price-low-high':
        result.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high-low':
        result.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceB - priceA;
        });
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Placeholder image for products without images
  const placeholderImage = '/images/product-placeholder.svg';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Campus Marketplace
        </h1>

        {/* Search and Filters */}
        <div className="mb-8 bg-white dark:bg-darkBg-secondary p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-darkBg-tertiary rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-darkBg-tertiary dark:text-white"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
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
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkBg-tertiary rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-darkBg-tertiary dark:text-white"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-darkBg-secondary p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Categories
              </h2>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkBg-tertiary'
                      }`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-darkBg-secondary rounded-lg shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 dark:bg-darkBg-tertiary"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-darkBg-tertiary rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-darkBg-tertiary rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-darkBg-tertiary rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-darkBg-secondary p-8 rounded-lg shadow-sm text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No products found
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                    setSortBy('newest');
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white dark:bg-darkBg-secondary rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1"
                  >
                    <Link href={`/product/${product.slug}`}>
                      <div className="relative h-48 bg-gray-100 dark:bg-darkBg-tertiary">
                        <Image
                          src={product.thumbnailImage || placeholderImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        {product.discountPrice && (
                          <div className="absolute top-2 left-2 bg-error text-white text-xs font-bold px-2 py-1 rounded">
                            Sale
                          </div>
                        )}
                        {product.condition === 'new' && (
                          <div className="absolute top-2 right-2 bg-success text-white text-xs font-bold px-2 py-1 rounded">
                            New
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-primary dark:hover:text-primary-light transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 ${
                                i < Math.floor(product.averageRating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                            ({product.numberOfRatings})
                          </span>
                        </div>
                        <span className="mx-2 text-gray-300 dark:text-gray-600">
                          |
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {product.condition.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.discountPrice ? (
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                ${product.discountPrice.toFixed(2)}
                              </span>
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                          aria-label="Add to cart"
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
                        </button>
                      </div>
                      <div className="mt-2 flex items-center">
                        <div className="flex-shrink-0">
                          <Image
                            src={product.seller.avatar}
                            alt={product.seller.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        </div>
                        <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {product.seller.name}
                          {product.seller.isVerified && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-primary inline-block ml-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 