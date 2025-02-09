import CryptoJS from 'crypto-js';

// The secret key should be stored in environment variables in production
const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || 'your-secret-key-here';

/**
 * Encrypts a text string or number using AES encryption
 * @param text - The text or number to encrypt
 * @returns The encrypted text as a string
 */
export const encryptText = (text: string | number): string => {
  try {
    // Convert to string if number
    const textToEncrypt = text.toString();
    
    // Encrypt the text
    const encrypted = CryptoJS.AES.encrypt(textToEncrypt, SECRET_KEY);
    
    // Convert to URL-safe base64
    return encrypted.toString()
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt text');
  }
};

/**
 * Decrypts an encrypted text string
 * @param encryptedText - The encrypted text to decrypt
 * @returns The decrypted text as a string
 */
export const decryptText = (encryptedText: string): string => {
  try {
    if (!encryptedText) {
      console.warn('No text provided for decryption');
      return encryptedText;
    }

    // Convert from URL-safe base64 back to standard base64
    const normalizedText = encryptedText
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add back padding if needed
    const paddedText = normalizedText.padEnd(
      normalizedText.length + (4 - (normalizedText.length % 4)) % 4,
      '='
    );

    // Attempt to decrypt
    try {
      const bytes = CryptoJS.AES.decrypt(paddedText, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        console.warn('Decryption resulted in empty string');
        return encryptedText;
      }

      return decrypted;
    } catch (decryptError) {
      console.warn('Failed to decrypt:', decryptError);
      return encryptedText;
    }
  } catch (error) {
    console.warn('Decryption error:', error);
    return encryptedText;
  }
};

/**
 * Encrypts a number using AES encryption
 * @param number - The number to encrypt
 * @returns The encrypted text as a string
 */
export function encryptNumber(number: number): string {
    try {
        const ciphertext = CryptoJS.AES.encrypt(number.toString(), SECRET_KEY).toString();
        // Convert to URL-safe base64
        return ciphertext
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    } catch (error) {
        console.error('Encryption error:', error);
        return number.toString();
    }
}

/**
 * Decrypts an encrypted number
 * @param ciphertext - The encrypted text to decrypt
 * @returns The decrypted number or the original number if decryption fails
 */
export function decryptNumber(ciphertext: string): number {
    try {
        // Convert from URL-safe base64 back to standard base64
        const normalizedText = ciphertext
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        // Add back padding if needed
        const paddedText = normalizedText.padEnd(
            normalizedText.length + (4 - (normalizedText.length % 4)) % 4,
            '='
        );

        const bytes = CryptoJS.AES.decrypt(paddedText, SECRET_KEY);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedText) {
            // If decryption fails, try parsing the original string
            const originalNumber = parseFloat(ciphertext);
            return isNaN(originalNumber) ? 0 : originalNumber;
        }

        const decryptedNumber = parseFloat(decryptedText);
        return isNaN(decryptedNumber) ? 0 : decryptedNumber;
    } catch (error) {
        console.error('Decryption error:', error);
        // If decryption fails, try parsing the original string
        const originalNumber = parseFloat(ciphertext);
        return isNaN(originalNumber) ? 0 : originalNumber;
    }
}

/**
 * Encrypts an object by converting it to JSON and encrypting the resulting string
 * @param data - The object to encrypt
 * @returns The encrypted data as a string
 */
export const encryptObject = <T extends object>(data: T): string => {
  try {
    const jsonString = JSON.stringify(data);
    return encryptText(jsonString);
  } catch (error) {
    console.error('Object encryption error:', error);
    throw new Error('Failed to encrypt object');
  }
};

/**
 * Decrypts an encrypted string and parses it as JSON
 * @param encryptedData - The encrypted data to decrypt
 * @returns The decrypted object
 */
export const decryptObject = <T extends object>(encryptedData: string): T => {
  try {
    const decryptedString = decryptText(encryptedData);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Object decryption error:', error);
    throw new Error('Failed to decrypt object');
  }
};

/**
 * Generates a hash of the input text using SHA256
 * @param text - The text to hash
 * @returns The hashed text
 */
export const hashText = (text: string): string => {
  try {
    return CryptoJS.SHA256(text).toString();
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash text');
  }
};

/**
 * Validates if a string is a valid encrypted text
 * @param text - The text to validate
 * @returns boolean indicating if the text is valid encrypted data
 */
export const isValidEncryptedText = (text: string): boolean => {
  try {
    const decrypted = decryptText(text);
    return decrypted.length > 0 && decrypted !== text;
  } catch {
    return false;
  }
}; 