import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

export type InventoryCategory =
  Database["public"]["Tables"]["inventory_categories"]["Row"];
export type InsertInventoryCategory =
  Database["public"]["Tables"]["inventory_categories"]["Insert"];
export type UpdateInventoryCategory =
  Database["public"]["Tables"]["inventory_categories"]["Update"];

export type InventoryItem =
  Database["public"]["Tables"]["inventory_items"]["Row"];
export type InsertInventoryItem =
  Database["public"]["Tables"]["inventory_items"]["Insert"];
export type UpdateInventoryItem =
  Database["public"]["Tables"]["inventory_items"]["Update"];

export type InventoryTransaction =
  Database["public"]["Tables"]["inventory_transactions"]["Row"];
export type InsertInventoryTransaction =
  Database["public"]["Tables"]["inventory_transactions"]["Insert"];
export type UpdateInventoryTransaction =
  Database["public"]["Tables"]["inventory_transactions"]["Update"];

export const inventoryService = {
  // Category operations
  async listCategories() {
    const { data, error } = await supabase
      .from("inventory_categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  async createCategory(category: InsertInventoryCategory) {
    const { data, error } = await supabase
      .from("inventory_categories")
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Item operations
  async listItems() {
    const { data, error } = await supabase
      .from("inventory_items")
      .select(
        `
        *,
        category:inventory_categories(*)
      `
      )
      .order("name");

    if (error) throw error;
    return data;
  },

  async createItem(item: InsertInventoryItem) {
    const { data, error } = await supabase
      .from("inventory_items")
      .insert({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(id: string, item: UpdateInventoryItem) {
    const { data, error } = await supabase
      .from("inventory_items")
      .update({
        ...item,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  // Transaction operations
  async listTransactions(itemId?: string) {
    let query = supabase
      .from("inventory_transactions")
      .select(
        `
        *,
        item:inventory_items(*)
      `
      )
      .order("date", { ascending: false });

    if (itemId) {
      query = query.eq("item_id", itemId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: InsertInventoryTransaction) {
    // Get current item quantity
    const { data: item, error: itemError } = await supabase
      .from("inventory_items")
      .select("current_quantity")
      .eq("id", transaction.item_id)
      .single();

    if (itemError) throw itemError;

    // Calculate new quantity
    const currentQty = item?.current_quantity || 0;
    const newQty =
      transaction.type === "nhap"
        ? currentQty + transaction.quantity
        : currentQty - transaction.quantity;

    // Check if quantity would go negative
    if (newQty < 0) {
      throw new Error("Số lượng xuất vượt quá số lượng tồn kho");
    }

    // Create transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from("inventory_transactions")
      .insert({
        ...transaction,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Update item quantity
    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({
        current_quantity: newQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.item_id);

    if (updateError) throw updateError;

    return transactionData;
  },
};
