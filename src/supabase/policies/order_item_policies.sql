-- Order items policies
-- SELECT: Người dùng xác thực có thể xem tất cả chi tiết đơn hàng
CREATE POLICY "Allow authenticated users to view order items"
ON order_items
FOR SELECT
USING (auth.role() = 'authenticated');

-- INSERT: Người dùng xác thực có thể thêm chi tiết đơn hàng mới
CREATE POLICY "Allow authenticated users to insert order items"
ON order_items
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Người dùng xác thực có thể cập nhật chi tiết đơn hàng
CREATE POLICY "Allow authenticated users to update order items"
ON order_items
FOR UPDATE
USING (
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.status = 'moi'
    )
)
WITH CHECK (auth.role() = 'authenticated');

-- DELETE: Người dùng xác thực có thể xóa chi tiết đơn hàng (chỉ khi đơn hàng chưa xác nhận)
CREATE POLICY "Allow authenticated users to delete order items"
ON order_items
FOR DELETE
USING (
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.status = 'moi'
    )
);
