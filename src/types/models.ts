export interface Garden {
  id: string;
  name: string;
  area: number;
  location: string;
  number_of_beds: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

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
}

export interface CropType {
  id: string;
  name: string;
  description: string;
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
  note: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_date: string;
  delivery_date: string;
  status: string;
  sub_total: number;
  shipping_fee: number;
  shipping_type: string;
  total_amount: number;
  deposit_amount: number;
  deposit_date: string;
  remaining_amount: number;
  payment_status: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string | null;
  hourly_rate: number;
  created_at: string;
}

export interface LaborRecord {
  id: string;
  worker_id: string;
  work_date: string;
  hours_worked: number;
  hourly_rate: number;
  total_amount: number;
  note: string;
  payment_status: string;
  created_at: string;
}
