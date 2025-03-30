import axios from "axios";

// Xano API configuration
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:mN-lWGen";

// Helper function to get the token from storage
const getAuthToken = () => {
  // Check localStorage first, then sessionStorage
  return localStorage.getItem("xano_token") || sessionStorage.getItem("xano_token") || null;
};

// Create an axios instance with the base URL
const xanoApi = axios.create({
  baseURL: XANO_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
xanoApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API service functions
export const xanoService = {
  // Authentication
  signup: async (userData: {
    username: string;
    email: string;
    password: string;
    nickname?: string;
    full_name?: string;
    role: string;
  }) => {
    try {
      console.log("Signup request payload:", userData);
      const response = await xanoApi.post("/auth/signup", userData);
      
      // Validate the response contains the expected data
      if (!response.data || !response.data.authToken) {
        throw new Error("Invalid response from server: Missing authentication token");
      }
      
      // Store the auth token in localStorage by default for signup
      localStorage.setItem("xano_token", response.data.authToken);
      return response.data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },
  
  login: async (credentials: { username: string; password: string }) => {
    try {
      console.log('Attempting login with:', { username: credentials.username });
      const response = await xanoApi.post("/auth/login", credentials);
      if (!response.data || !response.data.authToken) {
        throw new Error("Invalid response from server: Missing authentication token");
      }
      // Token storage is handled in the component based on "Remember Me" checkbox
      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Provide more specific error messages based on the error status
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        // If the server returns a 500 error for invalid credentials
        // We'll transform it to a more appropriate credential error message
        if (error.response.status === 500) {
          throw new Error("Invalid username or password. Please try again.");
        }
      }
      
      throw error;
    }
  },
  
  // Logout function
  logout: () => {
    // Clear token from both storage locations
    localStorage.removeItem("xano_token");
    sessionStorage.removeItem("xano_token");
  },
  
  // Get current user data
  getUserData: async () => {
    try {
      // This endpoint should return the current user's data based on the auth token
      const response = await xanoApi.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Get user data error:", error);
      throw error;
    }
  },
  
  // User operations
  getUsers: async () => {
    try {
      const response = await xanoApi.get("/user");
      return response.data;
    } catch (error) {
      console.error("Get users error:", error);
      throw error;
    }
  },
  
  getUserById: async (id: number) => {
    try {
      const response = await xanoApi.get(`/user/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },
  
  // Test function to check if the API is working
  testConnection: async () => {
    try {
      const response = await xanoApi.get("/user");
      return {
        success: true,
        message: "Connection successful",
        data: response.data
      };
    } catch (error) {
      console.error("API connection test failed:", error);
      return {
        success: false,
        message: "Connection failed",
        error
      };
    }
  },
  
  // Admin user management
  getAdminUsers: async () => {
    try {
      const response = await xanoApi.get("/admin_user");
      return response.data;
    } catch (error) {
      console.error("Get admin users error:", error);
      throw error;
    }
  },
  
  getUserForEditModal: async (userId: number) => {
    try {
      const response = await xanoApi.get(`/admin_user_edit_modal?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Get user for edit modal error:", error);
      throw error;
    }
  },

  // Add the updateUserDetails method before the deleteUser method
  updateUserDetails: async (userId: number, userData: any) => {
    try {
      // Log the data being sent to the API for debugging
      console.log("Calling updateUserDetails with data:", userData);
      
      // No need to add user_id here since we're including it in the userData now
      const response = await xanoApi.put(`/admin_user_edit_modal`, userData);
      
      return response.data;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  },

  // Add a dedicated method for updating password
  updateUserPassword: async (userId: number, password: string) => {
    try {
      const response = await xanoApi.put(`/admin_user_edit_modal_password`, {
        user_id: userId,
        password: password
      });
      return response.data;
    } catch (error) {
      console.error("Update password error:", error);
      throw error;
    }
  },

  // Add method for creating a new user
  createUser: async (userData: any) => {
    try {
      console.log("Creating user with data:", userData);
      
      // Use the /admin_user_create endpoint that's been set up on the backend
      const response = await xanoApi.post(`/admin_user_create`, userData);
      return response.data;
    } catch (error: any) {
      console.error("Create user error:", error);
      // Log the full error response if available
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      throw error;
    }
  },

  // Add the deleteUser method
  deleteUser: async (userId: number): Promise<void> => {
    const response = await fetch(`${XANO_BASE_URL}/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  },

  // Mentor Sales Assignment
  async getMentorSalesAssignments() {
    try {
      console.log('Fetching mentor sales assignments...');
      const response = await xanoApi.get('/mentor_sales_assign');
      console.log('Mentor sales assignments data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching mentor sales assignments:', error);
      throw error;
    }
  },

  async getMentorsList() {
    try {
      console.log('Fetching available mentors list...');
      const response = await xanoApi.get('/mentor_sales_assign_select');
      console.log('Mentors list response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching mentors list:', error);
      throw error;
    }
  },

  async assignMentorToSales(salesId: number, mentorId: number) {
    try {
      const payload = {
        sales_id: salesId,
        mentor_id: mentorId
      };
      
      console.log('Assigning mentor to sales with payload:', payload);
      const response = await xanoApi.post('/mentor_sales_assign_select', payload);
      console.log('Mentor assignment raw response:', response);
      console.log('Mentor assignment response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error assigning mentor to sales:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  async unassignMentor(salesId: number) {
    try {
      const payload = {
        sales_id: salesId
      };
      
      console.log('Unassigning mentor with payload:', payload);
      const response = await xanoApi.post(`/mentor_sales_assign_select/unassign`, payload);
      console.log('Mentor unassignment response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error unassigning mentor:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Mentor Dashboard - My Sales
  async getMentorDashboardSales() {
    try {
      console.log('Fetching mentor dashboard sales data...');
      const response = await xanoApi.get('/mentor_dashboard_sales');
      console.log('Mentor dashboard sales response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching mentor dashboard sales:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }
}; 