import axios from 'axios';
import { toast } from 'sonner';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Check if the backend responded with an error (e.g. 400 Bad Request)
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (status === 401 || status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_id");
        toast.error("Session expired or forbidden. Please login again.");
        window.location.href = "/login";
        return Promise.reject(error);
      }
      
      // If the backend sent a message in its JSON response {status, message, data}
      if (responseData && responseData.message) {
        toast.error(responseData.message);
      } else {
        // Fallback message if no specific message is provided
        toast.error("An error occurred during the request.");
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error(error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
