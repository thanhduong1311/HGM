import { supabase } from "@/lib/supabase";

export interface CropType {
  id: string;
  name: string;
  description: string | null;
}

export interface Harvest {
  id: string;
  garden_id: string;
  crop_type_id: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_amount: number;
  note: string | null;
  created_at: string;
  crop_type?: CropType;
}

export interface CreateHarvest {
  garden_id: string;
  crop_type_id: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_amount: number;
  note?: string;
}

export const harvestService = {
  // Crop Types operations
  async listCropTypes() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xem danh sách loại cây trồng");
    }

    const { data, error } = await supabase
      .from("crop_types")
      .select("*")
      .order("name");

    if (error) {
      console.error("List crop types error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xem danh sách loại cây trồng");
      }
      throw error;
    }
    return data as CropType[];
  },

  async createCropType(cropType: Partial<CropType>) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để thêm loại cây trồng");
    }

    const { data, error } = await supabase
      .from("crop_types")
      .insert(cropType)
      .select()
      .single();

    if (error) {
      console.error("Create crop type error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền thêm loại cây trồng");
      }
      throw error;
    }
    return data as CropType;
  },

  async updateCropType(id: string, cropType: Partial<CropType>) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để cập nhật loại cây trồng");
    }

    const { data, error } = await supabase
      .from("crop_types")
      .update(cropType)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update crop type error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền cập nhật loại cây trồng");
      }
      throw error;
    }
    return data as CropType;
  },

  async deleteCropType(id: string) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xóa loại cây trồng");
    }

    const { error } = await supabase.from("crop_types").delete().eq("id", id);

    if (error) {
      console.error("Delete crop type error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xóa loại cây trồng");
      }
      throw error;
    }
    return true;
  },

  // Harvest operations
  async listHarvests() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xem danh sách thu hoạch");
    }

    const { data, error } = await supabase
      .from("harvests")
      .select(
        `
        *,
        crop_type:crop_types(*)
      `
      )
      .order("harvest_date", { ascending: false });

    if (error) {
      console.error("List harvests error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xem danh sách thu hoạch");
      }
      throw error;
    }
    return data as Harvest[];
  },

  async createHarvest(harvest: CreateHarvest) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để thêm thu hoạch");
    }

    const { data, error } = await supabase
      .from("harvests")
      .insert(harvest)
      .select()
      .single();

    if (error) {
      console.error("Create harvest error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền thêm thu hoạch");
      }
      throw error;
    }
    return data as Harvest;
  },

  async updateHarvest(id: string, harvest: Partial<CreateHarvest>) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để cập nhật thu hoạch");
    }

    const { data, error } = await supabase
      .from("harvests")
      .update(harvest)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update harvest error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền cập nhật thu hoạch");
      }
      throw error;
    }
    return data as Harvest;
  },

  async deleteHarvest(id: string) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xóa thu hoạch");
    }

    const { error } = await supabase.from("harvests").delete().eq("id", id);

    if (error) {
      console.error("Delete harvest error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xóa thu hoạch");
      }
      throw error;
    }
    return true;
  },
};
