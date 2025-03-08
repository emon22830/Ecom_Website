import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  tags: string[];
  images: string[];
  thumbnailImage: string;
  seller: {
    _id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  institution: {
    _id: string;
    name: string;
    logo: string;
  };
  quantity: number;
  sold: number;
  isAvailable: boolean;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  customizationOptions?: {
    name: string;
    options: string[];
    priceModifiers: number[];
  }[];
  specifications?: Record<string, string>;
  averageRating: number;
  numberOfRatings: number;
  featured: boolean;
  views: number;
  shippingInfo?: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    shippingFee?: number;
    freeShipping?: boolean;
    estimatedDelivery?: string;
  };
  returnPolicy?: {
    returnsAccepted?: boolean;
    returnPeriod?: number;
    returnConditions?: string;
  };
  warranty?: {
    hasWarranty?: boolean;
    warrantyPeriod?: string;
    warrantyDetails?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  recentlyViewed: Product[];
  searchResults: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  filters: {
    category: string | null;
    subcategory: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    condition: string | null;
    rating: number | null;
    sortBy: 'newest' | 'price-low-high' | 'price-high-low' | 'popular' | 'rating';
    searchTerm: string;
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalProducts: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Get recently viewed products from localStorage
const getRecentlyViewedFromStorage = (): Product[] => {
  if (typeof window !== 'undefined') {
    const recentlyViewed = localStorage.getItem('recentlyViewed');
    return recentlyViewed ? JSON.parse(recentlyViewed) : [];
  }
  return [];
};

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  recentlyViewed: getRecentlyViewedFromStorage(),
  searchResults: [],
  currentProduct: null,
  relatedProducts: [],
  filters: {
    category: null,
    subcategory: null,
    minPrice: null,
    maxPrice: null,
    condition: null,
    rating: null,
    sortBy: 'newest',
    searchTerm: '',
  },
  pagination: {
    page: 1,
    limit: 12,
    totalPages: 0,
    totalProducts: 0,
  },
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setFeaturedProducts: (state, action: PayloadAction<Product[]>) => {
      state.featuredProducts = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Product[]>) => {
      state.searchResults = action.payload;
    },
    setCurrentProduct: (state, action: PayloadAction<Product>) => {
      state.currentProduct = action.payload;
      
      // Add to recently viewed
      const existingIndex = state.recentlyViewed.findIndex(
        (product) => product._id === action.payload._id
      );
      
      if (existingIndex !== -1) {
        // Remove from current position
        state.recentlyViewed.splice(existingIndex, 1);
      }
      
      // Add to the beginning of the array
      state.recentlyViewed.unshift(action.payload);
      
      // Limit to 10 items
      if (state.recentlyViewed.length > 10) {
        state.recentlyViewed = state.recentlyViewed.slice(0, 10);
      }
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'recentlyViewed',
          JSON.stringify(state.recentlyViewed)
        );
      }
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setRelatedProducts: (state, action: PayloadAction<Product[]>) => {
      state.relatedProducts = action.payload;
    },
    setFilter: (
      state,
      action: PayloadAction<{
        key: keyof ProductState['filters'];
        value: any;
      }>
    ) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {
        category: null,
        subcategory: null,
        minPrice: null,
        maxPrice: null,
        condition: null,
        rating: null,
        sortBy: 'newest',
        searchTerm: '',
      };
      
      // Reset pagination
      state.pagination.page = 1;
    },
    setPagination: (
      state,
      action: PayloadAction<{
        page?: number;
        limit?: number;
        totalPages?: number;
        totalProducts?: number;
      }>
    ) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setProducts,
  setFeaturedProducts,
  setSearchResults,
  setCurrentProduct,
  clearCurrentProduct,
  setRelatedProducts,
  setFilter,
  clearFilters,
  setPagination,
  setLoading,
  setError,
  clearError,
} = productSlice.actions;

export default productSlice.reducer; 