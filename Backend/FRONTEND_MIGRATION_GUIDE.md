# Frontend Migration Guide - Session Management

## 🎯 Quick Start for Frontend Developers

The backend now uses **HttpOnly cookies** for secure token management. This means tokens are handled automatically - you don't need to manually store or manage them!

---

## 🔄 What Changed?

### Before (Old System)

```javascript
// Login
const response = await fetch("/api/users/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();

// Store token manually
localStorage.setItem("token", token);

// Use token in requests
fetch("/api/videos", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### After (New System)

```javascript
// Login
const response = await fetch("/api/users/login", {
  method: "POST",
  credentials: "include", // ← ADD THIS
  body: JSON.stringify({ email, password }),
});

// Tokens stored in cookies automatically - no manual storage!

// Use cookies in requests
fetch("/api/videos", {
  credentials: "include", // ← ADD THIS
});
```

---

## ✨ One Line Change

**Add `credentials: 'include'` to all your fetch requests!**

That's it! The backend handles everything else automatically.

---

## 📝 Step-by-Step Migration

### 1. Update Login Function

```javascript
// OLD CODE (Remove)
async function login(email, password) {
  const response = await fetch("http://localhost:8000/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const { data } = await response.json();
  localStorage.setItem("token", data.token); // ❌ Remove this
  localStorage.setItem("userId", data.user_id);
  localStorage.setItem("userName", data.name);

  return data;
}

// NEW CODE (Use this)
async function login(email, password) {
  const response = await fetch("http://localhost:8000/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ Add this
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const { data } = await response.json();
  // Store only non-sensitive data
  localStorage.setItem("userId", data.user_id);
  localStorage.setItem("userName", data.name);
  localStorage.setItem("userEmail", data.email);

  return data;
}
```

### 2. Update API Requests

```javascript
// OLD CODE (Remove)
async function fetchVideos() {
  const token = localStorage.getItem("token"); // ❌ Remove

  const response = await fetch("http://localhost:8000/api/videos", {
    headers: {
      Authorization: `Bearer ${token}`, // ❌ Remove
    },
  });

  return response.json();
}

// NEW CODE (Use this)
async function fetchVideos() {
  const response = await fetch("http://localhost:8000/api/videos", {
    credentials: "include", // ✅ Add this
  });

  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }

  return response.json();
}
```

### 3. Update Logout Function

```javascript
// OLD CODE (Remove)
function logout() {
  localStorage.removeItem("token"); // Still good, but not enough
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  window.location.href = "/login";
}

// NEW CODE (Use this)
async function logout() {
  // Call backend to revoke tokens
  await fetch("http://localhost:8000/api/users/logout", {
    method: "POST",
    credentials: "include", // ✅ Add this
  });

  // Clear local storage
  localStorage.clear();
  sessionStorage.clear();

  // Redirect to login
  window.location.href = "/login";
}
```

### 4. Handle Token Expiration (Optional but Recommended)

```javascript
// Create a wrapper for authenticated requests
async function authenticatedFetch(url, options = {}) {
  // Add credentials to options
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshResponse = await fetch(
      "http://localhost:8000/api/users/refresh",
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (refreshResponse.ok) {
      // Token refreshed, retry original request
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    } else {
      // Refresh failed, redirect to login
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  return response;
}

// Use it like this:
const response = await authenticatedFetch("http://localhost:8000/api/videos");
const data = await response.json();
```

---

## 🎨 React Example

### Context Provider (AuthContext.jsx)

```javascript
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");

    if (userId && userName && userEmail) {
      setUser({ id: userId, name: userName, email: userEmail });
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const response = await fetch("http://localhost:8000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ Important
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const { data } = await response.json();

    // Store user info (not tokens!)
    localStorage.setItem("userId", data.user_id);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userEmail", data.email);

    setUser({
      id: data.user_id,
      name: data.name,
      email: data.email,
    });

    return data;
  }

  async function signup(name, email, password) {
    const response = await fetch("http://localhost:8000/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ Important
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw new Error("Signup failed");
    }

    const { data } = await response.json();

    localStorage.setItem("userId", data.user_id);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userEmail", data.email);

    setUser({
      id: data.user_id,
      name: data.name,
      email: data.email,
    });

    return data;
  }

  async function logout() {
    await fetch("http://localhost:8000/api/users/logout", {
      method: "POST",
      credentials: "include", // ✅ Important
    });

    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Using the Auth Context

```javascript
import { useAuth } from "./contexts/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### API Hook

```javascript
import { useState, useEffect } from "react";

function useAuthenticatedFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(url, {
          credentials: "include", // ✅ Important
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Usage:
function VideosPage() {
  const { data, loading, error } = useAuthenticatedFetch(
    "http://localhost:8000/api/videos",
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.videos.map((video) => (
        <div key={video.id}>{video.title}</div>
      ))}
    </div>
  );
}
```

---

## ⚠️ Important Notes

### 1. CORS Configuration

The backend already has proper CORS configured. Your frontend should work automatically if running on:

- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)

### 2. No More localStorage for Tokens

**DO NOT** store `access_token` or `refresh_token` in localStorage anymore. They're in HttpOnly cookies now (more secure).

### 3. What to Store in localStorage

You can still store non-sensitive user data:

- ✅ User ID
- ✅ User name
- ✅ User email
- ✅ User preferences
- ❌ Tokens (handled by cookies)

### 4. Development Setup

If frontend and backend are on different ports, the cookies will still work because both are on `localhost`.

---

## 🧪 Testing Your Changes

### 1. Test Login

```javascript
// Should store cookies automatically
await fetch("http://localhost:8000/api/users/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    email: "test@example.com",
    password: "password123",
  }),
});

// Check cookies in DevTools > Application > Cookies
// You should see: access_token and refresh_token
```

### 2. Test Authenticated Request

```javascript
// Should automatically send cookies
const response = await fetch("http://localhost:8000/api/videos", {
  credentials: "include",
});

// If 200 OK - cookies are working!
// If 401 Unauthorized - something's wrong
```

### 3. Test Logout

```javascript
await fetch("http://localhost:8000/api/users/logout", {
  method: "POST",
  credentials: "include",
});

// Check DevTools > Application > Cookies
// Cookies should be gone
```

---

## 🐛 Troubleshooting

### Cookies Not Being Sent?

**Solution**: Add `credentials: 'include'` to your fetch options

### Still Getting 401?

**Solutions**:

1. Check if you're logged in (check cookies in DevTools)
2. Try logging in again
3. Check browser console for errors

### Cookies Not Visible in DevTools?

**That's normal!** HttpOnly cookies are hidden from JavaScript for security. They still work.

### CORS Error?

**Solution**: Backend is configured for localhost:5173 and localhost:3000. If using different port, let backend team know.

---

## ✅ Migration Checklist

- [ ] Add `credentials: 'include'` to all fetch requests
- [ ] Remove manual token storage from localStorage
- [ ] Update login function
- [ ] Update logout function
- [ ] Update API request functions
- [ ] Test login flow
- [ ] Test API requests
- [ ] Test logout flow
- [ ] Remove old token-related code
- [ ] Update documentation/comments

---

## 🎉 Benefits After Migration

✅ **More Secure** - Tokens safe from XSS attacks  
✅ **Simpler Code** - No manual token management  
✅ **Better UX** - Users stay logged in longer  
✅ **Auto-Refresh** - Tokens refresh automatically  
✅ **Instant Logout** - Proper session termination

---

## 📞 Need Help?

Check the comprehensive documentation:

- [SESSION_MANAGEMENT.md](SESSION_MANAGEMENT.md) - Complete guide
- [SESSION_QUICK_REFERENCE.md](SESSION_QUICK_REFERENCE.md) - Quick reference

---

**Happy Coding! 🚀**
