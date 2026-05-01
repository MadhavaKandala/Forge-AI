import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    // Ping Supabase — this works even if you have no tables
    const { error } = await supabase.from('_test_ping').select('*').limit(1);

    // A "relation does not exist" error still means the connection is LIVE
    // Only a network/auth error means something is broken
    if (error && error.message.includes('fetch')) {
      console.error('❌ Supabase NOT connected:', error.message);
      return false;
    }

    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
    return false;
  }
}
