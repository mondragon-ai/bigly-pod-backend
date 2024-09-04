import * as crypto from "crypto";

/**
 * Generates a random ID with the specified prefix.
 *
 * @param {string} prefix - The prefix to prepend to the random ID.
 * @returns {string} - The generated random ID.
 */
export const generateRandomID = (prefix: string): string => {
  return "" + prefix + crypto.randomBytes(10).toString("hex");
};

/**
 * Generates a random ID with the specified prefix.
 *
 * @param {string} prefix - The prefix to prepend to the random ID.
 * @returns {string} - The generated random ID.
 */
export const generateRandomOrderNumber = (prefix: string): string => {
  return "" + prefix + crypto.randomBytes(3).toString("hex");
};

/**
 * Generates a random 13-digit number.
 *
 * @returns {string} A random 13-digit number as a string.
 */
export const generateRandom13DigitNumber = (): string => {
  const min = Math.pow(10, 12); // 10^12, smallest 13-digit number
  const max = Math.pow(10, 13) - 1; // 10^13 - 1, largest 13-digit number
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
};
