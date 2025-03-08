import { api } from './apiSlice';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  institution: string;
  institutionEmail: string;
  isEmailVerified: boolean;
  isInstitutionVerified: boolean;
  isVerified: boolean;
  avatar: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationRejectionReason?: string;
  lastLogin?: string;
  preferences: {
    darkMode: boolean;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  institutionId: string;
  institutionEmail: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  data?: {
    user: User;
  };
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
}

export interface UpdateDetailsRequest {
  name?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleAuthRequest {
  idToken: string;
  institutionId: string;
}

export interface SellerVerificationRequest {
  studentIdUrl: string;
  selfieWithIdUrl: string;
  guardianLetterUrl?: string;
}

export interface UpdatePreferencesRequest {
  darkMode?: boolean;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  language?: string;
}

export interface FcmTokenRequest {
  fcmToken: string;
}

// Define a service using a base URL and expected endpoints
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.query<AuthResponse, void>({
      query: () => '/auth/logout',
      invalidatesTags: ['User'],
    }),
    getMe: builder.query<AuthResponse, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateDetails: builder.mutation<AuthResponse, UpdateDetailsRequest>({
      query: (userData) => ({
        url: '/auth/updatedetails',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    updatePassword: builder.mutation<AuthResponse, UpdatePasswordRequest>({
      query: (passwordData) => ({
        url: '/auth/updatepassword',
        method: 'PUT',
        body: passwordData,
      }),
    }),
    forgotPassword: builder.mutation<AuthResponse, ForgotPasswordRequest>({
      query: (emailData) => ({
        url: '/auth/forgotpassword',
        method: 'POST',
        body: emailData,
      }),
    }),
    resetPassword: builder.mutation<
      AuthResponse,
      { resetToken: string; passwordData: ResetPasswordRequest }
    >({
      query: ({ resetToken, passwordData }) => ({
        url: `/auth/resetpassword/${resetToken}`,
        method: 'PUT',
        body: passwordData,
      }),
    }),
    verifyEmail: builder.query<
      AuthResponse,
      { verificationToken: string }
    >({
      query: ({ verificationToken }) =>
        `/auth/verifyemail/${verificationToken}`,
    }),
    googleAuth: builder.mutation<AuthResponse, GoogleAuthRequest>({
      query: (googleData) => ({
        url: '/auth/google',
        method: 'POST',
        body: googleData,
      }),
      invalidatesTags: ['User'],
    }),
    applyForSellerVerification: builder.mutation<
      AuthResponse,
      SellerVerificationRequest
    >({
      query: (verificationData) => ({
        url: '/auth/apply-seller',
        method: 'POST',
        body: verificationData,
      }),
      invalidatesTags: ['User', 'Seller'],
    }),
    updatePreferences: builder.mutation<
      AuthResponse,
      UpdatePreferencesRequest
    >({
      query: (preferencesData) => ({
        url: '/auth/preferences',
        method: 'PUT',
        body: preferencesData,
      }),
      invalidatesTags: ['User'],
    }),
    updateFcmToken: builder.mutation<AuthResponse, FcmTokenRequest>({
      query: (fcmData) => ({
        url: '/auth/fcm-token',
        method: 'PUT',
        body: fcmData,
      }),
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutQuery,
  useGetMeQuery,
  useUpdateDetailsMutation,
  useUpdatePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailQuery,
  useGoogleAuthMutation,
  useApplyForSellerVerificationMutation,
  useUpdatePreferencesMutation,
  useUpdateFcmTokenMutation,
} = authApi; 