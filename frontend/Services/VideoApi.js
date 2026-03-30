const BASE_URL = "http://localhost:8000/api";

/**
 * Fetch all AI-recommended videos with ratings >= 3
 * These are videos recommended by the system based on user's uploads
 */
export const getRecommendedVideos = async (minRating = 3) => {
  const token = localStorage.getItem("token");
  
  const res = await fetch(
    `${BASE_URL}/videos/user/recommended-videos?min_rating=${minRating}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Failed to fetch recommended videos");
  }

  return result;
};

/**
 * Fetch all user's videos with ratings >= 3 (historical rated videos by user)
 */
export const getRatedVideos = async (minRating = 3) => {
  const token = localStorage.getItem("token");
  
  const res = await fetch(
    `${BASE_URL}/videos/user/rated-videos?min_rating=${minRating}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Failed to fetch rated videos");
  }

  return result;
};

/**
 * Fetch all user's videos (unfiltered)
 */
export const getUserVideos = async () => {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${BASE_URL}/videos/user/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Failed to fetch user videos");
  }

  return result;
};

/**
 * Fetch user's video history with recommendations and feedback
 */
export const getUserVideoHistory = async () => {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${BASE_URL}/videos/user/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Failed to fetch video history");
  }

  return result;
};

/**
 * Get details of a specific video
 */
export const getVideoDetails = async (videoId) => {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${BASE_URL}/videos/${videoId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Failed to fetch video details");
  }

  return result;
};

/**
 * Submit or update feedback for a video
 */
export const submitVideoFeedback = async (videoId, rating, comment = null) => {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${BASE_URL}/feedback/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({
      video_id: videoId,
      rating: rating,
      comment: comment,
    }),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Failed to submit feedback");
  }

  return result;
};

/**
 * Delete a video
 */
export const deleteVideo = async (videoId) => {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${BASE_URL}/videos/${videoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Failed to delete video");
  }

  return result;
};
