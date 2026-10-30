import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, 'Please enter your full name'),
    email: z
      .string()
      .trim()
      .min(1, 'Please enter your email address')
      .email('Please enter a valid email address'),
    phone: z
      .preprocess((val) => val ?? '', z.string().min(1, 'Please enter your mobile phone number'))
      .refine((val) => Boolean(val && isValidPhoneNumber(val)), {
        message: 'Please enter a valid phone number for the selected country',
      }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address')
    .email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Please enter the complete 6-digit code')
    .regex(/^\d{6}$/, 'Code must contain numbers only'),
});
