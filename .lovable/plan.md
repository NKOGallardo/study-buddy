

## Plan: Fix Supabase Client Configuration

### Problem
The current `src/integrations/supabase/client.ts` references `import.meta.env.PROJECT_URL` and `import.meta.env.PROJECT_ANON_KEY`, but Vite requires the `VITE_` prefix for environment variables to be available in frontend code. The `.env` file already has the correct variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

The secrets you added (PROJECT_URL, PROJECT_ANON_KEY) are **runtime secrets** — available to backend/edge functions only, not to the frontend at build time.

### What I'll Do

**Update `src/integrations/supabase/client.ts`** to use the correct environment variables:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

This is a one-line fix — the `.env` file already has the right values pointing to your Lovable Cloud backend. If you want to point to a **different** Supabase project, you'd need to update the `.env` values (which are managed automatically by Lovable Cloud and cannot be edited manually).

### Important Note
Since this project uses Lovable Cloud, the `.env` is auto-managed. The runtime secrets (PROJECT_URL, PROJECT_ANON_KEY) will still be useful for any edge functions that need them.

