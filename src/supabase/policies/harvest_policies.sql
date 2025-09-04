-- Enable RLS
ALTER TABLE crop_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;

-- Crop Types: Người dùng xác thực có thể xem và quản lý
CREATE POLICY "Allow authenticated users to manage crop types"
ON crop_types
FOR ALL
USING (auth.role() = 'authenticated');

-- Harvests: Người dùng xác thực có thể xem và quản lý
CREATE POLICY "Allow authenticated users to manage harvests"
ON harvests
FOR ALL
USING (auth.role() = 'authenticated');
