-- Tạo enum type cho loại giao dịch
CREATE TYPE inventory_transaction_type AS ENUM ('nhap', 'xuat');

-- Sửa lại cột type trong bảng inventory_transactions
ALTER TABLE inventory_transactions 
  ALTER COLUMN type TYPE inventory_transaction_type 
  USING type::inventory_transaction_type;
