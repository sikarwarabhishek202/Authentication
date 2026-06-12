/**
 * API Wrapper for SecureAuth 2.0 Backend endpoints.
 * Handles automatic JWT injection and base configurations.
 */
const API = (() => {
    const BASE_URL = '/api';
    const TOKEN_KEY = 'secure_auth_token';

    // Helper: Get JWT token from storage
    const getToken = () => localStorage.getItem(TOKEN_KEY);

    // Helper: Save JWT token to storage
    const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

    // Helper: Remove JWT token from storage
    const removeToken = () => localStorage.removeItem(TOKEN_KEY);

    // Helper: Check if token exists
    const isAuthenticated = () => !!getToken();

    /**
     * Core request helper that wraps fetch, injection of JWT, and error handling.
     * @param {string} endpoint - API route (e.g. '/auth/login')
     * @param {object} options - Fetch configuration options
     */
    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        
        // Prepare headers
        options.headers = options.headers || {};
        
        // Inject Authorization Bearer token if available
        const token = getToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        // Auto-set JSON content-type if body is JSON
        if (options.body && !(options.body instanceof FormData) && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
            if (typeof options.body === 'object') {
                options.body = JSON.stringify(options.body);
            }
        }

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            if (!response.ok) {
                // Return standard error payload structure
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    }

    return {
        getToken,
        setToken,
        removeToken,
        isAuthenticated,

        // Authentication calls
        login: async (username, password) => {
            const data = await request('/auth/login', {
                method: 'POST',
                body: { username, password }
            });
            if (data.accessToken) {
                setToken(data.accessToken);
            }
            return data;
        },

        register: async (username, email, password, role) => {
            return await request('/auth/register', {
                method: 'POST',
                body: { username, email, password, role }
            });
        },

        // Home Page Dashboard details
        getWelcomeData: async () => {
            return await request('/home/welcome');
        },

        // Cloudinary Image gallery calls
        getImages: async () => {
            return await request('/image/get');
        },

        uploadImage: async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            
            return await request('/image/upload', {
                method: 'POST',
                body: formData
            });
        },

        // Protected Admin route
        getAdminData: async () => {
            return await request('/admin/welcome');
        }
    };
})();
