// LocalStorage-based persistence layer for the mock Base44 SDK

const STORAGE_PREFIX = 'base44_mock_';

class Storage {
  constructor() {
    this.initializeDefaultData();
  }

  initializeDefaultData() {
    // Initialize with some default data if storage is empty
    const collections = ['Baker', 'Customer', 'Order', 'Gallery', 'Message', 'Theme', 'GalleryInquiry'];
    
    collections.forEach(collection => {
      const key = this.getCollectionKey(collection);
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });

    // Initialize auth data
    if (!localStorage.getItem(STORAGE_PREFIX + 'auth')) {
      localStorage.setItem(STORAGE_PREFIX + 'auth', JSON.stringify({
        user: null,
        token: null
      }));
    }
  }

  getCollectionKey(collection) {
    return STORAGE_PREFIX + collection.toLowerCase();
  }

  // Get all items from a collection
  getAll(collection) {
    const key = this.getCollectionKey(collection);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Get a single item by ID
  getById(collection, id) {
    const items = this.getAll(collection);
    return items.find(item => item.id === id);
  }

  // Create a new item
  create(collection, data) {
    const items = this.getAll(collection);
    const newItem = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    items.push(newItem);
    this.save(collection, items);
    return newItem;
  }

  // Create multiple items
  bulkCreate(collection, dataArray) {
    const items = this.getAll(collection);
    const newItems = dataArray.map(data => ({
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    items.push(...newItems);
    this.save(collection, items);
    return newItems;
  }

  // Update an item
  update(collection, id, data) {
    const items = this.getAll(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }
    items[index] = {
      ...items[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    this.save(collection, items);
    return items[index];
  }

  // Delete an item
  delete(collection, id) {
    const items = this.getAll(collection);
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }
    this.save(collection, filtered);
    return true;
  }

  // Query items with sorting and filtering
  query(collection, options = {}) {
    let items = this.getAll(collection);
    
    // Apply filters
    if (options.filter) {
      items = items.filter(item => {
        return Object.entries(options.filter).every(([key, value]) => {
          return item[key] === value;
        });
      });
    }

    // Apply sorting
    if (options.sort) {
      const sortField = options.sort.startsWith('-') ? options.sort.slice(1) : options.sort;
      const sortOrder = options.sort.startsWith('-') ? -1 : 1;
      
      items.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
    }

    // Apply limit
    if (options.limit) {
      items = items.slice(0, options.limit);
    }

    return items;
  }

  // Save collection to localStorage
  save(collection, items) {
    const key = this.getCollectionKey(collection);
    localStorage.setItem(key, JSON.stringify(items));
  }

  // Generate a unique ID
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Auth-specific methods
  getAuth() {
    const data = localStorage.getItem(STORAGE_PREFIX + 'auth');
    return data ? JSON.parse(data) : { user: null, token: null };
  }

  setAuth(authData) {
    localStorage.setItem(STORAGE_PREFIX + 'auth', JSON.stringify(authData));
  }

  clearAuth() {
    localStorage.setItem(STORAGE_PREFIX + 'auth', JSON.stringify({ user: null, token: null }));
  }
}

// Export a singleton instance
export default new Storage();