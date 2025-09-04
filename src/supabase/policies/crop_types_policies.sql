-- Enable RLS
ALTER TABLE crop_types ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view crop types
CREATE POLICY "Allow authenticated users to view crop types"
ON crop_types
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert crop types
CREATE POLICY "Allow authenticated users to insert crop types"
ON crop_types
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update crop types
CREATE POLICY "Allow authenticated users to update crop types"
ON crop_types
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete crop types
CREATE POLICY "Allow authenticated users to delete crop types"
ON crop_types
FOR DELETE
USING (auth.role() = 'authenticated');
