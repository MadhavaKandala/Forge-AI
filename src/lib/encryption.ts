import CryptoJS from 'crypto-js';

// SECURE: Use environment variable instead of hardcoded secret.
// Fallback to the old hardcoded key *only* as a legacy migration path to prevent breaking existing backups.
// New installations MUST set VITE_ENCRYPTION_KEY.
const getSecretKey = () => {
    return import.meta.env.VITE_ENCRYPTION_KEY || 'HABIT_TRACKER_SECURE_BACKUP_KEY';
};

export const encryptData = (data: string): string => {
    return CryptoJS.AES.encrypt(data, getSecretKey()).toString();
};

export const decryptData = (ciphertext: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, getSecretKey());
    return bytes.toString(CryptoJS.enc.Utf8);
};
