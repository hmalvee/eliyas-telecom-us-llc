/*
  # Add customer numbers table

  1. New Tables
    - customer_numbers
      - id (uuid, primary key)
      - customer_id (uuid, references customers)
      - name (text)
      - carrier (text)
      - custom_carrier (text, nullable)
      - phone_number (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on customer_numbers table
    - Add policy for authenticated users
*/

-- Create customer_numbers table
CREATE TABLE customer_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    carrier TEXT NOT NULL,
    custom_carrier TEXT,
    phone_number TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger
CREATE TRIGGER update_customer_numbers_updated_at
    BEFORE UPDATE ON customer_numbers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customer_numbers ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow authenticated users full access to customer_numbers"
    ON customer_numbers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);