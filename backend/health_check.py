#!/usr/bin/env python3
"""
Quick health check script to verify backend configuration.
Run this locally to test before deploying.
"""
import sys
import os

print("=== Backend Health Check ===\n")

# Check Python version
print(f"Python version: {sys.version}")

# Check if required files exist
required_files = ['main.py', 'requirements.txt', 'database.py', 'auth.py']
missing_files = []
for file in required_files:
    if os.path.exists(file):
        print(f"✅ {file} exists")
    else:
        print(f"❌ {file} MISSING")
        missing_files.append(file)

if missing_files:
    print(f"\n⚠️  Missing files: {missing_files}")
    print("Make sure you're running this from the backend directory!")
    sys.exit(1)

# Check environment variables
print("\n=== Environment Variables ===")
env_vars = ['SECRET_KEY', 'GEMINI_API_KEY', 'DATABASE_URL', 'FRONTEND_URL']
for var in env_vars:
    value = os.getenv(var)
    if value:
        # Mask sensitive values
        if var in ['SECRET_KEY', 'GEMINI_API_KEY', 'DATABASE_URL']:
            masked = value[:10] + '...' if len(value) > 10 else '***'
            print(f"✅ {var}: {masked}")
        else:
            print(f"✅ {var}: {value}")
    else:
        if var in ['SECRET_KEY', 'GEMINI_API_KEY']:
            print(f"❌ {var}: NOT SET (REQUIRED)")
        else:
            print(f"⚠️  {var}: NOT SET (optional)")

# Try to import main modules
print("\n=== Module Imports ===")
try:
    from main import app
    print("✅ main.py imports successfully")
except Exception as e:
    print(f"❌ Failed to import main.py: {e}")
    sys.exit(1)

try:
    from database import init_db, get_db
    print("✅ database.py imports successfully")
except Exception as e:
    print(f"❌ Failed to import database.py: {e}")

try:
    from auth import router as auth_router
    print("✅ auth.py imports successfully")
except Exception as e:
    print(f"❌ Failed to import auth.py: {e}")

# Check if app has routes
print("\n=== Route Check ===")
routes = [route.path for route in app.routes]
if '/api/health' in routes:
    print("✅ /api/health route exists")
else:
    print("❌ /api/health route MISSING")
    print(f"Available routes: {routes[:10]}")

print("\n=== Health Check Complete ===")

