import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  notifications: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
  loading: {
    global: boolean;
    auth: boolean;
    products: boolean;
    cart: boolean;
    checkout: boolean;
    orders: boolean;
    profile: boolean;
  };
  modal: {
    show: boolean;
    type: string;
    data: any;
  };
}

// Get theme from localStorage
const getThemeFromStorage = (): 'light' | 'dark' | 'system' => {
  if (typeof window !== 'undefined') {
    const theme = localStorage.getItem('theme');
    return (theme as 'light' | 'dark' | 'system') || 'system';
  }
  return 'system';
};

const initialState: UIState = {
  theme: getThemeFromStorage(),
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  cartOpen: false,
  notifications: {
    show: false,
    message: '',
    type: 'info',
  },
  loading: {
    global: false,
    auth: false,
    products: false,
    cart: false,
    checkout: false,
    orders: false,
    profile: false,
  },
  modal: {
    show: false,
    type: '',
    data: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.cartOpen = action.payload;
    },
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
      }>
    ) => {
      state.notifications = {
        show: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideNotification: (state) => {
      state.notifications.show = false;
    },
    setLoading: (
      state,
      action: PayloadAction<{
        key: keyof UIState['loading'];
        value: boolean;
      }>
    ) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    showModal: (
      state,
      action: PayloadAction<{
        type: string;
        data?: any;
      }>
    ) => {
      state.modal = {
        show: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    hideModal: (state) => {
      state.modal.show = false;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSearch,
  setSearchOpen,
  toggleCart,
  setCartOpen,
  showNotification,
  hideNotification,
  setLoading,
  setGlobalLoading,
  showModal,
  hideModal,
} = uiSlice.actions;

export default uiSlice.reducer; 