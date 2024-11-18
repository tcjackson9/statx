import psycopg2

# Hardcoded connection details for Supavisor
SUPABASE_HOST = "aws-0-us-west-1.pooler.supabase.com"
SUPABASE_PORT = 6543  # Use port 6543 for transaction pooling mode
SUPABASE_DB = "postgres"
SUPABASE_USER = "postgres.xrstrludepuahpovxpzb"
SUPABASE_PASSWORD = "AZ1d3Tab7my1TubG"

# Test database connection
def test_db_connection():
    try:
        # Attempt to connect to the database
        conn = psycopg2.connect(
            host=SUPABASE_HOST,
            port=SUPABASE_PORT,
            dbname=SUPABASE_DB,
            user=SUPABASE_USER,
            password=SUPABASE_PASSWORD,
            sslmode="require"  # Enforce SSL as required by Supabase
        )
        print("Database connection successful.")
        
        # Execute a simple query to test the connection further
        cursor = conn.cursor()
        cursor.execute("SELECT 1;")
        result = cursor.fetchone()
        print("Test query executed successfully, result:", result)

        # Close cursor and connection
        cursor.close()
        conn.close()
        print("Connection closed.")
        
    except Exception as e:
        print(f"Error connecting to database: {e}")

# Run the test
if __name__ == "__main__":
    test_db_connection()
