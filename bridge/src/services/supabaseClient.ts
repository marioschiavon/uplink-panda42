import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kfsvpbujmetlendgwnrs.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3ZwYnVqbWV0bGVuZGd3bnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDI2NzQsImV4cCI6MjA3NTY3ODY3NH0.t-LDj6XLnI5HqFlPhs9mGoA4DfIDE0e8wnxzmRoCjIk';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

logger.info('Supabase client initialized');
