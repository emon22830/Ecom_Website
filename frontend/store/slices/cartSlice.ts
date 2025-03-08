import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image: string;
  seller: string;
  institution: string;
  customizations?: {
    name: string;
    option: string;
    priceModifier: number;
  }[];
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  appliedCoupon: {
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
  } | null;
  isLoading: boolean;
  error: string | null;
}

// Get cart from localStorage
const getCartFromStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }
  return [];
};

// Get coupon from localStorage
const getCouponFromStorage = () => {
  if (typeof window !== 'undefined') {
    const coupon = localStorage.getItem('coupon');
    return coupon ? JSON.parse(coupon) : null;
  }
  return null;
};

// Calculate total items and price
const calculateTotals = (
  items: CartItem[],
  appliedCoupon: CartState['appliedCoupon']
) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  let totalPrice = items.reduce((total, item) => {
    // Base price (use discount price if available)
    const basePrice = item.discountPrice || item.price;
    let itemTotal = basePrice * item.quantity;
    
    // Add customization price modifiers
    if (item.customizations && item.customizations.length > 0) {
      const customizationTotal = item.customizations.reduce(
        (sum, customization) => sum + (customization.priceModifier || 0),
        0
      );
      itemTotal += customizationTotal * item.quantity;
    }
    
    return total + itemTotal;
  }, 0);
  
  // Apply coupon if exists
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      const discountAmount = (totalPrice * appliedCoupon.discount) / 100;
      totalPrice -= discountAmount;
    } else if (appliedCoupon.discountType === 'fixed') {
      totalPrice = Math.max(0, totalPrice - appliedCoupon.discount);
    }
  }
  
  return { totalItems, totalPrice };
};

const initialState: CartState = {
  items: getCartFromStorage(),
  totalItems: 0,
  totalPrice: 0,
  appliedCoupon: getCouponFromStorage(),
  isLoading: false,
  error: null,
};

// Calculate initial totals
const initialTotals = calculateTotals(
  initialState.items,
  initialState.appliedCoupon
);
initialState.totalItems = initialTotals.totalItems;
initialState.totalPrice = initialTotals.totalPrice;

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item._id === newItem._id
      );
      
      if (existingItemIndex !== -1) {
        // Update existing item
        state.items[existingItemIndex].quantity += newItem.quantity;
        
        // Update customizations if provided
        if (newItem.customizations && newItem.customizations.length > 0) {
          state.items[existingItemIndex].customizations = newItem.customizations;
        }
      } else {
        // Add new item
        state.items.push(newItem);
      }
      
      // Recalculate totals
      const { totalItems, totalPrice } = calculateTotals(
        state.items,
        state.appliedCoupon
      );
      state.totalItems = totalItems;
      state.totalPrice = totalPrice;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      
      // Recalculate totals
      const { totalItems, totalPrice } = calculateTotals(
        state.items,
        state.appliedCoupon
      );
      state.totalItems = totalItems;
      state.totalPrice = totalPrice;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item._id === id);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter((item) => item._id !== id);
        } else {
          // Update quantity
          state.items[itemIndex].quantity = quantity;
        }
        
        // Recalculate totals
        const { totalItems, totalPrice } = calculateTotals(
          state.items,
          state.appliedCoupon
        );
        state.totalItems = totalItems;
        state.totalPrice = totalPrice;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify(state.items));
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.appliedCoupon = null;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
        localStorage.removeItem('coupon');
      }
    },
    applyCoupon: (
      state,
      action: PayloadAction<{
        code: string;
        discount: number;
        discountType: 'percentage' | 'fixed';
      }>
    ) => {
      state.appliedCoupon = action.payload;
      
      // Recalculate totals
      const { totalPrice } = calculateTotals(state.items, state.appliedCoupon);
      state.totalPrice = totalPrice;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('coupon', JSON.stringify(action.payload));
      }
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      
      // Recalculate totals
      const { totalPrice } = calculateTotals(state.items, null);
      state.totalPrice = totalPrice;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('coupon');
      }
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
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  setLoading,
  setError,
  clearError,
} = cartSlice.actions;

export default cartSlice.reducer; 