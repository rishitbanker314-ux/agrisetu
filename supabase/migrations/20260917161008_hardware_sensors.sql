-- Create the sensor_data table
CREATE TABLE IF NOT EXISTS sensor_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id TEXT NOT NULL,
    moisture_level NUMERIC(5, 2) NOT NULL,
    temperature NUMERIC(5, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add an index on created_at for fast retrieval of the latest data
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON sensor_data(created_at DESC);

-- Enable RLS
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (so ESP32 can send data using only the anon key)
CREATE POLICY "Allow anonymous inserts" ON sensor_data FOR INSERT WITH CHECK (true);

-- Allow anonymous selects (so the Next.js frontend can view live data)
CREATE POLICY "Allow anonymous selects" ON sensor_data FOR SELECT USING (true);

-- Enable Supabase Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;
