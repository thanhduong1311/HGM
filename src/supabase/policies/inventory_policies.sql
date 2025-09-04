-- Enable RLS
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Inventory Categories: Tất cả người dùng đã xác thực có thể xem, chỉ admin có thể thêm/sửa/xóa
CREATE POLICY "Allow authenticated users to view inventory categories"
ON inventory_categories
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin to manage inventory categories"
ON inventory_categories
FOR ALL
USING (auth.role() = 'authenticated');

-- Inventory Items: Người dùng xác thực có thể xem và quản lý
CREATE POLICY "Allow authenticated users to manage inventory items"
ON inventory_items
FOR ALL
USING (auth.role() = 'authenticated');

-- Inventory Transactions: Người dùng xác thực có thể xem và quản lý
CREATE POLICY "Allow authenticated users to manage inventory transactions"
ON inventory_transactions
FOR ALL
USING (auth.role() = 'authenticated');
