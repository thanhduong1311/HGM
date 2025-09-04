import { supabase } from "@/lib/supabase";

export interface Worker {
  id: string;
  name: string;
  phone: string | null;
  hourly_rate: number;
  created_at: string;
}

export interface CreateWorker {
  name: string;
  phone?: string;
  hourly_rate: number;
}

export interface LaborRecord {
  id: string;
  worker_id: string;
  work_date: string;
  hours_worked: number;
  hourly_rate: number;
  total_amount: number;
  note: string | null;
  payment_status: "chua_thanh_toan" | "da_thanh_toan";
  created_at: string;
  worker?: Worker;
}

export interface CreateLaborRecord {
  worker_id: string;
  work_date: string;
  hours_worked: number;
  hourly_rate: number;
  total_amount: number;
  note?: string;
}

export const workerService = {
  // Worker operations
  async listWorkers() {
    // Check authentication status
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xem danh sách người làm");
    }

    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .order("name");

    if (error) {
      console.error("List workers error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xem danh sách người làm");
      }
      throw error;
    }
    return data as Worker[];
  },

  async createWorker(worker: CreateWorker) {
    // Check authentication status first
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");
    }

    const { data, error } = await supabase
      .from("workers")
      .insert(worker)
      .select()
      .single();

    if (error) {
      console.error("Create worker error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền thêm người làm");
      }
      throw error;
    }
    return data as Worker;
  },

  async updateWorker(id: string, worker: Partial<CreateWorker>) {
    // Check authentication status
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để cập nhật thông tin người làm");
    }

    const { data, error } = await supabase
      .from("workers")
      .update(worker)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update worker error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền cập nhật thông tin người làm");
      }
      throw error;
    }
    return data as Worker;
  },

  async deleteWorker(id: string) {
    // Check authentication status
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xóa người làm");
    }

    const { error } = await supabase.from("workers").delete().eq("id", id);

    if (error) {
      console.error("Delete worker error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xóa người làm");
      }
      throw error;
    }
    return true;
  },

  // Labor records operations
  async listLaborRecords() {
    const { data, error } = await supabase
      .from("labor_records")
      .select(
        `
        *,
        worker:workers(*)
      `
      )
      .order("work_date", { ascending: false });

    if (error) throw error;
    return data as LaborRecord[];
  },

  async createLaborRecord(record: CreateLaborRecord) {
    const { data, error } = await supabase
      .from("labor_records")
      .insert({
        ...record,
        payment_status: "chua_thanh_toan",
      })
      .select()
      .single();

    if (error) throw error;
    return data as LaborRecord;
  },

  async updatePaymentStatus(
    id: string,
    status: "chua_thanh_toan" | "da_thanh_toan"
  ) {
    const { data, error } = await supabase
      .from("labor_records")
      .update({ payment_status: status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as LaborRecord;
  },
};
