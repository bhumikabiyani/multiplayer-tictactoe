-- Create the nakama database
CREATE DATABASE nakama;

-- Create a user for nakama (optional, you can use postgres user)
CREATE USER nakama_user WITH PASSWORD 'nakama_password';

-- Grant privileges to the nakama user
GRANT ALL PRIVILEGES ON DATABASE nakama TO nakama_user;

-- Connect to the nakama database
\c nakama;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO nakama_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nakama_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nakama_user;

-- The Nakama server will automatically create the required tables
-- when it starts up for the first time