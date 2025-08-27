// Entity class for Base44 SDK mock
import storage from './storage.js';

class Entity {
  constructor(name) {
    this.name = name;
  }

  // Create a new record
  async create(data) {
    // Simulate async behavior
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = storage.create(this.name, data);
        resolve(result);
      }, 100);
    });
  }

  // Create multiple records
  async bulkCreate(dataArray) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = storage.bulkCreate(this.name, dataArray);
        resolve(results);
      }, 100);
    });
  }

  // Find a single record by ID
  async findById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = storage.getById(this.name, id);
        resolve(result);
      }, 50);
    });
  }

  // Find a single record by query
  async findOne(filter) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = storage.query(this.name, { filter, limit: 1 });
        resolve(results[0] || null);
      }, 50);
    });
  }

  // List records with optional sorting and limiting
  async list(sortOrOptions, limit) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let options = {};
        
        // Handle different parameter formats
        if (typeof sortOrOptions === 'string') {
          options.sort = sortOrOptions;
          if (limit) options.limit = limit;
        } else if (typeof sortOrOptions === 'object') {
          options = sortOrOptions;
        } else if (typeof sortOrOptions === 'number') {
          options.limit = sortOrOptions;
        }

        const results = storage.query(this.name, options);
        resolve(results);
      }, 100);
    });
  }

  // Filter records
  async filter(filterObj, options = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const queryOptions = {
          ...options,
          filter: filterObj
        };
        const results = storage.query(this.name, queryOptions);
        resolve(results);
      }, 100);
    });
  }

  // Update a record
  async update(id, data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = storage.update(this.name, id, data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  // Delete a record
  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = storage.delete(this.name, id);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  // Count records
  async count(filter) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const options = filter ? { filter } : {};
        const results = storage.query(this.name, options);
        resolve(results.length);
      }, 50);
    });
  }
}

// Create and export entity instances
export const createEntities = () => {
  const entityNames = [
    'Baker',
    'Customer', 
    'Order',
    'Gallery',
    'Message',
    'Theme',
    'GalleryInquiry'
  ];

  const entities = {};
  
  entityNames.forEach(name => {
    entities[name] = new Entity(name);
  });

  return entities;
};