import { Database } from "@/types/database.types";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize the Supabase client with Database types
export type Tables = Database["public"]["Tables"];
export type ProfileInsert = Tables["profiles"]["Insert"];

export const supabase = createPagesBrowserClient<Database>();

// Dev helper để log lỗi
export const logError = (error: any) => {
  if (process.env.NODE_ENV === "development") {
    console.error("Supabase Error:", error);
  }
};
