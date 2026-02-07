# User Management Architecture & Flow Diagrams

Visual representation of the user management system architecture and data flows.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  (Browser/Mobile App with JWT Token)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS + Bearer Token / Cookie
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Authentication Middleware                   │    │
│  │  (get_current_user dependency)                     │    │
│  │  - Verify JWT token                                │    │
│  │  - Extract user_id                                 │    │
│  │  - Return decoded payload                          │    │
│  └───────────────────┬────────────────────────────────┘    │
│                      │                                       │
│                      ▼                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Route Handlers                            │    │
│  │  (user_routes.py)                                  │    │
│  │                                                     │    │
│  │  • GET  /me                                        │    │
│  │  • PUT  /update-name                               │    │
│  │  • PUT  /update-email                              │    │
│  │  • PUT  /update-password                           │    │
│  │  • DELETE /delete-account                          │    │
│  │  • GET  /account-stats                             │    │
│  └───────────────────┬────────────────────────────────┘    │
│                      │                                       │
│                      ▼                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Validation Layer                            │    │
│  │  (Pydantic Schemas)                                │    │
│  │  - UpdateName                                      │    │
│  │  - UpdateEmail                                     │    │
│  │  - UpdatePassword                                  │    │
│  │  - DeleteAccount                                   │    │
│  └───────────────────┬────────────────────────────────┘    │
│                      │                                       │
│                      ▼                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Business Logic                              │    │
│  │  - Password verification (bcrypt)                  │    │
│  │  - Email uniqueness check                          │    │
│  │  - Data validation                                 │    │
│  │  - Session management                              │    │
│  └───────────────────┬────────────────────────────────┘    │
│                      │                                       │
│                      ▼                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Database Layer                              │    │
│  │  (MongoDB via Motor)                               │    │
│  │  - Async operations                                │    │
│  │  - CRUD operations                                 │    │
│  │  - Cascade deletions                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS                             │
│                                                              │
│  Collections:                                               │
│  • users                                                    │
│  • videos                                                   │
│  • feedback                                                 │
│  • recommendations                                          │
│  • refresh_tokens                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────┐                                      ┌─────────┐
│ Client  │                                      │ Backend │
└────┬────┘                                      └────┬────┘
     │                                                │
     │  1. Request with Token                         │
     │  Authorization: Bearer <token>                 │
     ├───────────────────────────────────────────────►│
     │                                                │
     │                                   2. Verify JWT│
     │                                    decode_token│
     │                                                │
     │                          3. Extract user_id    │
     │                             from token payload │
     │                                                │
     │  4. Return user data                           │
     │◄───────────────────────────────────────────────┤
     │                                                │
```

---

## Update Name Flow

```
┌─────────┐                  ┌─────────┐                  ┌──────────┐
│ Client  │                  │ Backend │                  │ Database │
└────┬────┘                  └────┬────┘                  └────┬─────┘
     │                            │                             │
     │ 1. PUT /update-name        │                             │
     │    {name: "New Name"}      │                             │
     ├───────────────────────────►│                             │
     │                            │                             │
     │                            │ 2. Verify JWT               │
     │                            │                             │
     │                            │ 3. Validate name            │
     │                            │    (not empty)              │
     │                            │                             │
     │                            │ 4. Update user              │
     │                            ├────────────────────────────►│
     │                            │                             │
     │                            │ 5. Confirm update           │
     │                            │◄────────────────────────────┤
     │                            │                             │
     │ 6. Success response        │                             │
     │◄───────────────────────────┤                             │
     │                            │                             │
