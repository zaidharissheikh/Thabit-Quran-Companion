import { hash, verify, Algorithm } from '@node-rs/argon2';
import { AppError } from './errors.js';

const ARGON2_OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

/**
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  return hash(password, ARGON2_OPTIONS);
}

/**
 * @param {string} storedHash
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(storedHash, password) {
  try {
    return await verify(storedHash, password);
  } catch {
    return false;
  }
}

/**
 * @param {string} storedHash
 * @param {string} password
 */
export async function assertPassword(storedHash, password) {
  const ok = await verifyPassword(storedHash, password);
  if (!ok) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
}
