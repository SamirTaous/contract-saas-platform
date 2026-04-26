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
    (response) => {
      return response;
    },
    (error) => {
      // Check if error is due to token expiration
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Token is expired or invalid
        console.log('Authentication error detected, clearing session...');
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Dispatch custom event to notify auth context
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        // Redirect to login page
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
      
      return Promise.reject(error);
    }
  );

  return apiInstance;
};