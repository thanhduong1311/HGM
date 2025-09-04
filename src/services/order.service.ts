import { supabase } from "@/lib/supabase";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface CreateCustomer {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_date: string;
  delivery_date: string;
  status: "moi" | "xac_nhan" | "dang_giao" | "hoan_thanh";
  sub_total: number;
  shipping_fee: number;
  shipping_type: "nha_vuon_chiu" | "khach_hang_chiu";
  total_amount: number;
  deposit_amount: number;
  deposit_date: string | null;
  remaining_amount: number;
  payment_status: "chua_coc" | "da_coc" | "da_thanh_toan";
  note: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: OrderItem[];
}

export interface CreateOrder {
  customer_id: string;
  order_date: string;
  delivery_date: string;
  shipping_fee?: number;
  shipping_type: "nha_vuon_chiu" | "khach_hang_chiu";
  deposit_amount?: number;
  deposit_date?: string;
  note?: string;
  items: CreateOrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  crop_type_id: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total: number;
  crop_type?: {
    name: string;
  };
}

export interface CreateOrderItem {
  crop_type_id: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
}

export const orderService = {
  // Customer operations
  async listCustomers() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xem danh sách khách hàng");
    }

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) {
      console.error("List customers error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xem danh sách khách hàng");
      }
      throw error;
    }
    return data as Customer[];
  },

  async createCustomer(customer: CreateCustomer) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để thêm khách hàng");
    }

    const { data, error } = await supabase
      .from("customers")
      .insert(customer)
      .select()
      .single();

    if (error) {
      console.error("Create customer error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền thêm khách hàng");
      }
      throw error;
    }
    return data as Customer;
  },

  async updateCustomer(id: string, customer: Partial<CreateCustomer>) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để cập nhật khách hàng");
    }

    const { data, error } = await supabase
      .from("customers")
      .update(customer)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update customer error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền cập nhật khách hàng");
      }
      throw error;
    }
    return data as Customer;
  },

  async deleteCustomer(id: string) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xóa khách hàng");
    }

    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) {
      console.error("Delete customer error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xóa khách hàng");
      }
      throw error;
    }
    return true;
  },

  // Order operations
  async listOrders() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xem danh sách đơn hàng");
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers(*),
        items:order_items(*, crop_type:crop_types(name))
      `
      )
      .order("order_date", { ascending: false });

    if (error) {
      console.error("List orders error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xem danh sách đơn hàng");
      }
      throw error;
    }
    return data as Order[];
  },

  async createOrder(order: CreateOrder) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để tạo đơn hàng");
    }

    // Calculate totals
    const subTotal = order.items.reduce(
      (sum, item) => sum + item.quantity * item.price_per_unit,
      0
    );
    const shippingFee = order.shipping_fee || 0;
    const totalAmount =
      order.shipping_type === "nha_vuon_chiu"
        ? subTotal + shippingFee
        : subTotal;
    const depositAmount = order.deposit_amount || 0;
    const remainingAmount = totalAmount - depositAmount;
    const paymentStatus = depositAmount > 0 ? "da_coc" : "chua_coc";

    const orderData = {
      customer_id: order.customer_id,
      order_date: order.order_date,
      delivery_date: order.delivery_date,
      status: "moi",
      sub_total: subTotal,
      shipping_fee: shippingFee,
      shipping_type: order.shipping_type,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      deposit_date: order.deposit_date,
      remaining_amount: remainingAmount,
      payment_status: paymentStatus,
      note: order.note,
    };

    // Start a transaction
    const { data, error } = await supabase.rpc("create_order", {
      order_data: orderData,
      items_data: order.items, // Send as is, Supabase will handle the JSON conversion
    });

    if (error) {
      console.error("Create order error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền tạo đơn hàng");
      }
      throw error;
    }

    // Map order_id back to id for consistency
    const resultData = data as any;
    return {
      ...resultData,
      id: resultData.order_id,
    } as Order;
  },

  async updateOrderStatus(
    id: string,
    status: "moi" | "xac_nhan" | "dang_giao" | "hoan_thanh"
  ) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để cập nhật trạng thái đơn hàng");
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update order status error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền cập nhật trạng thái đơn hàng");
      }
      throw error;
    }
    return data as Order;
  },

  async updatePaymentStatus(
    id: string,
    paymentData: {
      payment_status: "chua_coc" | "da_coc" | "da_thanh_toan";
      deposit_amount?: number;
      deposit_date?: string;
    }
  ) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để cập nhật thanh toán");
    }

    const { data: order, error: getError } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("id", id)
      .single();

    if (getError) throw getError;

    const updateData = {
      payment_status: paymentData.payment_status,
      deposit_amount: paymentData.deposit_amount || 0,
      deposit_date: paymentData.deposit_date,
      remaining_amount: order.total_amount - (paymentData.deposit_amount || 0),
    };

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update payment status error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền cập nhật thanh toán");
      }
      throw error;
    }
    return data as Order;
  },

  async deleteOrder(id: string) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Bạn cần đăng nhập để xóa đơn hàng");
    }

    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("Delete order error:", error);
      if (error.code === "42501") {
        throw new Error("Bạn không có quyền xóa đơn hàng");
      }
      throw error;
    }
    return true;
  },
};
