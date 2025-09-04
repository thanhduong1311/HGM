-- Function to handle inventory transaction and update stock
CREATE OR REPLACE FUNCTION create_inventory_transaction(
  p_transaction jsonb,
  p_new_quantity numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert transaction
    INSERT INTO inventory_transactions (
      item_id,
      type,
      quantity,
      price,
      total,
      date,
      note,
      created_at
    )
    SELECT
      (p_transaction->>'item_id')::uuid,
      (p_transaction->>'type')::inventory_transaction_type,
      (p_transaction->>'quantity')::numeric,
      (p_transaction->>'price')::numeric,
      (p_transaction->>'total')::numeric,
      (p_transaction->>'date')::timestamp,
      p_transaction->>'note',
      (p_transaction->>'created_at')::timestamp
    RETURNING to_jsonb(inventory_transactions.*) INTO v_result;

    -- Update item quantity
    UPDATE inventory_items
    SET 
      current_quantity = p_new_quantity,
      updated_at = NOW()
    WHERE id = (p_transaction->>'item_id')::uuid;

    -- Check if quantity would go negative
    IF p_new_quantity < 0 THEN
      RAISE EXCEPTION 'Số lượng tồn kho không thể âm';
    END IF;

    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RAISE EXCEPTION 'Lỗi khi tạo giao dịch: %', SQLERRM;
  END;
END;
$$;
