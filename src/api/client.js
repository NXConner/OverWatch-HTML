async function parseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export function createApiClient(baseUrl = "/api") {
  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await parseJson(response);
    if (!response.ok) {
      const message = data?.error || response.statusText || "Request failed";
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  return {
    request,
    get: (path) => request(path),
    post: (path, body) =>
      request(path, {
        method: "POST",
        body: JSON.stringify(body || {}),
      }),
    patch: (path, body) =>
      request(path, {
        method: "PATCH",
        body: JSON.stringify(body || {}),
      }),
    put: (path, body) =>
      request(path, {
        method: "PUT",
        body: JSON.stringify(body || {}),
      }),
    delete: (path) =>
      request(path, {
        method: "DELETE",
      }),
  };
}
