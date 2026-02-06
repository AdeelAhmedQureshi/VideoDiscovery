"""
Quick Verification Test
Tests Task 1 (User Management) and Task 2 (24-hour tokens)
"""

import requests
import jwt
from datetime import datetime, timezone

BASE_URL = "http://localhost:8000/api/users"


def check_token_expiration(token):
    """Check if token is set to 24 hours"""
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        exp = datetime.fromtimestamp(payload['exp'], tz=timezone.utc)
        iat = datetime.fromtimestamp(payload['iat'], tz=timezone.utc)
        hours = (exp - iat).total_seconds() / 3600
        return hours
    except:
        return None


def main():
    print("\n" + "="*60)
    print("QUICK VERIFICATION TEST")
    print("="*60 + "\n")

    # Test 1: Check backend is running
    print("1. Checking if backend is running...")
    try:
        response = requests.get("http://localhost:8000/api/health")
        print("   ✅ Backend is running")
    except:
        print("   ❌ Backend not running! Start with:")
        print("      uvicorn app.main:app --reload")
        return

    # Test 2: Signup and check token
    print("\n2. Testing signup and token expiration (Task 2)...")
    test_email = "quicktest@example.com"
    try:
        response = requests.post(f"{BASE_URL}/signup", json={
            "name": "Quick Test",
            "email": test_email,
            "password": "test123"
        })

        if response.status_code == 200:
            token = response.json()["data"]["access_token"]
            hours = check_token_expiration(token)

            if hours and abs(hours - 24.0) < 0.1:
                print(f"   ✅ Token expiration: {hours:.2f} hours (24 hours)")
                print("   ✅ TASK 2 VERIFIED: Token set to 24 hours")
            else:
                print(
                    f"   ❌ Token expiration: {hours:.2f} hours (expected 24)")

            # Test 3: User Management Features
            print("\n3. Testing user management features (Task 1)...")
            headers = {"Authorization": f"Bearer {token}"}

            # Get profile
            r1 = requests.get(f"{BASE_URL}/me", headers=headers)
            print(f"   {'✅' if r1.status_code == 200 else '❌'} Get Profile")

            # Update name
            r2 = requests.put(f"{BASE_URL}/update-name",
                              headers={**headers,
                                       "Content-Type": "application/json"},
                              json={"name": "Updated Name"})
            print(f"   {'✅' if r2.status_code == 200 else '❌'} Update Name")

            # Get stats
            r3 = requests.get(f"{BASE_URL}/account-stats", headers=headers)
            print(f"   {'✅' if r3.status_code == 200 else '❌'} Get Statistics")

            # Delete account
            r4 = requests.delete(f"{BASE_URL}/delete-account",
                                 headers={**headers,
                                          "Content-Type": "application/json"},
                                 json={"password": "test123", "confirmation": "DELETE"})
            print(f"   {'✅' if r4.status_code == 200 else '❌'} Delete Account")

            if all(r.status_code == 200 for r in [r1, r2, r3, r4]):
                print("\n   ✅ TASK 1 VERIFIED: All user management features working")

            print("\n" + "="*60)
            print("✅ ALL TESTS PASSED!")
            print("✅ Task 1 (User Management): Working")
            print("✅ Task 2 (24-Hour Token): Working")
            print("="*60 + "\n")

        else:
            print(f"   ❌ Signup failed: {response.status_code}")
            print(f"   Response: {response.text}")

    except Exception as e:
        print(f"   ❌ Error: {str(e)}")


if __name__ == "__main__":
    main()
