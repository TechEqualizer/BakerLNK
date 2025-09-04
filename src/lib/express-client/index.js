// Supabase-Only Client - Direct Supabase Integration
// Maintains exact API compatibility with Base44 SDK interface

import { api as supabaseApi } from '../supabase-client.js';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Entity class factory - creates CRUD operations for each entity
function createEntity(entityName) {
  return {
    async create(data) {
      switch (entityName) {
        case 'bakers':
          return await supabaseApi.createBaker(data);
        case 'gallery':
          return await supabaseApi.createGalleryItem(data);
        case 'orders':
          return await supabaseApi.createOrder(data);
        case 'customers':
          return await supabaseApi.createCustomer(data);
        case 'messages':
          return await supabaseApi.createMessage(data);
        case 'gallery-inquiries':
          return await supabaseApi.createGalleryInquiry(data);
        default:
          throw new APIError(`Unknown entity: ${entityName}`, 400);
      }
    },

    async list(sort = '-created_date', limit = 50) {
      switch (entityName) {
        case 'bakers':
          return await supabaseApi.getBakers();
        case 'gallery':
          return await supabaseApi.getGallery();
        case 'themes':
          return await supabaseApi.getThemes();
        case 'orders':
          return await supabaseApi.getOrders();
        case 'customers':
          return await supabaseApi.getCustomers();
        case 'messages':
          return await supabaseApi.getMessages();
        case 'gallery-inquiries':
          return await supabaseApi.getGalleryInquiries();
        default:
          throw new APIError(`Unknown entity: ${entityName}`, 400);
      }
    },

    async get(id) {
      switch (entityName) {
        case 'bakers':
          return await supabaseApi.getBaker(id);
        case 'gallery':
          return await supabaseApi.getGalleryItem(id);
        case 'orders':
          return await supabaseApi.getOrder(id);
        case 'customers':
          return await supabaseApi.getCustomer(id);
        case 'themes':
          return await supabaseApi.getTheme(id);
        case 'messages':
          return await supabaseApi.getMessage(id);
        case 'gallery-inquiries':
          return await supabaseApi.getGalleryInquiry(id);
        default:
          throw new APIError(`Unknown entity: ${entityName}`, 400);
      }
    },

    async update(id, data) {
      switch (entityName) {
        case 'bakers':
          return await supabaseApi.updateBaker(id, data);
        case 'gallery':
          return await supabaseApi.updateGalleryItem(id, data);
        case 'orders':
          return await supabaseApi.updateOrder(id, data);
        case 'customers':
          return await supabaseApi.updateCustomer(id, data);
        case 'messages':
          return await supabaseApi.updateMessage(id, data);
        case 'gallery-inquiries':
          return await supabaseApi.updateGalleryInquiry(id, data);
        default:
          throw new APIError(`Unknown entity: ${entityName}`, 400);
      }
    },

    async delete(id) {
      switch (entityName) {
        case 'bakers':
          return await supabaseApi.deleteBaker(id);
        case 'gallery':
          return await supabaseApi.deleteGalleryItem(id);
        case 'orders':
          return await supabaseApi.deleteOrder(id);
        case 'customers':
          return await supabaseApi.deleteCustomer(id);
        case 'themes':
          return await supabaseApi.deleteTheme(id);
        case 'messages':
          return await supabaseApi.deleteMessage(id);
        case 'gallery-inquiries':
          return await supabaseApi.deleteGalleryInquiry(id);
        default:
          throw new APIError(`Unknown entity: ${entityName}`, 400);
      }
    },

    async filter(conditions, sort = '-created_date', limit = 50) {
      switch (entityName) {
        case 'bakers':
          return await supabaseApi.filterBakers(conditions, sort, limit);
        case 'gallery':
          return await supabaseApi.filterGallery(conditions, sort, limit);
        case 'orders':
          return await supabaseApi.filterOrders(conditions, sort, limit);
        case 'customers':
          return await supabaseApi.filterCustomers(conditions, sort, limit);
        case 'messages':
          return await supabaseApi.filterMessages(conditions, sort, limit);
        case 'gallery-inquiries':
          return await supabaseApi.filterGalleryInquiries(conditions, sort, limit);
        default:
          throw new APIError(`Unknown entity: ${entityName}`, 400);
      }
    }
  };
}

// Authentication service - Supabase only
const auth = {
  async login(email, password) {
    return await supabaseApi.login(email, password);
  },

  async signup(userData) {
    return await supabaseApi.signup(userData.email, userData.password, userData.name);
  },

  async logout() {
    return await supabaseApi.logout();
  },

  async me() {
    return await supabaseApi.getMe();
  },

  async isAuthenticated() {
    return await supabaseApi.isAuthenticated();
  }
};

// Integration services - Supabase only
const integrations = {
  Core: {
    async UploadFile(file, options = {}) {
      return await supabaseApi.uploadFile(file);
    },

    async InvokeLLM(prompt, options = {}) {
      // Edge function integration would go here
      throw new APIError('LLM integration not yet implemented in Supabase', 501);
    },

    async SendEmail(to, subject, body, options = {}) {
      // Edge function integration would go here
      throw new APIError('Email integration not yet implemented in Supabase', 501);
    },

    async GenerateImage(prompt, options = {}) {
      // Edge function integration would go here
      throw new APIError('Image generation not yet implemented in Supabase', 501);
    },

    async ExtractDataFromUploadedFile(fileUrl, options = {}) {
      // Edge function integration would go here
      throw new APIError('Data extraction not yet implemented in Supabase', 501);
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
      return await supabaseApi.healthCheck();
    },

    setApiUrl(url) {
      // Not needed for Supabase
      console.warn('setApiUrl is deprecated in Supabase-only mode');
    }
  };
}

// Export individual components for convenience
export { APIError, auth, integrations };