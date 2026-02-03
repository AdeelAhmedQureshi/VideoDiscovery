import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def test_connection():
    """Test MongoDB Atlas connection"""
    try:
        print("Testing MongoDB Atlas connection...")
        print(f"Connection string: {settings.MONGO_URL[:50]}...")
        
        client = AsyncIOMotorClient(
            settings.MONGO_URL,
            serverSelectionTimeoutMS=5000
        )
        
        # Ping the database
        await client.admin.command('ping')
        print("✅ MongoDB Atlas connected successfully!")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"✅ Available databases: {db_list}")
        
        # Check if our database exists
        if settings.DATABASE_NAME in db_list:
            print(f"✅ Database '{settings.DATABASE_NAME}' exists")
        else:
            print(f"⚠️ Database '{settings.DATABASE_NAME}' does not exist yet (will be created on first write)")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")
        print("\nCommon issues with MongoDB Atlas:")
        print("1. Network Access: Ensure your IP address is whitelisted (0.0.0.0/0 for all IPs)")
        print("2. Database User: Verify username and password are correct")
        print("3. Internet Connection: Check your network connectivity")
        print("4. Firewall: Ensure port 27017 is not blocked")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())
