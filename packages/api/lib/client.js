export function createApiClient({baseUrl, getToken}) {
    async function request(path, options = {}) {
        const token = getToken?.();
        const res = await fetch(`${baseUrl}${path}`,
            { 
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}`} : {}),
                ...(options.headers || {}),
            },
            ...options,
    });
        const data = await res.json().catch(() => null);

        if(!res.ok) {
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
};

}

//Hittar ingen använding av token i övrig kod än men förbereder så att det kan användas senare.
