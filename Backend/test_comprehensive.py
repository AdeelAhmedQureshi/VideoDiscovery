"""
Comprehensive Test Suite for User Management & Token Configuration

This script tests:
1. Task 1: User management features (profile, update name/email/password, delete account)
2. Task 2: Token expiration set to 24 hours

Tests both functionality and security measures.
"""

import requests
import json
import jwt
from datetime import datetime, timezone, timedelta
import time

# Configuration
BASE_URL = "http://localhost:8000/api/users"
TEST_EMAIL = "comprehensive_test@example.com"
TEST_PASSWORD = "SecurePass123"
TEST_NAME = "Comprehensive Test User"

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def print_header(text):
    """Print a formatted header"""
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}{text.center(70)}{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")


def print_success(text):
    """Print success message"""
    print(f"{GREEN}✅ {text}{RESET}")


def print_error(text):
    """Print error message"""
    print(f"{RED}❌ {text}{RESET}")


def print_info(text):
    """Print info message"""
    print(f"{YELLOW}ℹ️  {text}{RESET}")


def print_test(test_name):
    """Print test name"""
    print(f"\n{YELLOW}[TEST] {test_name}{RESET}")


def decode_token_without_verification(token):
    """Decode JWT token without verification to check expiration"""
    try:
        # Decode without verification to inspect payload
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception as e:
        return None


def test_token_expiration(access_token):
    """Test that token expiration is set to 24 hours"""
    print_test("Verifying Token Expiration Time (Task 2)")

    payload = decode_token_without_verification(access_token)

    if not payload:
        print_error("Failed to decode token")
        return False

    # Get expiration time
    exp_timestamp = payload.get('exp')
    iat_timestamp = payload.get('iat')

    if not exp_timestamp or not iat_timestamp:
        print_error("Token missing exp or iat claims")
        return False

    # Convert to datetime
    exp_time = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    iat_time = datetime.fromtimestamp(iat_timestamp, tz=timezone.utc)

    # Calculate duration
    duration = exp_time - iat_time
    hours = duration.total_seconds() / 3600

    print_info(f"Token issued at (iat): {iat_time}")
    print_info(f"Token expires at (exp): {exp_time}")
    print_info(
        f"Token duration: {hours} hours ({duration.total_seconds() / 60} minutes)")

    # Check if it's 24 hours (1440 minutes)
    # Allow small tolerance for processing time
    if abs(hours - 24.0) < 0.1:  # Within 6 minutes tolerance
        print_success(f"Token expiration correctly set to 24 hours")
        return True
    else:
        print_error(f"Token expiration is {hours} hours, expected 24 hours")
        return False


def test_signup():
    """Test user signup"""
    print_test("User Signup")

    url = f"{BASE_URL}/signup"
    data = {
        "name": TEST_NAME,
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }

    try:
        response = requests.post(url, json=data)

        if response.status_code == 200:
            result = response.json()
            access_token = result["data"]["access_token"]
            print_success(f"Signup successful")
            print_info(f"Access Token: {access_token[:50]}...")
            return access_token
        else:
            print_error(f"Signup failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Signup error: {str(e)}")
        return None


def test_get_profile(access_token):
    """Test getting user profile"""
    print_test("Get User Profile")

    url = f"{BASE_URL}/me"
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            result = response.json()
            user_data = result["data"]
            print_success(f"Profile retrieved successfully")
            print_info(f"User ID: {user_data['user_id']}")
            print_info(f"Name: {user_data['name']}")
            print_info(f"Email: {user_data['email']}")
            return True
        else:
            print_error(f"Failed to get profile: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Get profile error: {str(e)}")
        return False


def test_update_name(access_token):
    """Test updating user name"""
    print_test("Update User Name")

    url = f"{BASE_URL}/update-name"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    new_name = "Updated Test User"
    data = {"name": new_name}

    try:
        response = requests.put(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            print_success(f"Name updated successfully to: {new_name}")
            return True
        else:
            print_error(f"Failed to update name: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Update name error: {str(e)}")
        return False


def test_update_email(access_token, new_email):
    """Test updating user email"""
    print_test("Update User Email")

    url = f"{BASE_URL}/update-email"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "email": new_email,
        "password": TEST_PASSWORD
    }

    try:
        response = requests.put(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            print_success(f"Email updated successfully to: {new_email}")
            return True
        else:
            print_error(f"Failed to update email: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Update email error: {str(e)}")
        return False


def test_account_stats(access_token):
    """Test getting account statistics"""
    print_test("Get Account Statistics")

    url = f"{BASE_URL}/account-stats"
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            result = response.json()
            stats = result["data"]["statistics"]
            print_success(f"Account statistics retrieved")
            print_info(f"Videos: {stats['total_videos']}")
            print_info(f"Feedback: {stats['total_feedback']}")
            print_info(f"Recommendations: {stats['total_recommendations']}")
            return True
        else:
            print_error(f"Failed to get stats: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Get stats error: {str(e)}")
        return False


def test_update_password(access_token):
    """Test updating user password"""
    print_test("Update User Password")

    url = f"{BASE_URL}/update-password"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    new_password = "NewSecurePass456"
    data = {
        "current_password": TEST_PASSWORD,
        "new_password": new_password
    }

    try:
        response = requests.put(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            print_success(f"Password updated successfully")
            print_info("Note: This logs out all devices")
            return True, new_password
        else:
            print_error(f"Failed to update password: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print_error(f"Update password error: {str(e)}")
        return False, None


def test_login(email, password):
    """Test user login"""
    print_test("User Login")

    url = f"{BASE_URL}/login"
    data = {
        "email": email,
        "password": password
    }

    try:
        response = requests.post(url, json=data)

        if response.status_code == 200:
            result = response.json()
            access_token = result["data"]["access_token"]
            print_success(f"Login successful")
            print_info(f"New Access Token: {access_token[:50]}...")
            return access_token
        else:
            print_error(f"Login failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return None


def test_delete_account(access_token):
    """Test deleting user account"""
    print_test("Delete User Account")

    url = f"{BASE_URL}/delete-account"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "password": TEST_PASSWORD,
        "confirmation": "DELETE"
    }

    try:
        response = requests.delete(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            print_success(f"Account deleted successfully")
            print_info("All user data has been removed")
            return True
        else:
            print_error(f"Failed to delete account: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Delete account error: {str(e)}")
        return False


def test_token_persistence(access_token):
    """Test that token remains valid for extended period"""
    print_test("Token Persistence Test")

    print_info("Testing if token remains valid...")
    print_info("Making multiple requests over time...")

    url = f"{BASE_URL}/me"
    headers = {"Authorization": f"Bearer {access_token}"}

    # Test multiple times over a short period
    for i in range(3):
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                print_success(f"Request {i+1}/3: Token still valid")
            else:
                print_error(
                    f"Request {i+1}/3: Token invalid (status {response.status_code})")
                return False

            if i < 2:
                time.sleep(1)  # Wait 1 second between requests
        except Exception as e:
            print_error(f"Request {i+1}/3: Error - {str(e)}")
            return False

    print_success("Token remains valid across multiple requests")
    return True


def run_comprehensive_test():
    """Run complete test suite"""
    print_header("COMPREHENSIVE TEST SUITE")
    print_header("Testing User Management & Token Configuration")

    results = {
        "total": 0,
        "passed": 0,
        "failed": 0
    }

    # Test 1: Signup and verify token expiration
    print_header("TASK 2: Token Expiration Test (24 Hours)")
    results["total"] += 1
    access_token = test_signup()
    if access_token:
        results["passed"] += 1

        # Verify token expiration time
        results["total"] += 1
        if test_token_expiration(access_token):
            results["passed"] += 1
        else:
            results["failed"] += 1
    else:
        results["failed"] += 1
        print_error("Cannot continue tests without access token")
        return results

    # Test 2: Get Profile (Task 1)
    print_header("TASK 1: User Management Features")
    results["total"] += 1
    if test_get_profile(access_token):
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 3: Update Name (Task 1)
    results["total"] += 1
    if test_update_name(access_token):
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 4: Verify name change
    results["total"] += 1
    if test_get_profile(access_token):
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 5: Get Account Statistics (Task 1)
    results["total"] += 1
    if test_account_stats(access_token):
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 6: Update Email (Task 1)
    new_email = f"updated_{TEST_EMAIL}"
    results["total"] += 1
    if test_update_email(access_token, new_email):
        results["passed"] += 1

        # Update email for subsequent tests
        global TEST_EMAIL
        TEST_EMAIL = new_email
    else:
        results["failed"] += 1

    # Test 7: Token Persistence (Task 2)
    print_header("TASK 2: Token Persistence Test")
    results["total"] += 1
    if test_token_persistence(access_token):
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Test 8: Update Password (Task 1)
    print_header("TASK 1: Password Management")
    results["total"] += 1
    success, new_password = test_update_password(access_token)
    if success:
        results["passed"] += 1

        # Update password for login test
        global TEST_PASSWORD
        TEST_PASSWORD = new_password

        # Test 9: Login with new password and verify token expiration
        results["total"] += 1
        new_token = test_login(TEST_EMAIL, TEST_PASSWORD)
        if new_token:
            results["passed"] += 1
            access_token = new_token

            # Verify new token also has 24-hour expiration
            results["total"] += 1
            if test_token_expiration(new_token):
                results["passed"] += 1
            else:
                results["failed"] += 1
        else:
            results["failed"] += 1
    else:
        results["failed"] += 1

    # Test 10: Delete Account (Task 1)
    print_header("TASK 1: Account Deletion")
    print_info("⚠️  WARNING: This will permanently delete the test account")
    results["total"] += 1
    if test_delete_account(access_token):
        results["passed"] += 1
    else:
        results["failed"] += 1

    # Print summary
    print_header("TEST SUMMARY")
    print(f"\n{BLUE}Total Tests: {results['total']}{RESET}")
    print(f"{GREEN}Passed: {results['passed']}{RESET}")
    print(f"{RED}Failed: {results['failed']}{RESET}")

    if results['failed'] == 0:
        print(f"\n{GREEN}{'='*70}{RESET}")
        print(f"{GREEN}{'🎉 ALL TESTS PASSED! 🎉'.center(70)}{RESET}")
        print(f"{GREEN}{'='*70}{RESET}\n")
        print_success("Task 1 (User Management): ✅ Working")
        print_success("Task 2 (24-Hour Token): ✅ Working")
    else:
        print(f"\n{RED}{'='*70}{RESET}")
        print(f"{RED}{'⚠️  SOME TESTS FAILED'.center(70)}{RESET}")
        print(f"{RED}{'='*70}{RESET}\n")

    return results


if __name__ == "__main__":
    print("\n" + "="*70)
    print("Comprehensive Test Suite for VideoDiscovery Backend")
    print("="*70)
    print(f"\nTesting against: {BASE_URL}")
    print(f"Test Email: {TEST_EMAIL}")
    print("\n⚠️  Make sure your backend server is running!")
    print("   Start with: uvicorn app.main:app --reload\n")

    input("Press Enter to start tests...")

    try:
        results = run_comprehensive_test()

        # Exit with appropriate code
        exit(0 if results['failed'] == 0 else 1)
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}Tests interrupted by user{RESET}")
        exit(1)
    except Exception as e:
        print(f"\n{RED}Unexpected error: {str(e)}{RESET}")
        exit(1)
