export function createApiClient({ baseUrl, getToken }) {
  async function request(path, options = {}) {
    const token = getToken?.();
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || `API error ${res.status}`);
    }
    return data;
  }
  return {
    get: (path) => request(path),
    post: (path, body) =>
      request(path, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    postForm: (path, formData) =>
      request(path, {
        method: "POST",
        body: formData,
      }),
    put: (path, body) =>
      request(path, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    patch: (path, body) =>
      request(path, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: (path) =>
      request(path, {
        method: "DELETE",
      }),
  };
}

//Hittar ingen använding av token i övrig kod än men förbereder så att det kan användas senare.
