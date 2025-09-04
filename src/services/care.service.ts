import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { handleSupabaseError, ApiError } from "@/lib/error";

export type CareActivity =
  Database["public"]["Tables"]["care_activities"]["Row"] & {
    garden?: Garden;
    details?: CareActivityDetail[];
  };

export type CareActivityDetail =
  Database["public"]["Tables"]["care_activity_details"]["Row"] & {
    inventory_item?: {
      name: string;
      unit: string;
    };
  };

export type Garden = Database["public"]["Tables"]["gardens"]["Row"];

export type InsertCareActivity =
  Database["public"]["Tables"]["care_activities"]["Insert"];

export type InsertCareActivityDetail =
  Database["public"]["Tables"]["care_activity_details"]["Insert"];

export const careService = {
  async listActivities() {
    const { data, error } = await supabase
      .from("care_activities")
      .select(
        `
        *,
        garden:gardens(*),
        details:care_activity_details(
          *,
          inventory_item:inventory_items(name, unit)
        )
      `
      )
      .order("activity_date", { ascending: false });

    if (error) throw handleSupabaseError(error);
    return data as CareActivity[];
  },

  async createActivity(
    activity: Omit<InsertCareActivity, "created_at">,
    details: Omit<InsertCareActivityDetail, "care_activity_id">[]
  ) {
    // Start transaction
    const { data: newActivity, error: activityError } = await supabase
      .from("care_activities")
      .insert({
        ...activity,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (activityError) throw handleSupabaseError(activityError);

    // Add details and process inventory transactions
    try {
      // Insert details
      const { error: detailsError } = await supabase
        .from("care_activity_details")
        .insert(
          details.map((detail) => ({
            ...detail,
            care_activity_id: newActivity.id,
            created_at: new Date().toISOString(),
          }))
        );

      if (detailsError) {
        // Delete activity if details insertion fails
        await supabase
          .from("care_activities")
          .delete()
          .eq("id", newActivity.id);
        throw handleSupabaseError(detailsError);
      }

      // Create inventory transactions
      const { error: inventoryError } = await supabase.rpc(
        "process_care_activity",
        {
          p_activity_id: newActivity.id,
        }
      );

      if (inventoryError) {
        // Delete both activity and details if inventory processing fails
        await supabase
          .from("care_activity_details")
          .delete()
          .eq("care_activity_id", newActivity.id);
        await supabase
          .from("care_activities")
          .delete()
          .eq("id", newActivity.id);
        throw handleSupabaseError(inventoryError);
      }

      return newActivity;
    } catch (error) {
      // If anything else fails, ensure complete rollback
      await supabase
        .from("care_activity_details")
        .delete()
        .eq("care_activity_id", newActivity.id);
      await supabase.from("care_activities").delete().eq("id", newActivity.id);
      throw error instanceof ApiError ? error : handleSupabaseError(error);
    }
  },

  async deleteActivity(id: string) {
    // Delete details first due to foreign key constraint
    const { error: detailsError } = await supabase
      .from("care_activity_details")
      .delete()
      .eq("care_activity_id", id);

    if (detailsError) throw handleSupabaseError(detailsError);

    // Then delete the main activity
    const { error: activityError } = await supabase
      .from("care_activities")
      .delete()
      .eq("id", id);

    if (activityError) throw handleSupabaseError(activityError);
    return true;
  },

  async listGardens() {
    const { data, error } = await supabase
      .from("gardens")
      .select("*")
      .order("name");

    if (error) throw handleSupabaseError(error);
    return data as Garden[];
  },
};
