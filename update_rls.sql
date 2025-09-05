-- 1. Xóa dữ liệu hiện tại (optional - uncomment nếu muốn xóa data test)
/*
TRUNCATE inventory_transactions;
TRUNCATE inventory_items CASCADE;
TRUNCATE orders CASCADE;
TRUNCATE customers CASCADE;
TRUNCATE labor_records;
TRUNCATE workers CASCADE;
*/

-- 2. Thêm user_id column cho các bảng chính
ALTER TABLE inventory_items
ADD COLUMN user_id uuid REFERENCES auth.users(id);

ALTER TABLE orders
ADD COLUMN user_id uuid REFERENCES auth.users(id);

ALTER TABLE customers
ADD COLUMN user_id uuid REFERENCES auth.users(id);

ALTER TABLE workers
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- 3. Enable Row Level Security cho tất cả bảng
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_records ENABLE ROW LEVEL SECURITY;

-- 4. Tạo policies cho các bảng chính
CREATE POLICY "Users can only access their inventory"
ON inventory_items
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can only access their orders"
ON orders
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can only access their customers"
ON customers
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can only access their workers"
ON workers
FOR ALL
USING (user_id = auth.uid());

-- 5. Tạo policies cho các bảng phụ
CREATE POLICY "Users can only access their inventory transactions"
ON inventory_transactions
FOR ALL
USING (
  item_id IN (
    SELECT id FROM inventory_items 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can only access their labor records"
ON labor_records
FOR ALL
USING (
  worker_id IN (
    SELECT id FROM workers 
    WHERE user_id = auth.uid()
  )
);

-- 6. Update dữ liệu hiện có (optional - thay your_test_user_id bằng ID thực tế nếu muốn giữ data test)
/*
UPDATE inventory_items SET user_id = 'your_test_user_id';
UPDATE orders SET user_id = 'your_test_user_id';
UPDATE customers SET user_id = 'your_test_user_id';
UPDATE workers SET user_id = 'your_test_user_id';
*/
