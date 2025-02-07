#!/bin/bash
set -e

# Load environment variables from /app/.env
export $(cat /app/.env | xargs)

# Restart MariaDB service
service mariadb restart

# Wait for MariaDB to be ready
until mariadb -u root -p$MARIADB_ROOT_PASSWORD -e "SELECT 1;" &> /dev/null; do
    echo "Waiting for MariaDB to start..."
    sleep 1
done

# Create the database and user if they do not exist
mariadb -u root -p$MARIADB_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS \`$MARIADB_DATABASE\`;"
mariadb -u root -p$MARIADB_ROOT_PASSWORD -e "CREATE USER IF NOT EXISTS '$MARIADB_USER'@'localhost' IDENTIFIED BY '$MARIADB_PASSWORD';"
mariadb -u root -p$MARIADB_ROOT_PASSWORD -e "GRANT ALL PRIVILEGES ON \`$MARIADB_DATABASE\`.* TO '$MARIADB_USER'@'localhost';"
mariadb -u root -p$MARIADB_ROOT_PASSWORD -e "FLUSH PRIVILEGES;"

# Run the Python script to create tables from database.sql
/app/venv/bin/python /app/create_tables_db.py

# Restart Nginx to load the new configuration
service nginx restart

# Start the API using PM2 (the API is in /app/index.js)
pm2 start /app/index.js --name api --no-autorestart > /dev/null 2>&1

# Prevent container from exiting
tail -f /dev/null
