-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo bảng gardens (Thông tin vườn)
CREATE TABLE gardens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    area DECIMAL NOT NULL,
    location VARCHAR,
    number_of_beds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id)
);

-- Tạo bảng inventory_categories (Phân loại vật tư)
CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT
);

-- Tạo bảng inventory_items (Danh mục vật tư)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES inventory_categories(id),
    name VARCHAR NOT NULL,
    unit VARCHAR NOT NULL,
    current_quantity DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng inventory_transactions (Nhập/xuất vật tư)
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES inventory_items(id),
    type VARCHAR NOT NULL CHECK (type IN ('nhập', 'xuất')),
    quantity DECIMAL NOT NULL,
    price DECIMAL NOT NULL,
    total DECIMAL NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng crop_types (Loại cây trồng)
CREATE TABLE crop_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT
);

-- Tạo bảng harvests (Thu hoạch)
CREATE TABLE harvests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID REFERENCES gardens(id),
    crop_type_id UUID REFERENCES crop_types(id),
    harvest_date TIMESTAMP WITH TIME ZONE NOT NULL,
    quantity DECIMAL NOT NULL,
    unit VARCHAR NOT NULL,
    price_per_unit DECIMAL NOT NULL,
    total_amount DECIMAL NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng customers (Khách hàng)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    phone VARCHAR,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng orders (Đơn hàng)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    order_date TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR NOT NULL DEFAULT 'mới' CHECK (status IN ('mới', 'xác nhận', 'đang giao', 'hoàn thành')),
    sub_total DECIMAL NOT NULL DEFAULT 0,
    shipping_fee DECIMAL DEFAULT 0,
    shipping_type VARCHAR CHECK (shipping_type IN ('nhà_vườn_chịu', 'khách_hàng_chịu')),
    total_amount DECIMAL NOT NULL DEFAULT 0,
    deposit_amount DECIMAL DEFAULT 0,
    deposit_date TIMESTAMP WITH TIME ZONE,
    remaining_amount DECIMAL DEFAULT 0,
    payment_status VARCHAR NOT NULL DEFAULT 'chưa_cọc' CHECK (payment_status IN ('chưa_cọc', 'đã_cọc', 'đã_thanh_toán')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng order_items (Chi tiết đơn hàng)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    crop_type_id UUID REFERENCES crop_types(id),
    quantity DECIMAL NOT NULL,
    unit VARCHAR NOT NULL,
    price_per_unit DECIMAL NOT NULL,
    total DECIMAL NOT NULL
);

-- Tạo bảng workers (Người làm)
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    phone VARCHAR,
    hourly_rate DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng labor_records (Bảng công)
