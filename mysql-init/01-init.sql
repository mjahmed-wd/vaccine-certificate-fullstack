-- Create the main database
CREATE DATABASE IF NOT EXISTS vaccine_db;

-- Create the shadow database for Prisma migrations
CREATE DATABASE IF NOT EXISTS vaccine_db_shadow;

-- Grant all privileges on both databases to appuser
GRANT ALL PRIVILEGES ON vaccine_db.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON vaccine_db_shadow.* TO 'appuser'@'%';

-- Grant create database permission to appuser for Prisma migrations
GRANT CREATE ON *.* TO 'appuser'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES; 