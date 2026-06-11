import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
    ?? 'https://osglpzaumxlgliselicp.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
    ?? 'sb_publishable_UmiaNbknZI8bQy28PiaNzg_tlaH8Sbk';
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

export const SUPABASE_AUTH_STORAGE_KEY = `sb-${projectRef}-auth-token`;

export const clearSupabaseAuthStorage = () => {
    if (typeof window === 'undefined') return;

    const authKeys = [
        SUPABASE_AUTH_STORAGE_KEY,
        `${SUPABASE_AUTH_STORAGE_KEY}-code-verifier`,
        `${SUPABASE_AUTH_STORAGE_KEY}-user`,
    ];

    for (const key of authKeys) {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
    }

    for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
            window.localStorage.removeItem(key);
        }
    }

    for (const key of Object.keys(window.sessionStorage)) {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
            window.sessionStorage.removeItem(key);
        }
    }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: SUPABASE_AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    },
});
