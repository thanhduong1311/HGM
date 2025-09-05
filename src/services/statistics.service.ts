import { supabase } from "@/lib/supabase";
import { handleSupabaseError } from "@/lib/error";
import dayjs from "dayjs";

interface DailyStats {
  date: string;
  revenue: number;
  shipping_expenses: number;
  inventory_expenses: number;
  labor_expenses: number;
  labor_hours: number;
  profit: number;
}

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
      // Get summary from statistics view
      const { data: statsData, error: statsError } = await supabase
        .from("statistics_view")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate);

      if (statsError) throw handleSupabaseError(statsError);

      // Calculate totals from the view data
      const totals = (statsData as DailyStats[]).reduce(
        (acc, day) => ({
          revenue: acc.revenue + day.revenue,
          expenses:
            acc.expenses +
            day.shipping_expenses +
            day.inventory_expenses +
            day.labor_expenses,
          laborHours: acc.laborHours + day.labor_hours,
        }),
        { revenue: 0, expenses: 0, laborHours: 0 }
      );

      // Get order count for the period
      const { count: orderCount, error: orderCountError } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "hoan_thanh")
        .gte("order_date", startDate)
        .lte("order_date", endDate);

      if (orderCountError) throw handleSupabaseError(orderCountError);

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
          garden:gardens (
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
        garden_name: activity.garden[0]?.name || "",
      }));

      return {
        revenue: totals.revenue,
        expenses: totals.expenses,
        profit: totals.revenue - totals.expenses,
        orderCount: orderCount || 0,
        gardenCount,
        bedCount,
        laborHours: totals.laborHours,
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
