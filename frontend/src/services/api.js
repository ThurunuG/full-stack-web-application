import axios from 'axios';

const api = axios.create({
  // Route all API requests through the frontend proxy.
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the current access token to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track an active refresh so concurrent failed requests share one refresh call.
let isRefreshing = false;
let failedQueue = [];

// Resolve or reject requests that were waiting for the refreshed token.
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Refresh only once for protected requests; auth endpoints must not recurse.
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/')
    ) {
      if (isRefreshing) {
        // Pause concurrent requests until the in-progress refresh completes.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // Without a refresh token, the session cannot be recovered.
        localStorage.clear();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Use a separate Axios request so the refresh call does not trigger this interceptor.
        const res = await axios.post('/api/auth/refresh-token', { refreshToken });
        const { accessToken } = res.data;

        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        // Clear the session and redirect when the refresh token is invalid or expired.
        processQueue(refreshErr, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
