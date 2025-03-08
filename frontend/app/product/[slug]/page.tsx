'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import { Product } from '@/store/slices/productSlice';
import { useAppDispatch } from '@/store/store';
import { addToCart } from '@/store/slices/cartSlice';

// Mock product data (in a real app, this would come from an API)
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Textbook - Introduction to Computer Science',
    slug: 'textbook-introduction-to-computer-science',
    description: 'A comprehensive introduction to computer science principles. This textbook covers fundamental concepts including algorithms, data structures, programming languages, and computer architecture. Perfect for beginners and those looking to strengthen their CS foundations. The book is in excellent condition with minimal highlighting and no damage.',
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
    description: 'Slightly used TI-84 Plus graphing calculator in excellent condition. This calculator is perfect for math, science, and engineering courses. It includes all original accessories and comes with fresh batteries. No scratches on the screen and all buttons work perfectly.',
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
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        const foundProduct = mockProducts.find((p) => p.slug === slug);
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedImage(foundProduct.thumbnailImage);
          
          // Find related products (same category)
          const related = mockProducts.filter(
            (p) => p.category === foundProduct.category && p._id !== foundProduct._id
          );
          setRelatedProducts(related);
        }
        setIsLoading(false);
      }, 1000);
    };

    fetchProduct();
  }, [slug]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCart({
          _id: product._id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          quantity,
          image: product.thumbnailImage,
          seller: product.seller._id,
          institution: product.institution._id,
        })
      );
      toast.success('Added to cart!');
    }
  };

  // Placeholder image for products without images
  const placeholderImage = '/images/product-placeholder.svg';

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-darkBg-tertiary rounded w-3/4 mb-8"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <div className="h-96 bg-gray-200 dark:bg-darkBg-tertiary rounded-lg"></div>
                <div className="flex mt-4 gap-2">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="h-20 w-20 bg-gray-200 dark:bg-darkBg-tertiary rounded-md"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-darkBg-tertiary rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-darkBg-tertiary rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-darkBg-tertiary rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 dark:bg-darkBg-tertiary rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-darkBg-tertiary rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 dark:bg-darkBg-tertiary rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
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
              Product not found
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              The product you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/marketplace"
              className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
              >
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-500 dark:text-gray-400 mx-2">/</span>
            </li>
            <li>
              <Link
                href="/marketplace"
                className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
              >
                Marketplace
              </Link>
            </li>
            <li>
              <span className="text-gray-500 dark:text-gray-400 mx-2">/</span>
            </li>
            <li>
              <Link
                href={`/marketplace?category=${product.category}`}
                className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light"
              >
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Link>
            </li>
            <li>
              <span className="text-gray-500 dark:text-gray-400 mx-2">/</span>
            </li>
            <li className="text-gray-900 dark:text-white font-medium truncate">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="md:w-1/2">
            <div className="relative h-96 bg-white dark:bg-darkBg-secondary rounded-lg overflow-hidden">
              <Image
                src={selectedImage || placeholderImage}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex mt-4 gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`h-20 w-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === image
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${
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
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {product.averageRating.toFixed(1)} ({product.numberOfRatings}{' '}
                  {product.numberOfRatings === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {product.sold} sold
              </span>
              <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {product.condition.replace('_', ' ')} condition
              </span>
            </div>

            <div className="mb-6">
              {product.discountPrice ? (
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${product.discountPrice.toFixed(2)}
                  </span>
                  <span className="ml-2 text-lg text-gray-500 dark:text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="ml-2 text-sm text-error">
                    Save $
                    {(product.price - product.discountPrice).toFixed(2)} (
                    {Math.round(
                      ((product.price - product.discountPrice) / product.price) *
                        100
                    )}
                    %)
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {product.description}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Seller
              </h2>
              <div className="flex items-center">
                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                  <Image
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 dark:text-white font-medium">
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
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.institution.name}
                  </p>
                </div>
                <button className="ml-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                  Contact Seller
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quantity
              </h2>
              <div className="flex items-center">
                <button
                  className="p-2 border border-gray-300 dark:border-darkBg-tertiary rounded-l-md bg-gray-100 dark:bg-darkBg-tertiary text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-darkBg-primary transition-colors"
                  onClick={decrementQuantity}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 text-center border-y border-gray-300 dark:border-darkBg-tertiary py-2 bg-white dark:bg-darkBg-tertiary text-gray-900 dark:text-white"
                />
                <button
                  className="p-2 border border-gray-300 dark:border-darkBg-tertiary rounded-r-md bg-gray-100 dark:bg-darkBg-tertiary text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-darkBg-primary transition-colors"
                  onClick={incrementQuantity}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                  {product.quantity} available
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center"
                onClick={handleAddToCart}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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
                Add to Cart
              </button>
              <button className="flex-1 px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Save for Later
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white dark:bg-darkBg-secondary rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1"
                >
                  <Link href={`/product/${relatedProduct.slug}`}>
                    <div className="relative h-48 bg-gray-100 dark:bg-darkBg-tertiary">
                      <Image
                        src={relatedProduct.thumbnailImage || placeholderImage}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                      {relatedProduct.discountPrice && (
                        <div className="absolute top-2 left-2 bg-error text-white text-xs font-bold px-2 py-1 rounded">
                          Sale
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/product/${relatedProduct.slug}`}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-primary dark:hover:text-primary-light transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 ${
                              i < Math.floor(relatedProduct.averageRating)
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {relatedProduct.discountPrice ? (
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              ${relatedProduct.discountPrice.toFixed(2)}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                              ${relatedProduct.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${relatedProduct.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 