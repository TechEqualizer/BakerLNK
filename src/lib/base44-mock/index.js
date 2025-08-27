// Mock Base44 SDK implementation
import { createEntities } from './entities.js';
import { Core } from './integrations.js';
import auth from './auth.js';
import storage from './storage.js';

// Main client factory function
export function createClient(options = {}) {
  const { appId, requiresAuth = false } = options;
  
  // Initialize storage
  storage.initializeDefaultData();
  
  // Create entities
  const entities = createEntities();
  
  // Create client object with same structure as Base44 SDK
  const client = {
    appId,
    requiresAuth,
    entities,
    integrations: {
      Core
    },
    auth,
    
    // Additional utility methods
    isAuthenticated() {
      return auth.isAuthenticated();
    },
    
    getUser() {
      return auth.getUser();
    }
  };
  
  // Add auth checking wrapper if requiresAuth is true
  if (requiresAuth) {
    // Wrap entity methods to check authentication
    Object.entries(entities).forEach(([entityName, entity]) => {
      const originalMethods = {};
      
      // Store original methods
      ['create', 'update', 'delete', 'bulkCreate'].forEach(method => {
        if (entity[method]) {
          originalMethods[method] = entity[method].bind(entity);
          
          // Wrap method with auth check
          entity[method] = async (...args) => {
            if (!auth.isAuthenticated()) {
              throw new Error('Authentication required. Please log in.');
            }
            return originalMethods[method](...args);
          };
        }
      });
    });
    
    // Also wrap integration methods
    Object.entries(Core).forEach(([methodName, method]) => {
      const originalMethod = method;
      
      Core[methodName] = async (...args) => {
        if (!auth.isAuthenticated()) {
          throw new Error('Authentication required. Please log in.');
        }
        return originalMethod(...args);
      };
    });
  }
  
  return client;
}

// Export utilities that might be imported directly
export const utils = {
  storage,
  auth
};