CREATE TABLE labor_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES workers(id),
    work_date TIMESTAMP WITH TIME ZONE NOT NULL,
    hours_worked DECIMAL NOT NULL,
    hourly_rate DECIMAL NOT NULL,
    total_amount DECIMAL NOT NULL,
    note TEXT,
    payment_status VARCHAR NOT NULL DEFAULT 'chưa_thanh_toán' CHECK (payment_status IN ('chưa_thanh_toán', 'đã_thanh_toán')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng care_activities (Hoạt động chăm sóc)
CREATE TABLE care_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garden_id UUID REFERENCES gardens(id),
    activity_type VARCHAR NOT NULL CHECK (activity_type IN ('bón phân', 'xịt thuốc')),
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng care_activity_details (Chi tiết hoạt động chăm sóc)
CREATE TABLE care_activity_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_activity_id UUID REFERENCES care_activities(id),
    inventory_item_id UUID REFERENCES inventory_items(id),
    quantity_used DECIMAL NOT NULL,
    unit VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo các indexes
CREATE INDEX idx_garden_user_id ON gardens(user_id);
CREATE INDEX idx_harvests_garden_id ON harvests(garden_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_care_activities_garden_id ON care_activities(garden_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(date);
CREATE INDEX idx_labor_records_work_date ON labor_records(work_date);

-- Tạo view thống kê
CREATE OR REPLACE VIEW monthly_statistics AS
SELECT
    date_trunc('month', h.harvest_date) as month,
    COALESCE(SUM(h.total_amount), 0) as total_revenue,
    COALESCE(SUM(it.total), 0) as total_expense,
    COALESCE(SUM(lr.total_amount), 0) as total_labor_cost,
    COALESCE(SUM(h.total_amount), 0) - COALESCE(SUM(it.total), 0) - COALESCE(SUM(lr.total_amount), 0) as net_profit
FROM harvests h
LEFT JOIN inventory_transactions it
    ON date_trunc('month', h.harvest_date) = date_trunc('month', it.date)
LEFT JOIN labor_records lr
    ON date_trunc('month', h.harvest_date) = date_trunc('month', lr.work_date)
GROUP BY date_trunc('month', h.harvest_date);

-- Set up Row Level Security (RLS)
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_activity_details ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable access to authenticated users only" ON gardens
    FOR ALL USING (auth.uid() = user_id);

-- Repeat similar policies for other tables as needed

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.care_activities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  garden_id uuid,
  activity_type character varying NOT NULL CHECK (activity_type::text = ANY (ARRAY['bon_phan'::text, 'xit_thuoc'::text])),
  activity_date timestamp with time zone NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT care_activities_pkey PRIMARY KEY (id),
  CONSTRAINT care_activities_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id)
);
CREATE TABLE public.care_activity_details (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  care_activity_id uuid,
  inventory_item_id uuid,
  quantity_used numeric NOT NULL,
  unit character varying NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT care_activity_details_pkey PRIMARY KEY (id),
  CONSTRAINT care_activity_details_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id),
  CONSTRAINT care_activity_details_care_activity_id_fkey FOREIGN KEY (care_activity_id) REFERENCES public.care_activities(id)
);
CREATE TABLE public.crop_types (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  CONSTRAINT crop_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  phone character varying,
  address text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gardens (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  area numeric NOT NULL,
  location character varying,
  number_of_beds integer NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  user_id uuid,
  CONSTRAINT gardens_pkey PRIMARY KEY (id),
  CONSTRAINT gardens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.harvests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  garden_id uuid,
  crop_type_id uuid,
  harvest_date timestamp with time zone NOT NULL,
  quantity numeric NOT NULL,
  unit character varying NOT NULL,
  price_per_unit numeric NOT NULL,
  total_amount numeric NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT harvests_pkey PRIMARY KEY (id),
  CONSTRAINT harvests_garden_id_fkey FOREIGN KEY (garden_id) REFERENCES public.gardens(id),
  CONSTRAINT harvests_crop_type_id_fkey FOREIGN KEY (crop_type_id) REFERENCES public.crop_types(id)
);
CREATE TABLE public.inventory_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  CONSTRAINT inventory_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid,
  name character varying NOT NULL,
  unit character varying NOT NULL,
  current_quantity numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inventory_items_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.inventory_categories(id)
);
CREATE TABLE public.inventory_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  item_id uuid,
  type USER-DEFINED NOT NULL CHECK (type::text = ANY (ARRAY['nhap'::text, 'xuat'::text])),
  quantity numeric NOT NULL,
  price numeric NOT NULL,
  total numeric NOT NULL,
  date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  note text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_transactions_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id)
);
CREATE TABLE public.labor_records (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  worker_id uuid,
  work_date timestamp with time zone NOT NULL,
  hours_worked numeric NOT NULL,
  hourly_rate numeric NOT NULL,
  total_amount numeric NOT NULL,
  note text,
  payment_status character varying NOT NULL DEFAULT 'chua_thanh_toan'::character varying CHECK (payment_status::text = ANY (ARRAY['chua_thanh_toan'::text, 'da_thanh_toan'::text])),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT labor_records_pkey PRIMARY KEY (id),
  CONSTRAINT labor_records_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid,
  crop_type_id uuid,
  quantity numeric NOT NULL,
  unit character varying NOT NULL,
  price_per_unit numeric NOT NULL,
  total numeric NOT NULL,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_crop_type_id_fkey FOREIGN KEY (crop_type_id) REFERENCES public.crop_types(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid,
  order_date timestamp with time zone NOT NULL,
  delivery_date timestamp with time zone,
  status character varying NOT NULL DEFAULT 'moi'::character varying CHECK (status::text = ANY (ARRAY['moi'::text, 'xac_nhan'::text, 'dang_giao'::text, 'hoan_thanh'::text])),
  sub_total numeric NOT NULL DEFAULT 0,
  shipping_fee numeric DEFAULT 0,
  shipping_type character varying CHECK (shipping_type::text = ANY (ARRAY['nha_vuon_chiu'::text, 'khach_hang_chiu'::text])),
  total_amount numeric NOT NULL DEFAULT 0,
  deposit_amount numeric DEFAULT 0,
  deposit_date timestamp with time zone,
  remaining_amount numeric DEFAULT 0,
  payment_status character varying NOT NULL DEFAULT 'chua_coc'::character varying CHECK (payment_status::text = ANY (ARRAY['chua_coc'::text, 'da_coc'::text, 'da_thanh_toan'::text])),
  note text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.workers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  phone character varying,
  hourly_rate numeric NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT workers_pkey PRIMARY KEY (id)
);