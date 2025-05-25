/*
  # Update sales schema for new features

  1. Changes
    - Add business type to sales table
    - Add IMEI tracking for phone sales
    - Add fields for travel bookings
    - Add profit tracking (hidden from invoices)
    - Add customer number reference

  2. New Tables
    - phone_sales
      - id (uuid, primary key)
      - sale_id (uuid, references sales)
      - imei (text)
      - model (text)
      - brand (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - travel_bookings
      - id (uuid, primary key)
      - sale_id (uuid, references sales)
      - type (text) - domestic/international
      - route (text)
      - our_fare (numeric)
      - customer_fare (numeric)
      - profit (numeric)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add business type to sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS business_type TEXT CHECK (business_type IN ('telecom_recharge', 'telecom_phone', 'telecom_service', 'travel_domestic', 'travel_international'));
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_number_id UUID REFERENCES customer_numbers(id);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS profit NUMERIC DEFAULT 0;

-- Create phone_sales table
CREATE TABLE phone_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    imei TEXT NOT NULL,
    model TEXT NOT NULL,
    brand TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_phone_sales_updated_at
    BEFORE UPDATE ON phone_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create travel_bookings table
CREATE TABLE travel_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('domestic', 'international')),
    route TEXT NOT NULL,
    our_fare NUMERIC NOT NULL,
    customer_fare NUMERIC NOT NULL,
    profit NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'issued', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_travel_bookings_updated_at
    BEFORE UPDATE ON travel_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE phone_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users full access to phone_sales"
    ON phone_sales
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to travel_bookings"
    ON travel_bookings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);