```

---

## Update Email Flow (with Password Verification)

```
┌─────────┐           ┌─────────┐           ┌──────────┐
│ Client  │           │ Backend │           │ Database │
└────┬────┘           └────┬────┘           └────┬─────┘
     │                     │                      │
     │ 1. PUT /update-email│                      │
     │    {email, password}│                      │
     ├────────────────────►│                      │
     │                     │                      │
     │                     │ 2. Verify JWT        │
     │                     │                      │
     │                     │ 3. Get user from DB  │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 4. User data         │
     │                     │◄─────────────────────┤
     │                     │                      │
     │                     │ 5. Verify password   │
     │                     │    (bcrypt.checkpw)  │
     │                     │                      │
     │                     │ 6. Check email exists│
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 7. Email available?  │
     │                     │◄─────────────────────┤
     │                     │                      │
     │                     │ 8. Update email      │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 9. Confirm update    │
     │                     │◄─────────────────────┤
     │                     │                      │
     │ 10. Success         │                      │
     │◄────────────────────┤                      │
     │                     │                      │
```

---

## Update Password Flow (with Session Invalidation)

```
┌─────────┐           ┌─────────┐           ┌──────────┐
│ Client  │           │ Backend │           │ Database │
└────┬────┘           └────┬────┘           └────┬─────┘
     │                     │                      │
     │ 1. PUT /update-pass │                      │
     │    {current, new}   │                      │
     ├────────────────────►│                      │
     │                     │                      │
     │                     │ 2. Verify JWT        │
     │                     │                      │
     │                     │ 3. Get user          │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 4. User data         │
     │                     │◄─────────────────────┤
     │                     │                      │
     │                     │ 5. Verify current    │
     │                     │    password          │
     │                     │                      │
     │                     │ 6. Hash new password │
     │                     │    (bcrypt)          │
     │                     │                      │
     │                     │ 7. Update password   │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 8. Delete all        │
     │                     │    refresh_tokens    │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 9. Clear cookies     │
     │                     │                      │
     │ 10. Logout response │                      │
     │     (all devices)   │                      │
     │◄────────────────────┤                      │
     │                     │                      │
     │ 11. Must login again│                      │
     │                     │                      │
```

---

## Delete Account Flow (with Cascade Deletion)

```
┌─────────┐           ┌─────────┐           ┌──────────┐
│ Client  │           │ Backend │           │ Database │
└────┬────┘           └────┬────┘           └────┬─────┘
     │                     │                      │
     │ 1. DELETE /account  │                      │
     │    {password,       │                      │
     │     confirmation}   │                      │
     ├────────────────────►│                      │
     │                     │                      │
     │                     │ 2. Verify JWT        │
     │                     │                      │
     │                     │ 3. Get user          │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 4. User data         │
     │                     │◄─────────────────────┤
     │                     │                      │
     │                     │ 5. Verify password   │
     │                     │                      │
     │                     │ 6. Check confirmation│
     │                     │    === "DELETE"      │
     │                     │                      │
     │                     │ 7. Delete videos     │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 8. Delete feedback   │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 9. Delete recommends │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 10. Delete tokens    │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 11. Delete user      │
     │                     ├─────────────────────►│
     │                     │                      │
     │                     │ 12. Clear cookies    │
     │                     │                      │
     │ 13. Success         │                      │
     │     (account gone)  │                      │
     │◄────────────────────┤                      │
     │                     │                      │
