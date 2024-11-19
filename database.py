import psycopg2

def connect_db():
    return psycopg2.connect(
        host="your-database-host",
        port=5432,
        dbname="your-database-name",
        user="your-database-user",
        password="your-database-password"
    )
