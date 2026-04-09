const BASE_URL = "http://localhost:8000/api";

export const forgotPassword = async (email) => {
  const response = await fetch(`${BASE_URL}/users/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to send OTP");
  }

  return data;
};

export const verifyResetOtp = async (email, otp) => {
  const response = await fetch(`${BASE_URL}/users/verify-reset-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to verify OTP");
  }

  return data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${BASE_URL}/users/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      new_password: newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to reset password");
  }

  return data;
};