```

---

## Security Layers

```
┌──────────────────────────────────────────────────────────┐
│                    Security Layers                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Layer 1: Transport Security                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • HTTPS encryption                                 │  │
│  │ • TLS 1.2+ required                                │  │
│  │ • Secure headers                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  Layer 2: Authentication                                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • JWT token verification                           │  │
│  │ • Token expiration check                           │  │
│  │ • Bearer/Cookie support                            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  Layer 3: Authorization                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • User owns resource                               │  │
│  │ • user_id verification                             │  │
│  │ • Permission checks                                │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  Layer 4: Input Validation                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • Pydantic schemas                                 │  │
│  │ • Type checking                                    │  │
│  │ • Field validators                                 │  │
│  │ • Format validation                                │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  Layer 5: Business Logic Security                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • Password verification (bcrypt)                   │  │
│  │ • Email uniqueness                                 │  │
│  │ • Double confirmation (DELETE)                     │  │
│  │ • Strength validation                              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  Layer 6: Data Security                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • Password hashing (bcrypt)                        │  │
│  │ • No password in responses                         │  │
│  │ • Secure session management                        │  │
│  │ • HttpOnly cookies                                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow - Get Account Statistics

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Backend │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                           │
     │ 1. GET /account-stats    │                           │
     ├─────────────────────────►│                           │
     │                          │                           │
     │                          │ 2. Verify JWT             │
     │                          │                           │
     │                          │ 3. Count videos           │
     │                          ├──────────────────────────►│
     │                          │                           │
     │                          │ 4. Video count            │
     │                          │◄──────────────────────────┤
     │                          │                           │
     │                          │ 5. Count feedback         │
     │                          ├──────────────────────────►│
     │                          │                           │
     │                          │ 6. Feedback count         │
     │                          │◄──────────────────────────┤
     │                          │                           │
     │                          │ 7. Count recommendations  │
     │                          ├──────────────────────────►│
     │                          │                           │
     │                          │ 8. Recommendation count   │
     │                          │◄──────────────────────────┤
     │                          │                           │
     │                          │ 9. Get user info          │
     │                          ├──────────────────────────►│
     │                          │                           │
     │                          │ 10. User data             │
     │                          │◄──────────────────────────┤
     │                          │                           │
     │ 11. Statistics response  │                           │
     │◄─────────────────────────┤                           │
     │                          │                           │
```

---

## Error Handling Flow

```
┌─────────┐                ┌─────────┐
│ Client  │                │ Backend │
└────┬────┘                └────┬────┘
     │                          │
     │ 1. Request               │
     ├─────────────────────────►│
     │                          │
     │                          │ 2. Try operation
     │                          │    ├─ Success ─┐
     │                          │    │           │
     │                          │    │  ┌────────▼──────┐
     │                          │    │  │ Return 200    │
     │                          │    │  │ Success data  │
     │                          │    │  └────────┬──────┘
     │                          │    │           │
     │                          │    └─ Error ───┘
     │                          │          │
     │                          │  ┌───────▼──────────┐
     │                          │  │ Catch Exception  │
     │                          │  └───────┬──────────┘
     │                          │          │
     │                          │  ┌───────▼──────────┐
     │                          │  │ Check error type │
     │                          │  └───────┬──────────┘
     │                          │          │
     │                          │  ┌───────▼──────────────────┐
     │                          │  │ HTTPException            │
     │                          │  │ • 400 - Bad Request      │
     │                          │  │ • 401 - Unauthorized     │
     │                          │  │ • 404 - Not Found        │
     │                          │  │ • 500 - Server Error     │
     │                          │  └───────┬──────────────────┘
     │                          │          │
     │ 3. Error response        │  ┌───────▼──────────┐
     │    {detail: "message"}   │  │ Return error     │
     │◄─────────────────────────┤◄─┤ with status code │
     │                          │  └──────────────────┘
     │                          │
```

---

## Password Security Flow

```
┌──────────────────────────────────────────────────────────┐
│              Password Security Pipeline                   │
└──────────────────────────────────────────────────────────┘

  Plain Password                                 Hashed Password
  "myPassword123"                                "$2b$12$..."
       │                                              │
       │ 1. User Input                                │
       ├──────────────────────►                       │
       │                                              │
       │ 2. Validation                                │
       │    • Length >= 6                             │
       │    • Not empty                               │
       │    • Format check                            │
       ├──────────────────────►                       │
       │                                              │
       │ 3. Bcrypt Hash                               │
       │    • Generate salt                           │
       │    • Hash password                           │
       │    • 12 rounds                               │
       ├──────────────────────────────────────────────►
       │                                              │
       │                    4. Store in DB            │
       │                    (never store plain)       │
       │                                              │
       │ 5. Verification (login/update)               │
       │    • Get hashed from DB                      │
       │    • Compare with bcrypt                     │
       │    • Return true/false                       │
       │◄─────────────────────────────────────────────┤
       │                                              │
