// Express Backend Client - Replaces Base44 SDK
// Maintains exact API compatibility with Base44 SDK interface

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Generic API request handler with JWT authentication
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(options.headers || {})
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error.message || 'Network error', 0, error);
  }
}

// Smart API request that tries public route first if not authenticated
async function smartApiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  // If no token and this is a GET request, try public route first
  if (!token && (!options.method || options.method === 'GET')) {
    try {
      return await apiRequest(`/public${endpoint}`, options);
    } catch (error) {
      // If public route fails, fall back to regular route
      console.log('Public route failed, trying authenticated route:', error.message);
    }
  }
  
  // Use regular authenticated route
  return await apiRequest(endpoint, options);
}

// Entity class factory - creates CRUD operations for each entity
function createEntity(entityName) {
  const endpoint = `/${entityName.toLowerCase()}`;
  
  return {
    async create(data) {
      return await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async list(sort = '-created_date', limit = 50) {
      const params = new URLSearchParams();
      if (sort) params.append('sort', sort);
      if (limit) params.append('limit', limit.toString());
      
      return await smartApiRequest(`${endpoint}?${params}`);
    },

    async get(id) {
      return await smartApiRequest(`${endpoint}/${id}`);
    },

    async update(id, data) {
      return await apiRequest(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async delete(id) {
      return await apiRequest(`${endpoint}/${id}`, {
        method: 'DELETE'
      });
    },

    async filter(conditions, sort = '-created_date', limit = 50) {
      const params = new URLSearchParams();
      
      // Convert filter conditions to query parameters
      Object.entries(conditions).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value.toString());
        }
      });
      
      if (sort) params.append('sort', sort);
      if (limit) params.append('limit', limit.toString());
      
      return await smartApiRequest(`${endpoint}?${params}`);
    }
  };
}

// Authentication service
const auth = {
  async login(email, password) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
    }
    
    return result;
  },

  async signup(userData) {
    const result = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
    }
    
    return result;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  async me() {
    return await apiRequest('/auth/me');
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
};

// Integration services
const integrations = {
  Core: {
    async UploadFile(file, options = {}) {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/integrations/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `Upload failed: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    },

    async InvokeLLM(prompt, options = {}) {
      return await apiRequest('/integrations/llm', {
        method: 'POST',
        body: JSON.stringify({ prompt, ...options })
      });
    },

    async SendEmail(to, subject, body, options = {}) {
      return await apiRequest('/integrations/email', {
        method: 'POST',
        body: JSON.stringify({ to, subject, body, ...options })
      });
    },

    async GenerateImage(prompt, options = {}) {
      return await apiRequest('/integrations/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt, ...options })
      });
    },

    async ExtractDataFromUploadedFile(fileUrl, options = {}) {
      return await apiRequest('/integrations/extract-data', {
        method: 'POST',
        body: JSON.stringify({ fileUrl, ...options })
      });
    }
  }
};

// Create client with entities matching Base44 SDK structure
export function createClient(options = {}) {
  // Validate authentication if required
  if (options.requiresAuth && !auth.isAuthenticated()) {
    console.warn('Client requires authentication but no token found');
  }

  return {
    entities: {
      Baker: createEntity('bakers'),
      Customer: createEntity('customers'),
      Order: createEntity('orders'),
      Gallery: createEntity('gallery'),
      Theme: createEntity('themes'),
      Message: createEntity('messages'),
      GalleryInquiry: createEntity('gallery-inquiries')
    },
    auth,
    integrations,
    
    // Utility methods
    async healthCheck() {
      return await apiRequest('/health').catch(() => ({ status: 'error' }));
    },

    setApiUrl(url) {
      // Allow dynamic API URL changes if needed
      process.env.REACT_APP_API_URL = url;
    }
  };
}

// Export individual components for convenience
export { APIError, auth, integrations };