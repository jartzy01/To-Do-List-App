from dotenv import load_dotenv
import mysql.connector
import os

load_dotenv()

db_config = {
    'user': os.getenv('MARIADB_USER'),
    'password': os.getenv('MARIADB_PASSWORD'),
    'host': '127.0.0.1',
    'database': os.getenv('MARIADB_DATABASE'),
    'collation': 'utf8mb4_general_ci'
}

conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

with open('./database.sql', 'r') as sql_file:
    script = sql_file.read()
    for statement in script.split(";"):
        if statement.strip():
            cursor.execute(statement)

conn.commit()
cursor.close()
conn.close()