```

---

## Session Management

```
┌────────────────────────────────────────────────────────────┐
│                   Session Lifecycle                         │
└────────────────────────────────────────────────────────────┘

    Login/Signup             Active Session          Logout/Expiry
         │                        │                        │
         ├────────────────────────┼────────────────────────►
         │                        │                        │
    ┌────▼────┐           ┌───────▼───────┐        ┌──────▼─────┐
    │ Create  │           │  Use Access   │        │  Invalidate│
    │ Tokens: │           │  Token for    │        │  Tokens:   │
    │         │           │  API Calls    │        │            │
    │ • Access│──────────►│               │───────►│ • Clear    │
    │   Token │           │  Refresh      │        │   Cookies  │
    │   (15m) │           │  if expired   │        │ • Delete   │
    │         │           │               │        │   Refresh  │
    │ • Refresh│──────────►│               │───────►│   Tokens   │
    │   Token │           │               │        │            │
    │   (7d)  │           │               │        │            │
    └─────────┘           └───────────────┘        └────────────┘
         │                        │                        │
         │                        │                        │
    Set Cookies           Auto Refresh             Clear Session
```

---

## Request/Response Format

```
┌──────────────────────────────────────────────────────────┐
│                  Request Format                           │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Headers:                                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Authorization: Bearer <access_token>               │ │
│  │ Content-Type: application/json                     │ │
│  │ Cookie: access_token=<token>; refresh_token=<token>│ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  Body (JSON):                                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ {                                                  │ │
│  │   "field1": "value1",                             │ │
│  │   "field2": "value2"                              │ │
│  │ }                                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  Success Response                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Status: 200 OK                                          │
│                                                           │
│  Body (JSON):                                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ {                                                  │ │
│  │   "success": true,                                │ │
│  │   "message": "Operation successful",              │ │
│  │   "data": {                                       │ │
│  │     ...                                           │ │
│  │   }                                               │ │
│  │ }                                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  Error Response                           │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Status: 400 / 401 / 404 / 500                           │
│                                                           │
│  Body (JSON):                                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ {                                                  │ │
│  │   "detail": "Error message description"           │ │
│  │ }                                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Component Dependencies

```
┌──────────────────────────────────────────────────────────┐
│              Dependency Graph                             │
└──────────────────────────────────────────────────────────┘

main.py
  │
  └─► user_routes.py
        │
        ├─► user_schema.py
        │     │
        │     └─► pydantic (external)
        │
        ├─► jwt_handler.py
        │     │
        │     ├─► jwt (external)
        │     └─► config.py
        │
        ├─► password_hasher.py
        │     │
        │     └─► bcrypt (external)
        │
        ├─► database.py
        │     │
        │     ├─► motor (external)
        │     └─► config.py
        │
        └─► auth_service.py
              │
              ├─► password_hasher.py
              ├─► jwt_handler.py
              └─► database.py
```

---

## Summary

This architecture provides:

✅ **Layered Security**: Multiple security checks at each layer  
✅ **Clear Separation**: Routes → Validation → Logic → Database  
✅ **Async Operations**: Non-blocking I/O for better performance  
✅ **Error Handling**: Comprehensive error handling at each layer  
✅ **Session Management**: Secure token-based authentication  
✅ **Data Integrity**: Cascade deletions maintain database consistency  
✅ **Modular Design**: Easy to extend and maintain

For implementation details, see:

- [USER_MANAGEMENT_API.md](USER_MANAGEMENT_API.md)
- [USER_MANAGEMENT_IMPLEMENTATION.md](USER_MANAGEMENT_IMPLEMENTATION.md)
