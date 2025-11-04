"""
Test MySQL Database Connection
Run this script to verify your MySQL database is properly configured
"""

import pymysql
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Database credentials
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3305))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'danalexfreshFF0519')
DB_NAME = os.getenv('DB_NAME', 'bakery_db')

def test_connection():
    """Test basic MySQL connection"""
    print("=" * 60)
    print("TESTING MYSQL DATABASE CONNECTION")
    print("=" * 60)
    print()
    
    print(f"Connection Details:")
    print(f"  Host: {DB_HOST}")
    print(f"  Port: {DB_PORT}")
    print(f"  User: {DB_USER}")
    print(f"  Database: {DB_NAME}")
    print()
    
    try:
        # Attempt connection
        print("Attempting to connect to MySQL server...")
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("✓ Successfully connected to MySQL server!")
        print()
        
        # Try to use the database
        with connection.cursor() as cursor:
            cursor.execute(f"USE {DB_NAME}")
            print(f"✓ Successfully connected to database '{DB_NAME}'")
            print()
            
            # List all tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            if tables:
                print(f"Found {len(tables)} tables in database:")
                for table in tables:
                    table_name = list(table.values())[0]
                    print(f"  - {table_name}")
                    
                    # Count records in each table
                    cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
                    count = cursor.fetchone()['count']
                    print(f"    ({count} records)")
                print()
            else:
                print("⚠ No tables found in database!")
                print("Please run the SQL schema file in MySQL Workbench to create tables.")
                print()
            
            # Test a sample query
            cursor.execute("SELECT * FROM products LIMIT 5")
            products = cursor.fetchall()
            
            if products:
                print(f"Sample Products ({len(products)} shown):")
                for product in products:
                    print(f"  - {product['name']}: ₦{product['price']}")
                print()
            else:
                print("⚠ No products found in database!")
                print("Run the SQL INSERT statements to add sample data.")
                print()
        
        connection.close()
        print("=" * 60)
        print("✓ DATABASE CONNECTION TEST SUCCESSFUL!")
        print("=" * 60)
        print()
        print("You can now run your Flask application:")
        print("  python app.py")
        print()
        return True
        
    except pymysql.err.OperationalError as e:
        print()
        print("=" * 60)
        print("✗ DATABASE CONNECTION FAILED!")
        print("=" * 60)
        print()
        print(f"Error: {e}")
        print()
        print("Common issues:")
        print("  1. MySQL server is not running")
        print("     - Start MySQL from Services (Windows) or systemctl (Linux)")
        print("  2. Wrong credentials in .env file")
        print("     - Check DB_USER and DB_PASSWORD")
        print("  3. Database doesn't exist")
        print("     - Create database in MySQL Workbench: CREATE DATABASE bakery_db;")
        print("  4. Firewall blocking connection")
        print("     - Check if port 3306 is open")
        print()
        return False
        
    except Exception as e:
        print()
        print("=" * 60)
        print("✗ UNEXPECTED ERROR!")
        print("=" * 60)
        print()
        print(f"Error: {e}")
        print(f"Error Type: {type(e).__name__}")
        print()
        return False


def test_flask_sqlalchemy():
    """Test Flask-SQLAlchemy connection"""
    print("=" * 60)
    print("TESTING FLASK-SQLALCHEMY CONNECTION")
    print("=" * 60)
    print()
    
    try:
        from app import app, db, Product, User
        
        with app.app_context():
            # Test database connection
            print("Testing Flask-SQLAlchemy connection...")
            db.engine.connect()
            print("✓ Flask-SQLAlchemy connection successful!")
            print()
            
            # Query products
            products = Product.query.limit(3).all()
            print(f"Sample Products (Flask-SQLAlchemy):")
            for product in products:
                print(f"  - {product.name}: ₦{product.price}")
            print()
            
            # Query users
            users = User.query.all()
            print(f"Total Users: {len(users)}")
            print()
            
            print("=" * 60)
            print("✓ FLASK-SQLALCHEMY TEST SUCCESSFUL!")
            print("=" * 60)
            print()
            return True
            
    except ImportError as e:
        print(f"⚠ Cannot import app.py: {e}")
        print("Make sure app.py exists and is properly configured.")
        print()
        return False
        
    except Exception as e:
        print(f"✗ Error: {e}")
        print()
        return False


if __name__ == "__main__":
    # Test basic MySQL connection
    basic_success = test_connection()
    
    print()
    input("Press Enter to test Flask-SQLAlchemy connection...")
    print()
    
    # Test Flask-SQLAlchemy
    if basic_success:
        test_flask_sqlalchemy()
    else:
        print("Skipping Flask-SQLAlchemy test due to connection failure.")
        print("Fix the connection issues above first.")
    
    print()
    input("Press Enter to exit...")