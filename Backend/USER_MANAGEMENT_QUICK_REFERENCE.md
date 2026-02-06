# User Management Quick Reference

Quick reference guide for developers implementing user account management features.

---

## 🚀 Quick Start

### 1. Get User Profile

```bash
GET /api/users/me
Authorization: Bearer {token}
```

### 2. Update Name

```bash
PUT /api/users/update-name
Authorization: Bearer {token}
Content-Type: application/json

{"name": "New Name"}
```

### 3. Update Email

```bash
PUT /api/users/update-email
Authorization: Bearer {token}
Content-Type: application/json

{"email": "new@email.com", "password": "current_password"}
```

### 4. Update Password

```bash
PUT /api/users/update-password
Authorization: Bearer {token}
Content-Type: application/json

{"current_password": "old", "new_password": "new"}
```

### 5. Delete Account

```bash
DELETE /api/users/delete-account
Authorization: Bearer {token}
Content-Type: application/json

{"password": "password", "confirmation": "DELETE"}
```

### 6. Get Account Statistics

```bash
GET /api/users/account-stats
Authorization: Bearer {token}
```

---

## 📋 Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "detail": "Error message"
}
```

---

## 🔐 Security Checklist

### For All Endpoints

- ✅ Requires authentication
- ✅ Validates JWT token
- ✅ Returns 401 if unauthorized

### For Sensitive Operations

- ✅ Requires password confirmation (email, password, delete)
- ✅ Validates current password
- ✅ Clears sessions on password change

### For Account Deletion

- ✅ Requires password
- ✅ Requires typing "DELETE"
- ✅ Cascade deletes all data
- ⚠️ IRREVERSIBLE

---

## 🧪 Testing

### Interactive Test

```bash
cd Backend
python test_user_management.py
# Choose option 1
```

### Automated Test Suite

```bash
python test_user_management.py
# Choose option 2
```

### Quick Test

```bash
python test_user_management.py
# Choose option 3
```

---

## 🔗 Frontend Integration

### React/JavaScript Example

```javascript
// Get user profile
const getProfile = async (token) => {
  const res = await fetch("/api/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

// Update name
const updateName = async (token, name) => {
  const res = await fetch("/api/users/update-name", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return await res.json();
};

// Delete account
const deleteAccount = async (token, password) => {
  const res = await fetch("/api/users/delete-account", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password,
      confirmation: "DELETE",
    }),
  });
  return await res.json();
};
```

---

## 📊 HTTP Status Codes

| Code | Meaning                         |
| ---- | ------------------------------- |
| 200  | Success                         |
| 400  | Bad Request (validation failed) |
| 401  | Unauthorized (auth failed)      |
| 404  | Not Found (user doesn't exist)  |
| 500  | Server Error                    |

---

## ⚠️ Important Notes

### Password Change

- Logs out ALL devices
- User must login again
- All refresh tokens invalidated

### Email Change

- Must verify with password
- Cannot use email already in use
- Should login again with new email

### Account Deletion

- **PERMANENT** - cannot be undone
- Deletes ALL user data:
  - Videos
  - Feedback
  - Recommendations
  - Sessions
- Requires password + "DELETE" confirmation

---

## 📚 Full Documentation

For complete details, see:

- **API Docs**: [USER_MANAGEMENT_API.md](USER_MANAGEMENT_API.md)
- **Implementation**: [USER_MANAGEMENT_IMPLEMENTATION.md](USER_MANAGEMENT_IMPLEMENTATION.md)
- **Code**:
  - Routes: `app/routes/user_routes.py`
  - Schemas: `app/schemas/user_schema.py`
  - Tests: `test_user_management.py`

---

## 🐛 Common Errors

### "Missing authentication credentials"

- Token not provided
- Include Authorization header or cookie

### "Incorrect password"

- Wrong password for verification
- Check password is correct

### "Email already in use"

- Another user has this email
- Choose different email

### "Invalid token"

- Token expired or malformed
- Refresh token or login again

---

## 💡 Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (HttpOnly cookies for web)
3. **Validate inputs on frontend** before sending
4. **Handle errors gracefully** with user-friendly messages
5. **Confirm dangerous operations** (especially deletion)
6. **Use strong passwords** (min 6 chars, but longer recommended)

---

## 🎯 Quick Commands

### Start Backend

```bash
cd Backend
uvicorn app.main:app --reload --port 8000
```

### Test Endpoints

```bash
# Test script
python test_user_management.py

# Manual cURL test
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Logs

```bash
# Server logs show request/response details
# Check terminal running uvicorn
```

---

**Need Help?** Check the full documentation files or examine the test script for working examples.
