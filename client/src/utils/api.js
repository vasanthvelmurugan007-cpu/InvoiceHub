export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        // Return a mock response object to prevent errors in promise chains (.json() etc)
        return new Response(JSON.stringify({ error: 'Unauthorized', data: null }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return response;
};
