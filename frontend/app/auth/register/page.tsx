'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRegisterMutation } from '@/store/api/authApi';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  institutionId: string;
  institutionEmail: string;
  phone?: string;
  agreeTerms: boolean;
}

// Mock institution data (in a real app, this would come from an API)
const institutions = [
  { id: '1', name: 'University of Example' },
  { id: '2', name: 'Example State College' },
  { id: '3', name: 'Example Technical Institute' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      institutionId: '',
      institutionEmail: '',
      phone: '',
      agreeTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        institutionId: data.institutionId,
        institutionEmail: data.institutionEmail,
        phone: data.phone,
      }).unwrap();

      if (response.success) {
        toast.success('Registration successful! Please verify your email.');
        router.push('/auth/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.data?.message || 'Registration failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-darkBg-secondary p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <Image
              src="/images/logo.svg"
              alt="CampusCart"
              width={64}
              height={64}
              className="h-16 w-16"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.name
                    ? 'border-error'
                    : 'border-gray-300 dark:border-darkBg-tertiary'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-darkBg-tertiary dark:text-white`}
                placeholder="John Doe"
                {...registerField('name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.email
                    ? 'border-error'
                    : 'border-gray-300 dark:border-darkBg-tertiary'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-darkBg-tertiary dark:text-white`}
                placeholder="john.doe@example.com"
                {...registerField('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Institution */}
            <div>
              <label
                htmlFor="institutionId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Institution
              </label>
              <select
                id="institutionId"
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                  errors.institutionId
                    ? 'border-error'
                    : 'border-gray-300 dark:border-darkBg-tertiary'
                } focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-darkBg-tertiary dark:text-white`}
                {...registerField('institutionId', {
                  required: 'Institution is required',
                })}
              >
                <option value="">Select your institution</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
              {errors.institutionId && (
                <p className="mt-1 text-sm text-error">
                  {errors.institutionId.message}
                </p>
              )}
            </div>

            {/* Institution Email */}
            <div>
              <label
                htmlFor="institutionEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Institution Email
              </label>
              <input
                id="institutionEmail"
                type="email"
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.institutionEmail
                    ? 'border-error'
                    : 'border-gray-300 dark:border-darkBg-tertiary'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-darkBg-tertiary dark:text-white`}
                placeholder="john.doe@university.edu"
                {...registerField('institutionEmail', {
                  required: 'Institution email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.institutionEmail && (
                <p className="mt-1 text-sm text-error">
                  {errors.institutionEmail.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This must be your official institution email for verification.
              </p>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.phone
                    ? 'border-error'
                    : 'border-gray-300 dark:border-darkBg-tertiary'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-darkBg-tertiary dark:text-white`}
                placeholder="+1 (123) 456-7890"
                {...registerField('phone', {
                  pattern: {
                    value: /^(\+\d{1,3}[- ]?)?\d{10}$/,
                    message: 'Invalid phone number format',
                  },
                })}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-error">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.password
                    ? 'border-error'
                    : 'border-gray-300 dark:border-darkBg-tertiary'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-darkBg-tertiary dark:text-white`}
                placeholder="••••••••"
                {...registerField('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                  errors.confirmPassword
                    ? 'border-error'
                    : 'border-gray-300 dark:border-darkBg-tertiary'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-darkBg-tertiary dark:text-white`}
                placeholder="••••••••"
                {...registerField('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  className={`focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded ${
                    errors.agreeTerms ? 'border-error' : ''
                  }`}
                  {...registerField('agreeTerms', {
                    required: 'You must agree to the terms and conditions',
                  })}
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="agreeTerms"
                  className="font-medium text-gray-700 dark:text-gray-300"
                >
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-primary hover:text-primary-dark"
                  >
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-primary hover:text-primary-dark"
                  >
                    Privacy Policy
                  </Link>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-1 text-sm text-error">
                    {errors.agreeTerms.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-primary-dark group-hover:text-primary-light"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 