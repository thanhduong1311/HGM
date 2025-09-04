-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Customers policies
-- SELECT: Người dùng xác thực có thể xem tất cả khách hàng
CREATE POLICY "Allow authenticated users to view customers"
ON customers
FOR SELECT
USING (auth.role() = 'authenticated');

-- INSERT: Người dùng xác thực có thể thêm khách hàng mới
CREATE POLICY "Allow authenticated users to insert customers"
ON customers
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Người dùng xác thực có thể cập nhật thông tin khách hàng
CREATE POLICY "Allow authenticated users to update customers"
ON customers
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- DELETE: Người dùng xác thực có thể xóa khách hàng (nếu không có đơn hàng liên quan)
CREATE POLICY "Allow authenticated users to delete customers"
ON customers
FOR DELETE
USING (
    auth.role() = 'authenticated' AND
    NOT EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.customer_id = customers.id
    )
);

-- Orders: Người dùng xác thực có thể xem và quản lý
CREATE POLICY "Allow authenticated users to manage orders"
ON orders
FOR ALL
USING (auth.role() = 'authenticated');

-- Order Items: Người dùng xác thực có thể xem và quản lý
CREATE POLICY "Allow authenticated users to manage order items"
ON order_items
FOR ALL
USING (auth.role() = 'authenticated');
