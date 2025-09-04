-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_records ENABLE ROW LEVEL SECURITY;

-- Workers: Người dùng xác thực có thể xem và quản lý
CREATE POLICY "Allow authenticated users to manage workers"
ON workers
FOR ALL
USING (auth.role() = 'authenticated');

-- Labor Records: Người dùng xác thực có thể xem và quản lý
CREATE POLICY "Allow authenticated users to manage labor records"
ON labor_records
FOR ALL
USING (auth.role() = 'authenticated');

-- Drop the previous policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow viewing labor records with worker details" ON labor_records;

-- No need for a separate policy for joins since the base table policies handle the permissions
-- The join will work as long as the user has access to both tables through their respective policies
