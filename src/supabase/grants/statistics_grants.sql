-- Grant permissions for statistics queries
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.inventory_transactions TO authenticated;
GRANT SELECT ON public.labor_records TO authenticated;
GRANT SELECT ON public.gardens TO authenticated;
GRANT SELECT ON public.care_activities TO authenticated;
