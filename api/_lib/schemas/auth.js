import { z } from 'zod';
import {
  STRONG_PASSWORD_MESSAGE,
  isAtLeastAge,
  isPasswordStrong,
} from '../passwordPolicy.js';

const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(254)
  .transform((v) => v.toLowerCase());

const strongPasswordField = z
  .string()
  .min(1, 'Password is required')
  .refine(isPasswordStrong, { message: STRONG_PASSWORD_MESSAGE });

const nameField = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(80, 'Name must be under 80 characters');

const dateOfBirthField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date of birth')
  .refine((v) => isAtLeastAge(v, 11), {
    message: 'You must be at least 11 years old',
  });

export const registerSchema = z.object({
  email: emailField,
  password: strongPasswordField,
  name: nameField,
  dateOfBirth: dateOfBirthField,
});

/** Login: valid email + non-empty password (strength enforced at signup). */
export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: strongPasswordField,
});
