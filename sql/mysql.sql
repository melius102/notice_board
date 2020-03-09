-- mysql allow remote access
-- SELECT * FROM mysql.user
-- CREATE USER 'root'@'%' IDENTIFIED BY '0000';
-- GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- mysql allow ruser remote access
-- CREATE USER 'ruser'@'192.168.%' IDENTIFIED BY '0000';
-- GRANT ALL PRIVILEGES ON dbname.* TO 'ruser'@'192.168.%' WITH GRANT OPTION;
-- DROP USER 'ruser'@'192.168.%';