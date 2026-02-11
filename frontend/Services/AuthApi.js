const BASE_URL = "http://localhost:8000/api";

export const signupUser = async (data) => {
  const res = await fetch(`${BASE_URL}/users/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Signup failed");
  }

  return result;
};

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Login failed");
  }

  return result;
};

export const requestReactivationCode = async (data) => {
  const res = await fetch(`${BASE_URL}/users/reactivate/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || result.message || "Unable to send code");
  }

  return result;
};

export const verifyReactivationCode = async (data) => {
  const res = await fetch(`${BASE_URL}/users/reactivate/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || result.message || "Reactivation failed");
  }

  return result;
};
