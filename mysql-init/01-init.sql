CREATE USER 'appuser'@'%' IDENTIFIED BY 'apppassword';
GRANT ALL PRIVILEGES ON vaccine_db.* TO 'appuser'@'%';
FLUSH PRIVILEGES; 