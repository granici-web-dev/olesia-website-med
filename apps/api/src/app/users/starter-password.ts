import { randomInt } from 'node:crypto';

/**
 * The alphabet drops the characters people misread when a password is dictated
 * over the phone or copied off a screen: no l/I/1, no O/0.
 */
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LENGTH = 12;

/**
 * A starter password for an account an admin creates or resets.
 *
 * `randomInt` rather than `Math.random`: this is a credential, and V8's PRNG
 * state is recoverable from a handful of its outputs. Same call the payments
 * module settled on for order ids.
 */
export function generateStarterPassword(): string {
  let out = '';
  for (let i = 0; i < LENGTH; i += 1) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}
