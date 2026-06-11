import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
    ?? 'https://osglpzaumxlgliselicp.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
    ?? 'sb_publishable_UmiaNbknZI8bQy28PiaNzg_tlaH8Sbk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
