import CryptoJS from 'crypto-js';

const LEGACY_KEY = 'HABIT_TRACKER_SECURE_BACKUP_KEY';
const KEY_STORAGE_KEY = 'habit-tracker-encryption-key';

// Generate or retrieve a device-specific encryption key
const getSecretKey = (): string => {
    // In a browser environment, generate a random key on first use
    // to remove the hardcoded secret from the application bundle.
    let key = localStorage.getItem(KEY_STORAGE_KEY);
    if (!key) {
        key = CryptoJS.lib.WordArray.random(32).toString();
        localStorage.setItem(KEY_STORAGE_KEY, key);
    }
    return key;
};

export const encryptData = (data: string): string => {
    return CryptoJS.AES.encrypt(data, getSecretKey()).toString();
};

export const decryptData = (ciphertext: string): string => {
    const currentKey = getSecretKey();

    // 1. Attempt decryption with the current device-specific key
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, currentKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
            return decrypted;
        }
    } catch (e) {
        // Continue to fallback
    }

    // 2. Fallback path for existing backups encrypted with the legacy hardcoded key
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, LEGACY_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
            return decrypted;
        }
    } catch (e) {
        // Decryption failed entirely
    }

    throw new Error('Failed to decrypt data: invalid key or corrupted data.');
};
