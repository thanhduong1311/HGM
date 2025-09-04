# Helper Functions

When using Supabase with Next.js and TypeScript, here are a few tips:

1. Generate Types:
   Run this command to generate Supabase types:

```bash
npx supabase gen types typescript --project-id [YOUR_PROJECT_ID] > types/supabase.ts
```

2. Supabase Client Setup:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  db: {
    schema: "public",
  },
});

export type DbClient = typeof supabase;
export type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type DbInsertProfile =
  Database["public"]["Tables"]["profiles"]["Insert"];
export type DbUpdateProfile =
  Database["public"]["Tables"]["profiles"]["Update"];
```

3. Usage Example:

```typescript
// Get strongly typed profile
const { data: profile } = await supabase.from("profiles").select().single();

// Type: DbProfile | null
console.log(profile);
```
