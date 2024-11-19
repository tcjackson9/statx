import psycopg2

def connect_db():
    return psycopg2.connect(
        host="aws-0-us-west-1.pooler.supabase.com",
        port=5432,
        dbname="postgres",
        user="postgres.xrstrludepuahpovxpzb",
        password="AZ1d3Tab7my1TubG"
    )
