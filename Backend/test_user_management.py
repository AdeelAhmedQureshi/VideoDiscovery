"""
Test script for User Management API endpoints

This script provides manual testing examples for all user management endpoints.
Make sure your backend server is running before executing these tests.

Usage:
1. Update BASE_URL if your server runs on a different host/port
2. First, signup/login to get an access token
3. Replace YOUR_ACCESS_TOKEN with your actual token
4. Run individual test functions
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000/api/users"

# Test credentials - CHANGE THESE
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "testpass123"
TEST_NAME = "Test User"


def print_response(response, operation):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"Operation: {operation}")
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    print(f"{'='*60}\n")


def signup():
    """Test user signup"""
    url = f"{BASE_URL}/signup"
    data = {
        "name": TEST_NAME,
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    response = requests.post(url, json=data)
    print_response(response, "SIGNUP")
    if response.status_code == 200:
        return response.json()["data"]["access_token"]
    return None


def login():
    """Test user login"""
    url = f"{BASE_URL}/login"
    data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    response = requests.post(url, json=data)
    print_response(response, "LOGIN")
    if response.status_code == 200:
        return response.json()["data"]["access_token"]
    return None


def get_user_profile(access_token):
    """Test getting user profile"""
    url = f"{BASE_URL}/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers)
    print_response(response, "GET USER PROFILE")
    return response


def update_name(access_token, new_name):
    """Test updating user name"""
    url = f"{BASE_URL}/update-name"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {"name": new_name}
    response = requests.put(url, headers=headers, json=data)
    print_response(response, "UPDATE NAME")
    return response


def update_email(access_token, new_email, password):
    """Test updating user email"""
    url = f"{BASE_URL}/update-email"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "email": new_email,
        "password": password
    }
    response = requests.put(url, headers=headers, json=data)
    print_response(response, "UPDATE EMAIL")
    return response


def update_password(access_token, current_password, new_password):
    """Test updating user password"""
    url = f"{BASE_URL}/update-password"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "current_password": current_password,
        "new_password": new_password
    }
    response = requests.put(url, headers=headers, json=data)
    print_response(response, "UPDATE PASSWORD")
    return response


def get_account_stats(access_token):
    """Test getting account statistics"""
    url = f"{BASE_URL}/account-stats"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers)
    print_response(response, "GET ACCOUNT STATISTICS")
    return response


def delete_account(access_token, password):
    """Test deleting user account"""
    url = f"{BASE_URL}/delete-account"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "password": password,
        "confirmation": "DELETE"
    }
    response = requests.delete(url, headers=headers, json=data)
    print_response(response, "DELETE ACCOUNT")
    return response


def run_full_test_suite():
    """Run complete test suite for user management"""
    print("\n" + "="*60)
    print("USER MANAGEMENT API - FULL TEST SUITE")
    print("="*60)

    # Step 1: Signup
    print("\n[1/8] Testing Signup...")
    access_token = signup()
    if not access_token:
        print("❌ Signup failed! Stopping tests.")
        return
    print("✅ Signup successful!")

    # Step 2: Get Profile
    print("\n[2/8] Testing Get Profile...")
    get_user_profile(access_token)
    print("✅ Get profile successful!")

    # Step 3: Get Account Stats
    print("\n[3/8] Testing Get Account Stats...")
    get_account_stats(access_token)
    print("✅ Get account stats successful!")

    # Step 4: Update Name
    print("\n[4/8] Testing Update Name...")
    update_name(access_token, "Updated Test User")
    print("✅ Update name successful!")

    # Step 5: Verify name change
    print("\n[5/8] Verifying Name Change...")
    get_user_profile(access_token)

    # Step 6: Update Email (requires password)
    print("\n[6/8] Testing Update Email...")
    new_email = f"updated_{TEST_EMAIL}"
    update_email(access_token, new_email, TEST_PASSWORD)
    print("✅ Update email successful!")

    # Step 7: Login with new email
    print("\n[7/8] Testing Login with New Email...")
    TEST_EMAIL = new_email
    new_token = login()
    if new_token:
        access_token = new_token
        print("✅ Login with new email successful!")

    # Step 8: Delete Account (WARNING: This is permanent!)
    print("\n[8/8] Testing Delete Account...")
    confirm = input(
        "\n⚠️  WARNING: This will permanently delete the test account. Continue? (yes/no): ")
    if confirm.lower() == "yes":
        delete_account(access_token, TEST_PASSWORD)
        print("✅ Delete account successful!")
    else:
        print("⏭️  Skipped account deletion")

    print("\n" + "="*60)
    print("TEST SUITE COMPLETED")
    print("="*60 + "\n")


def interactive_mode():
    """Interactive testing mode"""
    print("\n" + "="*60)
    print("USER MANAGEMENT API - INTERACTIVE MODE")
    print("="*60)

    # Get access token
    print("\nFirst, let's get an access token...")
    print("1. Signup")
    print("2. Login")
    choice = input("Choose (1/2): ")

    access_token = None
    if choice == "1":
        access_token = signup()
    elif choice == "2":
        access_token = login()

    if not access_token:
        print("❌ Authentication failed!")
        return

    print(f"\n✅ Access Token: {access_token[:50]}...")

    # Interactive menu
    while True:
        print("\n" + "-"*60)
        print("Choose an operation:")
        print("1. Get User Profile")
        print("2. Get Account Statistics")
        print("3. Update Name")
        print("4. Update Email")
        print("5. Update Password")
        print("6. Delete Account")
        print("0. Exit")
        print("-"*60)

        choice = input("Enter choice: ")

        if choice == "0":
            print("Goodbye!")
            break
        elif choice == "1":
            get_user_profile(access_token)
        elif choice == "2":
            get_account_stats(access_token)
        elif choice == "3":
            new_name = input("Enter new name: ")
            update_name(access_token, new_name)
        elif choice == "4":
            new_email = input("Enter new email: ")
            password = input("Enter current password: ")
            update_email(access_token, new_email, password)
        elif choice == "5":
            current_password = input("Enter current password: ")
            new_password = input("Enter new password: ")
            update_password(access_token, current_password, new_password)
        elif choice == "6":
            print("\n⚠️  WARNING: This action is IRREVERSIBLE!")
            password = input("Enter password: ")
            confirm = input("Type DELETE to confirm: ")
            if confirm == "DELETE":
                delete_account(access_token, password)
                break
            else:
                print("Account deletion cancelled.")
        else:
            print("Invalid choice!")


if __name__ == "__main__":
    print("\nUser Management API Test Script")
    print("================================")
    print("\nMake sure your backend server is running!")
    print(f"Testing against: {BASE_URL}\n")

    print("Choose testing mode:")
    print("1. Interactive Mode (step-by-step)")
    print("2. Full Test Suite (automated)")
    print("3. Quick Test (signup + profile)")

    mode = input("\nEnter choice (1/2/3): ")

    if mode == "1":
        interactive_mode()
    elif mode == "2":
        confirm = input(
            "\n⚠️  This will create and delete a test account. Continue? (yes/no): ")
        if confirm.lower() == "yes":
            run_full_test_suite()
    elif mode == "3":
        # Quick test
        print("\n[Quick Test] Signup and Get Profile")
        token = signup()
        if token:
            get_user_profile(token)
            get_account_stats(token)
    else:
        print("Invalid choice!")
