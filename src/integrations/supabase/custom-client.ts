import { createClient } from '@supabase/supabase-js';

// Custom Supabase configuration - Uses external Supabase project
const CUSTOM_SUPABASE_URL = 'https://kfsvpbujmetlendgwnrs.supabase.co';
const CUSTOM_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3ZwYnVqbWV0bGVuZGd3bnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDI2NzQsImV4cCI6MjA3NTY3ODY3NH0.t-LDj6XLnI5HqFlPhs9mGoA4DfIDE0e8wnxzmRoCjIk';

// Create and export the custom Supabase client
export const supabase = createClient(CUSTOM_SUPABASE_URL, CUSTOM_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
