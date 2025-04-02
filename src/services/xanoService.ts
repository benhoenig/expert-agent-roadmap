import axios from "axios";

// Xano API configuration
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:mN-lWGen";

// Cache configuration
const CACHE_TTL = 60000; // 1 minute cache TTL

// API response cache
const apiCache = {
  _cache: new Map(),
  
  // Get item from cache
  get: function(key) {
    const item = this._cache.get(key);
    if (!item) return null;
    
    // Check if the item has expired
    if (Date.now() > item.expiry) {
      this._cache.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  // Set item in cache with expiry
  set: function(key, value, ttl = CACHE_TTL) {
    const expiry = Date.now() + ttl;
    this._cache.set(key, { value, expiry });
  },
  
  // Generate cache key from method name and params
  generateKey: function(method, params) {
    return `${method}:${JSON.stringify(params)}`;
  },
  
  // Clear entire cache
  clear: function() {
    this._cache.clear();
  }
};

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

  // Helper method to implement timeout on promises
  _fetchWithTimeout: async function(promise, timeoutMs = 20000) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },

  // Helper method to implement retries on API calls
  _fetchWithRetry: async function(apiCall, maxRetries = 2, retryDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Use timeout for each attempt
        return await this._fetchWithTimeout(apiCall());
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
        
        // Don't retry on 4xx errors other than 429 (rate limit)
        if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
          throw error;
        }
        
        // If this wasn't the last attempt, wait before retrying
        if (attempt < maxRetries) {
          // Use longer delays for 429 errors
          const adjustedDelay = error.response && error.response.status === 429 ? retryDelay * 2 : retryDelay;
          console.log(`Retrying in ${adjustedDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, adjustedDelay));
          
          // Increase delay for next retry (exponential backoff)
          retryDelay *= 2;
        }
      }
    }
    
    // If we got here, we exhausted all retries
    throw lastError;
  },

  // Mentor Dashboard - Sales Data
  async getMentorDashboardSales() {
    return this._fetchWithRetry(() => {
      console.log('Fetching mentor dashboard sales data...');
      return xanoApi.get('/mentor_dashboard_sales').then(response => {
        console.log('Mentor dashboard sales response:', response.data);
        return response.data;
      });
    });
  },

  // Mentor Dashboard - Metadata (KPIs, Skillsets, Requirements)
  async getMentorDashboardMetadata() {
    return this._fetchWithRetry(() => {
      console.log('Fetching mentor dashboard metadata...');
      return xanoApi.get('/mentor_dashboard_metadata').then(response => {
        console.log('Mentor dashboard metadata response:', response.data);
        return response.data;
      });
    });
  },

  // Mentor Dashboard - Sales Progress by Week
  async getMentorDashboardSalesProgress(salesId: number, weekNumber: number) {
    return this._fetchWithRetry(() => {
      console.log(`Fetching mentor dashboard sales progress for salesId: ${salesId}, week: ${weekNumber}...`);
      return xanoApi.get(`/mentor_dashboard_sales_progress?sales_id=${salesId}&week_number=${weekNumber}`).then(response => {
        console.log('Mentor dashboard sales progress data:', response.data);
        return response.data;
      });
    });
  },

  // Mentor Dashboard - Sales Target by Week
  async getMentorDashboardSalesTarget(salesId: number, weekNumber: number) {
    return this._fetchWithRetry(() => {
      console.log(`Fetching sales target for salesId: ${salesId}, week: ${weekNumber}...`);
      return xanoApi.get(`/mentor_dashboard_sales_progress/target`, {
        params: {
          sales_id: salesId,
          week_number: weekNumber
        }
      }).then(response => {
        console.log('Sales target data:', response.data);
        return response.data;
      });
    });
  },

  // Cached mentor ID to prevent excessive API calls
  _cachedMentorId: null as number | null,

  // Get current mentor ID from dashboard data
  async getCurrentMentorId() {
    try {
      // Return cached mentor ID if available
      if (this._cachedMentorId !== null) {
        console.log('Using cached mentor ID:', this._cachedMentorId);
        return this._cachedMentorId;
      }
      
      // Fetch dashboard data which contains mentor information
      const dashboardData = await this.getMentorDashboardSales();
      
      // Extract mentor ID from the response
      if (dashboardData && dashboardData.mentor1 && dashboardData.mentor1.id) {
        console.log('Current mentor ID:', dashboardData.mentor1.id);
        // Cache the mentor ID for future use
        this._cachedMentorId = dashboardData.mentor1.id;
        return dashboardData.mentor1.id;
      }
      
      // Log error if mentor ID is not found
      console.error('Could not extract mentor ID from dashboard data');
      throw new Error('Mentor ID not available');
    } catch (error) {
      console.error('Error getting current mentor ID:', error);
      throw error;
    }
  },

  // Update Mentor Dashboard Sales Target
  async updateMentorDashboardSalesTarget(updateData: {
    mentor_id: number;
    sales_id: number;
    week_number: number;
    kpi_id?: number;
    requirement_id?: number;
    target_count: number;
  }) {
    return this._fetchWithRetry(() => {
      console.log('Updating sales target with data:', updateData);
      return xanoApi.post('/mentor_dashboard_sales_progress/target', updateData).then(response => {
        console.log('Update sales target response:', response.data);
        return response.data;
      });
    });
  },

  // Get current sales user data from /sales_interface endpoint
  getSalesInterface: async () => {
    try {
      console.log('Fetching sales interface data for current user...');
      const response = await xanoApi.get('/sales_interface');
      console.log('Sales interface data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales interface data:', error);
      throw error;
    }
  },
  
  // Get metadata for sales interface progress page
  getSalesInterfaceMetadata: async () => {
    console.log('[xanoService] Fetching sales interface metadata');
    const response = await xanoService._fetchWithRetry(() => {
      return xanoApi.get('/sales_interface_metadata').then(response => {
        console.log('[xanoService] Sales interface metadata response:', response.data);
        return response.data;
      });
    });
    return response;
  },
  
  // Get target data for sales interface progress
  getSalesInterfaceTarget: async (salesId: number, weekNumber: number) => {
    // Generate cache key
    const cacheKey = apiCache.generateKey('getSalesInterfaceTarget', { salesId, weekNumber });
    
    // Check cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached target data for sales ID: ${salesId}, week: ${weekNumber}`);
      return cachedData;
    }
    
    return xanoService._fetchWithRetry(() => {
      console.log(`Fetching sales interface target for sales ID: ${salesId}, week: ${weekNumber}...`);
      return xanoApi.get('/sales_interface_progress/target', {
        params: {
          sales_id: salesId,
          week_number: weekNumber 
        }
      }).then(response => {
        console.log('Sales interface target response:', response.data);
        // Cache the response
        apiCache.set(cacheKey, response.data, CACHE_TTL * 5); // 5 minute TTL for target data
        return response.data;
      });
    });
  },
  
  // Get sales interface progress with filtered skillset data
  getSalesInterfaceProgress: async (salesId: number, weekNumber: number) => {
    // Generate cache key
    const cacheKey = apiCache.generateKey('getSalesInterfaceProgress', { salesId, weekNumber });
    
    // Check cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      console.log(`Using cached progress data for sales ID: ${salesId}, week: ${weekNumber}`);
      return cachedData;
    }
    
    return xanoService._fetchWithRetry(() => {
      console.log(`Fetching sales interface progress for sales ID: ${salesId}, week: ${weekNumber}...`);
      return xanoApi.get('/sales_interface_progress', {
        params: {
          sales_id: salesId,
          week_number: weekNumber 
        }
      }).then(response => {
        console.log('Raw sales interface progress response:', response.data);
        
        // Filter skillset data to get only the latest entry for each kpi_id
        if (response.data && response.data.kpi_skillset_progress1 && Array.isArray(response.data.kpi_skillset_progress1)) {
          // Create a map to store the latest entry for each kpi_id
          const latestSkillsetMap = new Map();
          
          // Process each skillset record
          response.data.kpi_skillset_progress1.forEach(record => {
            const kpiId = record.kpi_id;
            
            // If we haven't seen this kpi_id before, or if this record is newer
            if (!latestSkillsetMap.has(kpiId) || 
                record.created_at > latestSkillsetMap.get(kpiId).created_at) {
              latestSkillsetMap.set(kpiId, record);
            }
          });
          
          // Replace the original skillset array with our filtered one
          response.data.kpi_skillset_progress1 = Array.from(latestSkillsetMap.values());
          console.log('Filtered sales interface progress data:', response.data);
        }
        
        // Cache the filtered response
        apiCache.set(cacheKey, response.data);
        return response.data;
      });
    });
  },
  
  // Add KPI Action Progress
  addKpiActionProgress: async (payload: {
    sales_id: number;
    week_number: number;
    kpi_id: number;
    date_added: string;
    count: number;
    remark?: string | null;
    attachment?: any | null;
  }) => {
    console.log('[xanoService] Adding KPI action progress:', payload);
    const response = await xanoService._fetchWithRetry(() => {
      return xanoApi.post('/sales_interface_progress/Action', payload).then(response => {
        console.log('[xanoService] Add KPI action progress response:', response.data);
        return response.data;
      });
    });
    return response;
  },
  
  // Add KPI Skillset Progress
  addKpiSkillsetProgress: async (payload: {
    sales_id: number;
    week_number: number;
    kpi_id: number;
    date_added: string;
    wording_score: number;
    tonality_score: number;
    rapport_score: number;
    total_score: number;
    remark?: string | null;
    attachment?: any | null;
  }) => {
    console.log('[xanoService] Adding KPI skillset progress:', payload);
    const response = await xanoService._fetchWithRetry(() => {
      return xanoApi.post('/sales_interface_progress_skillset', payload).then(response => {
        console.log('[xanoService] Add KPI skillset progress response:', response.data);
        return response.data;
      });
    });
    return response;
  },
  
  // Add Requirement Progress
  addRequirementProgress: async (payload: {
    sales_id: number;
    week_number: number;
    requirement_id: number;
    date_added: string;
    count?: number;
    training_name?: string | null;
    lesson_name?: string | null;
    senior_name?: string | null;
    case_type?: string | null;
    lesson_learned?: string | null;
    remark?: string | null;
    attachment?: any | null;
  }) => {
    console.log('[xanoService] Adding requirement progress:', payload);
    const response = await xanoService._fetchWithRetry(() => {
      return xanoApi.post('/sales_interface_progress_requirement', payload).then(response => {
        console.log('[xanoService] Add requirement progress response:', response.data);
        return response.data;
      });
    });
    return response;
  }
}; 