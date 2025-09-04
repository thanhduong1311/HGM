import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

export type Garden = Database["public"]["Tables"]["gardens"]["Row"];
export type InsertGarden = Database["public"]["Tables"]["gardens"]["Insert"];
export type UpdateGarden = Database["public"]["Tables"]["gardens"]["Update"];

export const gardenService = {
  async list() {
    const { data, error } = await supabase
      .from("gardens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(garden: InsertGarden) {
    const { data, error } = await supabase
      .from("gardens")
      .insert(garden)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, garden: UpdateGarden) {
    const { data, error } = await supabase
      .from("gardens")
      .update(garden)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("gardens").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};
