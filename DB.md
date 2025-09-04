# Thiết Kế Database - Home Garden Management

## 1. User Management (Quản lý người dùng)

```sql
-- Bảng users (được quản lý bởi Supabase Auth)
auth.users {
  id: uuid [pk]
  email: string
  phone: string
  created_at: timestamp
  // các trường khác được Supabase quản lý
}
```

## 2. Garden Management (Quản lý vườn)

```sql
-- Bảng gardens (Thông tin vườn)
gardens {
  id: uuid [pk]
  name: string            -- Tên khu vườn
  area: decimal          -- Diện tích (m2)
  location: string       -- Vị trí/địa chỉ
  number_of_beds: int
  created_at: timestamp
  updated_at: timestamp
  user_id: uuid [ref: > auth.users.id]
}

```

## 3. Inventory Management (Quản lý vật tư)

```sql
-- Bảng inventory_categories (Phân loại vật tư)
inventory_categories {
  id: uuid [pk]
  name: string          -- Tên loại (phân bón, thuốc, dụng cụ,...)
  description: text
}

-- Bảng inventory_items (Danh mục vật tư)
inventory_items {
  id: uuid [pk]
  category_id: uuid [ref: > inventory_categories.id]
  name: string          -- Tên vật tư
  unit: string         -- Đơn vị tính
  current_quantity: decimal
  created_at: timestamp
  updated_at: timestamp
}

-- Bảng inventory_transactions (Nhập/xuất vật tư)
inventory_transactions {
  id: uuid [pk]
  item_id: uuid [ref: > inventory_items.id]
  type: string         -- Loại giao dịch (nhập/xuất)
  quantity: decimal    -- Số lượng
  price: decimal       -- Đơn giá
  total: decimal       -- Thành tiền
  date: timestamp
  note: text
  created_at: timestamp
}
```

## 4. Harvest Management (Quản lý thu hoạch)

```sql
-- Bảng crop_types (Loại cây trồng)
crop_types {
  id: uuid [pk]
  name: string         -- Tên loại cây
  description: text   -- Thời gian sinh trưởng (ngày)
}

-- Bảng harvests (Thu hoạch)
harvests {
  id: uuid [pk]
  garden_id: uuid [ref: > gardens.id]
  crop_type_id: uuid [ref: > crop_types.id]
  harvest_date: timestamp
  quantity: decimal    -- Số lượng thu hoạch
  unit: string        -- Đơn vị tính
  price_per_unit: decimal
  total_amount: decimal
  note: text
  created_at: timestamp
}
```

## 5. Order Management (Quản lý đơn hàng)

```sql
-- Bảng customers (Khách hàng)
customers {
  id: uuid [pk]
  name: string
  phone: string
  address: text
  created_at: timestamp
}

-- Bảng orders (Đơn hàng)
orders {
  id: uuid [pk]
  customer_id: uuid [ref: > customers.id]
  order_date: timestamp
  delivery_date: timestamp
  status: string       -- Trạng thái đơn hàng (mới/xác nhận/đang giao/hoàn thành)
  sub_total: decimal   -- Tổng tiền hàng (chưa tính ship)
  shipping_fee: decimal -- Phí ship
  shipping_type: string -- Loại ship (nhà_vườn_chịu/khách_hàng_chịu)
  total_amount: decimal -- Tổng đơn hàng (đã tính ship nếu nhà vườn chịu)
  deposit_amount: decimal -- Số tiền cọc
  deposit_date: timestamp -- Ngày cọc
  remaining_amount: decimal -- Số tiền còn lại cần thanh toán
  payment_status: string -- Trạng thái thanh toán (chưa_cọc/đã_cọc/đã_thanh_toán)
  note: text
  created_at: timestamp
  updated_at: timestamp
}

-- Bảng order_items (Chi tiết đơn hàng)
order_items {
  id: uuid [pk]
  order_id: uuid [ref: > orders.id]
  crop_type_id: uuid [ref: > crop_types.id]
  quantity: decimal
  unit: string
  price_per_unit: decimal
  total: decimal
}
```

## 6. Labor Management (Quản lý nhân công)

```sql
-- Bảng workers (Người làm)
workers {
  id: uuid [pk]
  name: string
  phone: string -- nullable
  hourly_rate: decimal  -- Giá theo giờ
  created_at: timestamp
}

-- Bảng labor_records (Bảng công)
labor_records {
  id: uuid [pk]
  worker_id: uuid [ref: > workers.id]
  work_date: timestamp
  hours_worked: decimal
  hourly_rate: decimal
  total_amount: decimal
  note: text
  payment_status: string
  created_at: timestamp
}
```

## 7. Garden Care Management (Quản lý chăm sóc vườn)

```sql
-- Bảng care_activities (Hoạt động chăm sóc)
care_activities {
  id: uuid [pk]
  garden_id: uuid [ref: > gardens.id]
  activity_type: string  -- Loại hoạt động (bón phân/xịt thuốc)
  activity_date: timestamp
  note: text
  created_at: timestamp
}

-- Bảng care_activity_details (Chi tiết hoạt động chăm sóc)
care_activity_details {
  id: uuid [pk]
  care_activity_id: uuid [ref: > care_activities.id]
  inventory_item_id: uuid [ref: > inventory_items.id]  -- Loại phân/thuốc sử dụng
  quantity_used: decimal
  unit: string
  created_at: timestamp
}


```

## 8. Statistics (Thống kê)

```sql
-- Bảng statistics (có thể dùng views hoặc materialized views)
CREATE VIEW monthly_statistics AS
SELECT
  date_trunc('month', h.harvest_date) as month,
  SUM(h.total_amount) as total_revenue,
  SUM(it.total) as total_expense,
  SUM(lr.total_amount) as total_labor_cost,
  SUM(h.total_amount) - SUM(it.total) - SUM(lr.total_amount) as net_profit
FROM harvests h
LEFT JOIN inventory_transactions it
  ON date_trunc('month', h.harvest_date) = date_trunc('month', it.date)
LEFT JOIN labor_records lr
  ON date_trunc('month', h.harvest_date) = date_trunc('month', lr.work_date)
GROUP BY date_trunc('month', h.harvest_date)
```

## Row Level Security (RLS) Policies

```sql
-- Ví dụ về RLS policy cho bảng gardens
CREATE POLICY "Users can only access their own gardens"
ON gardens
FOR ALL
USING (auth.uid() = user_id);
```

## Indexes

```sql
-- Các index cần thiết
CREATE INDEX idx_garden_beds_garden_id ON garden_beds(garden_id);
CREATE INDEX idx_harvests_garden_bed_id ON harvests(garden_bed_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_care_activities_garden_bed_id ON care_activities(garden_bed_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(date);
CREATE INDEX idx_labor_records_work_date ON labor_records(work_date);
```

## Notes

1. Tất cả các bảng đều sử dụng UUID làm primary key để tương thích tốt với Supabase
2. Timestamps được sử dụng cho audit trail
3. RLS policies đảm bảo bảo mật dữ liệu theo từng user
4. Các relationships được thiết kế để dễ dàng query và maintain
5. Các views thống kê có thể được tạo thêm tùy theo nhu cầu báo cáo
