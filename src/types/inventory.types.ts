// Định nghĩa các types theo đúng thiết kế DB
export interface InventoryCategory {
  id: string;
  name: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  category_id: string;
  name: string;
  unit: string;
  current_quantity: number;
  created_at: string;
  updated_at: string;
  // Thêm để hiển thị thông tin category khi join
  category?: InventoryCategory;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  type: string; // 'nhap' | 'xuat'
  quantity: number;
  price: number;
  total: number;
  date: string;
  note: string;
  created_at: string;
  // Thêm để hiển thị thông tin item khi join
  item?: InventoryItem;
}

// Types cho việc tạo mới
export interface CreateInventoryCategory {
  name: string;
  description: string;
}

export interface CreateInventoryItem {
  category_id: string;
  name: string;
  unit: string;
  current_quantity: number;
}

export interface CreateInventoryTransaction {
  item_id: string;
  type: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  note: string;
}
