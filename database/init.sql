CREATE TABLE IF NOT EXISTS my_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Updated users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE, -- Default to false until the user verifies their email
  verification_token VARCHAR(255), -- Stores the email verification token
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Existing sample data insertion
INSERT INTO my_table (name) VALUES ('Sample Data');
