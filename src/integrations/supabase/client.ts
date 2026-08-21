import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Public (publishable) values — safe in the browser, protected by row level security.
// Env vars win when present (Lovable / local .env); the fallbacks keep external
// deploys like Vercel working even if env vars aren't configured there yet.
const FALLBACK_URL = 'https://ocbgpwocxcuylfhcdjot.supabase.co';
const FALLBACK_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jYmdwd29jeGN1eWxmaGNkam90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzgyNzYsImV4cCI6MjA4NTgxNDI3Nn0.fHhNJBg_UbZxCFltUkFeCv5HyWEIswCNR_zH80E1Vo0';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;


export const supabase = createClient<Database>(
  SUPABASE_URL || '', 
  SUPABASE_PUBLISHABLE_KEY || '', 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);