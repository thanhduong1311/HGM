import { supabase } from "@/lib/supabase";
import { handleSupabaseError } from "@/lib/error";
import dayjs from "dayjs";

interface StatisticsSummary {
  revenue: number;
  expenses: number;
  profit: number;
  orderCount: number;
  gardenCount: number;
  bedCount: number;
  laborHours: number;
  customerCount: number;
  workerCount: number;
  cropTypeCount: number;
  lastCareActivities: Array<{
    id: string;
    activity_type: string;
    activity_date: string;
    garden_name: string;
  }>;
}

export const statisticsService = {
  async getSummary(
    startDate: string,
    endDate: string
  ): Promise<StatisticsSummary> {
    try {
      // Get orders summary
      const { data: orderStats, error: orderError } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("order_date", startDate)
        .lte("order_date", endDate);

      if (orderError) throw handleSupabaseError(orderError);

      const revenue = orderStats.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );
      const orderCount = orderStats.length;

      // Get expenses (inventory transactions + labor)
      const { data: inventoryExpenses, error: inventoryError } = await supabase
        .from("inventory_transactions")
        .select("total")
        .eq("type", "nhap")
        .gte("date", startDate)
        .lte("date", endDate);

      if (inventoryError) throw handleSupabaseError(inventoryError);

      const { data: laborExpenses, error: laborError } = await supabase
        .from("labor_records")
        .select("total_amount, hours_worked")
        .gte("work_date", startDate)
        .lte("work_date", endDate);

      if (laborError) throw handleSupabaseError(laborError);

      const totalInventoryExpenses = inventoryExpenses.reduce(
        (sum, tx) => sum + (tx.total || 0),
        0
      );
      const totalLaborExpenses = laborExpenses.reduce(
        (sum, record) => sum + (record.total_amount || 0),
        0
      );
      const totalLaborHours = laborExpenses.reduce(
        (sum, record) => sum + (record.hours_worked || 0),
        0
      );

      const expenses = totalInventoryExpenses + totalLaborExpenses;

      // Get garden and bed count, customers, workers, and crop types
      const [
        { data: gardens, error: gardenError },
        { count: customerCount, error: customerError },
        { count: workerCount, error: workerError },
        { count: cropTypeCount, error: cropTypeError },
      ] = await Promise.all([
        supabase.from("gardens").select("id, number_of_beds"),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("workers").select("id", { count: "exact", head: true }),
        supabase
          .from("crop_types")
          .select("id", { count: "exact", head: true }),
      ]);

      if (gardenError) throw handleSupabaseError(gardenError);
      if (customerError) throw handleSupabaseError(customerError);
      if (workerError) throw handleSupabaseError(workerError);
      if (cropTypeError) throw handleSupabaseError(cropTypeError);

      const gardenCount = gardens.length;
      const bedCount = gardens.reduce(
        (sum, garden) => sum + (garden.number_of_beds || 0),
        0
      );

      // Get recent care activities
      const { data: careActivities, error: careError } = await supabase
        .from("care_activities")
        .select(
          `
          id,
          activity_type,
          activity_date,
          gardens!inner (
            name
          )
        `
        )
        .order("activity_date", { ascending: false })
        .limit(5);

      if (careError) throw handleSupabaseError(careError);

      const lastCareActivities = careActivities.map((activity) => ({
        id: activity.id,
        activity_type: activity.activity_type,
        activity_date: activity.activity_date,
        garden_name: activity.gardens[0]?.name || "",
      }));

      return {
        revenue,
        expenses,
        profit: revenue - expenses,
        orderCount,
        gardenCount,
        bedCount,
        laborHours: totalLaborHours,
        customerCount: customerCount || 0,
        workerCount: workerCount || 0,
        cropTypeCount: cropTypeCount || 0,
        lastCareActivities,
      };
    } catch (error) {
      throw error;
    }
  },
};
