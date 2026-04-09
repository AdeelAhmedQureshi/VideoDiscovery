const API_HEALTH_URL = "http://localhost:8000/api/health";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkBackendHealth(requestTimeoutMs = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(API_HEALTH_URL, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { reachable: false, ready: false, reason: `HTTP ${response.status}` };
    }

    const payload = await response.json();
    const ready = payload?.ready === true || payload?.status === "ok";

    return {
      reachable: true,
      ready,
      startupStatus: payload?.startup_status || null,
      payload,
    };
  } catch (error) {
    return {
      reachable: false,
      ready: false,
      reason: error?.name === "AbortError" ? "Health check timed out" : "Network error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function waitForBackendReady({
  maxWaitMs = 120000,
  pollIntervalMs = 2500,
  requestTimeoutMs = 3000,
} = {}) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < maxWaitMs) {
    const result = await checkBackendHealth(requestTimeoutMs);

    if (result.reachable && result.ready) {
      return { ready: true, ...result };
    }

    await sleep(pollIntervalMs);
  }

  return {
    ready: false,
    reachable: false,
    reason: "Backend did not become ready in time",
  };
}
