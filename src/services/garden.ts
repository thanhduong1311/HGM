import { supabase } from "./supabase";
import { Garden } from "@/types/models";

export const gardenService = {
  async getGardens() {
    const { data, error } = await supabase
      .from("gardens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Garden[];
  },

  async getGarden(id: string) {
    const { data, error } = await supabase
      .from("gardens")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Garden;
  },

  async createGarden(garden: Omit<Garden, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("gardens")
      .insert(garden)
      .select()
      .single();

    if (error) throw error;
    return data as Garden;
  },

  async updateGarden(id: string, garden: Partial<Garden>) {
    const { data, error } = await supabase
      .from("gardens")
      .update(garden)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Garden;
  },

  async deleteGarden(id: string) {
    const { error } = await supabase.from("gardens").delete().eq("id", id);

    if (error) throw error;
  },
};
