-- Drop function cũ trước khi tạo lại
DROP FUNCTION IF EXISTS public.create_order(jsonb, jsonb);
DROP FUNCTION IF EXISTS public.create_order(jsonb, jsonb[]);

-- Tạo function để xử lý việc tạo đơn hàng và các items liên quan
CREATE OR REPLACE FUNCTION public.create_order(
  order_data jsonb,
  items_data jsonb
)
RETURNS TABLE (
  order_id uuid,
  customer_id uuid,
  order_date timestamptz,
  delivery_date timestamptz,
  status varchar,
  sub_total numeric,
  shipping_fee numeric,
  shipping_type varchar,
  total_amount numeric,
  deposit_amount numeric,
  deposit_date timestamptz,
  remaining_amount numeric,
  payment_status varchar,
  note text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  -- Tạo đơn hàng mới với CTE
  WITH new_order AS (
    INSERT INTO orders (
      customer_id,
      order_date,
      delivery_date,
      status,
      sub_total,
      shipping_fee,
      shipping_type,
      total_amount,
      deposit_amount,
      deposit_date,
      remaining_amount,
      payment_status,
      note
    )
    VALUES (
      (order_data->>'customer_id')::uuid,
      (order_data->>'order_date')::timestamptz,
      (order_data->>'delivery_date')::timestamptz,
      order_data->>'status',
      (order_data->>'sub_total')::numeric,
      (order_data->>'shipping_fee')::numeric,
      order_data->>'shipping_type',
      (order_data->>'total_amount')::numeric,
      (order_data->>'deposit_amount')::numeric,
      (order_data->>'deposit_date')::timestamptz,
      (order_data->>'remaining_amount')::numeric,
      order_data->>'payment_status',
      order_data->>'note'
    )
    RETURNING id
  )
  SELECT id INTO v_order_id FROM new_order;

  -- Tạo các items cho đơn hàng với CTE
  -- Tạo các items cho đơn hàng
  INSERT INTO order_items (
    order_id,
    crop_type_id,
    quantity,
    unit,
    price_per_unit,
    total
  )
  SELECT
    v_order_id,
    (item->>'crop_type_id')::uuid,
    (item->>'quantity')::numeric,
    item->>'unit',
    (item->>'price_per_unit')::numeric,
    (item->>'quantity')::numeric * (item->>'price_per_unit')::numeric
  FROM jsonb_array_elements(items_data::jsonb) AS item;

  -- Trả về đơn hàng vừa tạo với CTE
  RETURN QUERY
  SELECT
    o.id AS order_id,
    o.customer_id AS customer_id,
    o.order_date AS order_date,
    o.delivery_date AS delivery_date,
    o.status AS status,
    o.sub_total AS sub_total,
    o.shipping_fee AS shipping_fee,
    o.shipping_type AS shipping_type,
    o.total_amount AS total_amount,
    o.deposit_amount AS deposit_amount,
    o.deposit_date AS deposit_date,
    o.remaining_amount AS remaining_amount,
    o.payment_status AS payment_status,
    o.note AS note,
    o.created_at AS created_at,
    o.updated_at AS updated_at
  FROM orders o
  WHERE o.id = v_order_id;
END;
$$;
