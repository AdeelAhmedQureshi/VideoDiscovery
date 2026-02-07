# User Account Management API Documentation

This document provides comprehensive documentation for all user account management endpoints in the VideoDiscovery backend.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [Get User Profile](#get-user-profile)
   - [Update Name](#update-name)
   - [Update Email](#update-email)
   - [Update Password](#update-password)
   - [Delete Account](#delete-account)
   - [Get Account Statistics](#get-account-statistics)
4. [Security Features](#security-features)
5. [Error Handling](#error-handling)

---

## Overview

The User Account Management API provides secure endpoints for users to manage their accounts, including updating personal information, changing passwords, and deleting accounts. All endpoints require authentication and implement multiple security measures.

**Base URL**: `/api/users` (or your configured prefix)

---

## Authentication

All user management endpoints require authentication. You can authenticate using either:

1. **Bearer Token** (recommended for API clients):

   ```
   Authorization: Bearer <your_access_token>
   ```

2. **HttpOnly Cookie** (automatically sent by browsers):
   - The `access_token` cookie is automatically included in requests

---

## Endpoints

### Get User Profile

Retrieve the current authenticated user's profile information.

**Endpoint**: `GET /me`

**Authentication**: Required

**Request**: No body required

**Response**:

```json
{
  "success": true,
  "data": {
    "user_id": "user_12345",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Example**:

```bash
curl -X GET https://your-api.com/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Update Name

Update the user's display name.

**Endpoint**: `PUT /update-name`

**Authentication**: Required

**Request Body**:

```json
{
  "name": "New Name"
}
```

**Validation**:

- Name cannot be empty
- Whitespace is automatically trimmed

**Response**:

```json
{
  "success": true,
  "message": "Name updated successfully",
  "data": {
    "name": "New Name"
  }
}
```

**Example**:

```bash
curl -X PUT https://your-api.com/api/users/update-name \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith"}'
```

---

### Update Email

Update the user's email address. Requires password confirmation for security.

**Endpoint**: `PUT /update-email`

**Authentication**: Required

**Request Body**:

```json
{
  "email": "newemail@example.com",
  "password": "current_password"
}
```

**Security Features**:

- Requires current password confirmation
- Checks if email is already in use
- Validates email format

**Response**:

```json
{
  "success": true,
  "message": "Email updated successfully. Please login again with your new email.",
  "data": {
    "email": "newemail@example.com"
  }
}
```

**Important**: After updating email, the user should login again with the new email address.

**Example**:

```bash
curl -X PUT https://your-api.com/api/users/update-email \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "password": "mySecurePassword123"
  }'
```

**Error Cases**:

- `401`: Incorrect password
- `400`: Email already in use by another account

---

### Update Password

Change the user's password. Requires current password and logs out all devices.

**Endpoint**: `PUT /update-password`

**Authentication**: Required

**Request Body**:

```json
{
  "current_password": "old_password",
  "new_password": "new_password"
}
```

**Validation**:

- New password must be at least 6 characters
- New password must be different from current password
- Current password must be correct

**Security Features**:

- Verifies current password
- Hashes new password with bcrypt
- Automatically logs out all devices (invalidates all refresh tokens)
- Clears authentication cookies

**Response**:

```json
{
  "success": true,
  "message": "Password updated successfully. Please login again with your new password."
}
```

**Important**: After updating password, all active sessions are terminated and the user must login again.

**Example**:

```bash
curl -X PUT https://your-api.com/api/users/update-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "oldPassword123",
    "new_password": "newSecurePassword456"
  }'
```

**Error Cases**:

- `401`: Current password is incorrect
- `400`: New password must be different from current password
- `400`: Password must be at least 6 characters long

---

### Delete Account

Permanently delete the user account and all associated data.

**Endpoint**: `DELETE /delete-account`

**Authentication**: Required

**Request Body**:

```json
{
  "password": "your_password",
  "confirmation": "DELETE"
}
```

**Validation**:

- Password must be correct
- Confirmation field must be exactly "DELETE" (case-insensitive)

**⚠️ WARNING**: This action is **IRREVERSIBLE** and will permanently delete:

- User account
- All uploaded videos
- All feedback entries
- All recommendations
- All refresh tokens (sessions)

**Response**:

```json
{
  "success": true,
  "message": "Account deleted successfully. All your data has been permanently removed."
}
```

**Example**:

```bash
curl -X DELETE https://your-api.com/api/users/delete-account \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "myPassword123",
    "confirmation": "DELETE"
  }'
```

**Error Cases**:

- `401`: Incorrect password
- `400`: Invalid confirmation (must type "DELETE")

---

### Get Account Statistics

Retrieve statistics about the user's account and data.

**Endpoint**: `GET /account-stats`

**Authentication**: Required

**Request**: No body required

**Response**:

```json
{
  "success": true,
  "data": {
    "user_id": "user_12345",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z",
    "statistics": {
      "total_videos": 15,
      "total_feedback": 42,
      "total_recommendations": 28
    }
  }
}
```

**Example**:

```bash
curl -X GET https://your-api.com/api/users/account-stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Security Features

### 1. Password Hashing

- All passwords are hashed using bcrypt with 12 salt rounds
- Passwords are never stored or transmitted in plain text

### 2. Authentication Required

- All endpoints require valid JWT authentication
- Tokens are verified on every request

### 3. Password Confirmation

- Sensitive operations (email change, password change, account deletion) require password confirmation
- Prevents unauthorized changes even if token is compromised

### 4. Double Confirmation for Deletion

- Account deletion requires both password and typing "DELETE"
- Prevents accidental account deletion

### 5. Session Management

- Password change automatically logs out all devices
- Account deletion clears all sessions

### 6. Email Uniqueness

- System prevents duplicate email addresses
- Validates email format

### 7. Data Cascade Deletion

- Account deletion safely removes all associated data
- Maintains database integrity

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes

| Status Code | Meaning                                               |
| ----------- | ----------------------------------------------------- |
| `200`       | Success                                               |
| `400`       | Bad Request (validation error, duplicate email, etc.) |
| `401`       | Unauthorized (invalid token, incorrect password)      |
| `404`       | Not Found (user doesn't exist)                        |
| `500`       | Internal Server Error                                 |

### Common Error Messages

**Authentication Errors**:

- "Missing authentication credentials"
- "Access token expired"
- "Invalid access token"

**Validation Errors**:

- "Name cannot be empty"
- "Password must be at least 6 characters long"
- "Please type 'DELETE' to confirm account deletion"

**Security Errors**:

- "Incorrect password"
- "Current password is incorrect"
- "Email already in use"

**Data Errors**:

- "User not found"
- "New password must be different from current password"

---

## Best Practices

### For Developers

1. **Always use HTTPS** in production
2. **Store tokens securely**:
   - Use HttpOnly cookies for browsers
   - Use secure storage for mobile apps
3. **Implement proper error handling**:
   - Show user-friendly error messages
   - Log detailed errors for debugging
4. **Validate input on client-side** before sending requests
5. **Handle token expiration**:
   - Implement token refresh logic
   - Redirect to login when refresh fails

### For Users

1. **Use strong passwords** (at least 6 characters, but longer is better)
2. **Verify email changes** carefully
3. **Understand account deletion is permanent**
4. **Keep your password secure**

---

## Example Integration (JavaScript/Fetch)

```javascript
// Get user profile
async function getUserProfile(accessToken) {
  const response = await fetch("/api/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

// Update name
async function updateName(accessToken, newName) {
  const response = await fetch("/api/users/update-name", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newName }),
  });
  return await response.json();
}

// Update email
async function updateEmail(accessToken, newEmail, password) {
  const response = await fetch("/api/users/update-email", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: newEmail,
      password: password,
    }),
  });
  return await response.json();
}

// Update password
async function updatePassword(accessToken, currentPassword, newPassword) {
  const response = await fetch("/api/users/update-password", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  return await response.json();
}

// Delete account
async function deleteAccount(accessToken, password) {
  const response = await fetch("/api/users/delete-account", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: password,
      confirmation: "DELETE",
    }),
  });
  return await response.json();
}

// Get account statistics
async function getAccountStats(accessToken) {
  const response = await fetch("/api/users/account-stats", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}
```

---

## Testing with cURL

### Get Profile

```bash
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Name

```bash
curl -X PUT http://localhost:8000/api/users/update-name \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name"}'
```

### Update Email

```bash
curl -X PUT http://localhost:8000/api/users/update-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@email.com", "password": "currentpass"}'
```

### Update Password

```bash
curl -X PUT http://localhost:8000/api/users/update-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_password": "oldpass", "new_password": "newpass"}'
```

### Delete Account

```bash
curl -X DELETE http://localhost:8000/api/users/delete-account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "mypass", "confirmation": "DELETE"}'
```

### Get Account Stats

```bash
curl -X GET http://localhost:8000/api/users/account-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Summary

The User Account Management API provides a complete, secure solution for user self-service account management. All operations are protected with:

✅ JWT authentication  
✅ Password verification for sensitive operations  
✅ Input validation  
✅ Secure password hashing  
✅ Automatic session management  
✅ Data integrity preservation  
✅ Comprehensive error handling

For questions or issues, please refer to the main project documentation or contact the development team.
