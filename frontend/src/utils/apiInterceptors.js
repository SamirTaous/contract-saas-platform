// Utility function to set up authentication and error handling interceptors for any axios instance
export const setupApiInterceptors = (apiInstance) => {
  // Request interceptor to add JWT token
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor to handle token expiration
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      // 401 = invalid or expired session. 403 = authenticated but not allowed — keep the session.
      if (status === 401 && !isAuthEndpoint) {
        console.log('Session expired or invalid, clearing session...');

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      return Promise.reject(error);
    }
  );

  return apiInstance;
};