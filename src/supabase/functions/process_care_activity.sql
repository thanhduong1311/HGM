-- Step 1: Create type if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_transaction_type') THEN
        CREATE TYPE inventory_transaction_type AS ENUM ('nhap', 'xuat');
    END IF;
END $$;

-- Step 2: Create or replace the function
CREATE OR REPLACE FUNCTION public.process_care_activity(p_activity_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_detail RECORD;
BEGIN
  -- Duyệt qua từng chi tiết chăm sóc
  FOR v_detail IN
    SELECT
      cad.inventory_item_id,
      cad.quantity_used,
      cad.unit,
      ca.activity_date
    FROM care_activity_details cad
    JOIN care_activities ca ON ca.id = cad.care_activity_id
    WHERE ca.id = p_activity_id
  LOOP
    -- Tạo giao dịch xuất kho
    INSERT INTO inventory_transactions (
      item_id,
      type,
      quantity,
      date,
      note,
      price,
      total,
      created_at
    )
    VALUES (
      v_detail.inventory_item_id,
      'xuat'::inventory_transaction_type,
      v_detail.quantity_used,
      v_detail.activity_date,
      'Xuất cho hoạt động chăm sóc',
      0, -- Giá 0 vì đã tính khi nhập
      0,
      NOW()
    );

    -- Cập nhật số lượng tồn kho
    UPDATE inventory_items
    SET
      current_quantity = current_quantity - v_detail.quantity_used,
      updated_at = NOW()
    WHERE id = v_detail.inventory_item_id;

    -- Kiểm tra nếu số lượng < 0 thì báo lỗi
    IF EXISTS (
      SELECT 1
      FROM inventory_items
      WHERE id = v_detail.inventory_item_id
        AND current_quantity < 0
    ) THEN
      RAISE EXCEPTION 'Số lượng tồn kho không đủ';
    END IF;
  END LOOP;
END;
$$;
