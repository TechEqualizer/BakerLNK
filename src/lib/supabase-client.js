import { createClient } from '@supabase/supabase-js'
import { logger } from '@/utils/logger'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_project_url_here' || 
    supabaseAnonKey === 'your_supabase_anon_key_here') {
  logger.warn('⚠️ Supabase credentials not configured!')
  logger.warn('Please update your .env file with your Supabase project credentials.')
  logger.warn('You can get these from: https://app.supabase.com/project/_/settings/api')
}

export const supabase = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here'
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null

// Helper to transform snake_case to camelCase
const toCamelCase = (obj) => {
  if (!obj) return obj
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  if (typeof obj !== 'object') return obj
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    acc[camelKey] = toCamelCase(obj[key])
    return acc
  }, {})
}

// Helper to transform camelCase to snake_case
const toSnakeCase = (obj) => {
  if (!obj) return obj
  if (Array.isArray(obj)) return obj.map(toSnakeCase)
  if (typeof obj !== 'object') return obj
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    acc[snakeKey] = toSnakeCase(obj[key])
    return acc
  }, {})
}

// Export API that matches your existing express-client interface
export const api = {
  // Auth methods
  async login(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    // Return user data directly from auth
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email
      },
      token: data.session.access_token
    }
  },

  async signup(email, password, name) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    
    if (error) throw error
    
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name
      },
      token: data.session?.access_token
    }
  },

  async logout() {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getMe() {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email
    }
  },

  // Entity methods
  async getBakers() {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('bakers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(toCamelCase)
  },

  async getBaker(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('bakers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async createBaker(bakerData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    const { data, error } = await supabase
      .from('bakers')
      .insert([{
        ...toSnakeCase(bakerData),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async updateBaker(id, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('bakers')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  // Gallery methods
  async getGallery(bakerId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase.from('gallery').select('*')
    
    if (bakerId) {
      query = query.eq('baker_id', bakerId)
    }
    
    const { data, error } = await query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(toCamelCase)
  },

  async createGalleryItem(itemData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('gallery')
      .insert([toSnakeCase(itemData)])
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async updateGalleryItem(id, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('gallery')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  // File upload
  async uploadFile(file) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName)
    
    return { url: publicUrl, file_url: publicUrl }
  },

  // Orders
  async getOrders(bakerId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*)
      `)
    
    if (bakerId) {
      query = query.eq('baker_id', bakerId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(toCamelCase)
  },

  async createOrder(orderData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('orders')
      .insert([toSnakeCase(orderData)])
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  // Customers
  async getCustomers(bakerId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('baker_id', bakerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(toCamelCase)
  },

  async createCustomer(customerData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('customers')
      .insert([toSnakeCase(customerData)])
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  // Themes
  async getThemes() {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('is_active', true)
      .order('theme_name')
    
    if (error) throw error
    return data.map(toCamelCase)
  },

  async getTheme(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  // Messages
  async getMessages(bakerId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase.from('messages').select('*')
    
    if (bakerId) {
      query = query.eq('baker_id', bakerId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(toCamelCase)
  },

  async getMessage(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async createMessage(messageData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('messages')
      .insert([toSnakeCase(messageData)])
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async updateMessage(id, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('messages')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  // Gallery Inquiries
  async getGalleryInquiries(bakerId) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase.from('gallery_inquiries').select('*')
    
    if (bakerId) {
      query = query.eq('baker_id', bakerId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(toCamelCase)
  },

  async getGalleryInquiry(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('gallery_inquiries')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async createGalleryInquiry(inquiryData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('gallery_inquiries')
      .insert([toSnakeCase(inquiryData)])
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async updateGalleryInquiry(id, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('gallery_inquiries')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  // Delete methods
  async deleteBaker(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('bakers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  },

  async deleteGalleryItem(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  },

  async deleteOrder(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  },

  async deleteCustomer(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  },

  async deleteTheme(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  },

  async deleteMessage(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  },

  async deleteGalleryInquiry(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('gallery_inquiries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  },

  // Get single item methods
  async getGalleryItem(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async getOrder(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async getCustomer(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async updateOrder(id, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('orders')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  async updateCustomer(id, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('customers')
      .update(toSnakeCase(updates))
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return toCamelCase(data)
  },

  // Filter methods
  async filterBakers(conditions, sort, limit) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase.from('bakers').select('*')
    
    // Apply conditions
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(toSnakeCase({ [key]: value })[key], value)
      }
    })
    
    // Apply sorting
    if (sort) {
      const ascending = !sort.startsWith('-')
      const field = sort.replace(/^-/, '')
      query = query.order(toSnakeCase({ [field]: '' })[field], { ascending })
    }
    
    // Apply limit
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data.map(toCamelCase)
  },

  async filterGallery(conditions, sort, limit) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase.from('gallery').select('*')
    
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(toSnakeCase({ [key]: value })[key], value)
      }
    })
    
    if (sort) {
      const ascending = !sort.startsWith('-')
      const field = sort.replace(/^-/, '')
      query = query.order(toSnakeCase({ [field]: '' })[field], { ascending })
    }
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data.map(toCamelCase)
  },

  async filterOrders(conditions, sort, limit) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase.from('orders').select(`
      *,
      customer:customers(*)
    `)
    
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(toSnakeCase({ [key]: value })[key], value)
      }
    })
    
    if (sort) {
      const ascending = !sort.startsWith('-')
      const field = sort.replace(/^-/, '')
      query = query.order(toSnakeCase({ [field]: '' })[field], { ascending })
    }
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data.map(toCamelCase)
  },

  async filterCustomers(conditions, sort, limit) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase.from('customers').select('*')
    
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(toSnakeCase({ [key]: value })[key], value)
      }
    })
    
    if (sort) {
      const ascending = !sort.startsWith('-')
      const field = sort.replace(/^-/, '')
      query = query.order(toSnakeCase({ [field]: '' })[field], { ascending })
    }
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data.map(toCamelCase)
  },

  async filterMessages(conditions, sort, limit) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase.from('messages').select('*')
    
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(toSnakeCase({ [key]: value })[key], value)
      }
    })
    
    if (sort) {
      const ascending = !sort.startsWith('-')
      const field = sort.replace(/^-/, '')
      query = query.order(toSnakeCase({ [field]: '' })[field], { ascending })
    }
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data.map(toCamelCase)
  },

  async filterGalleryInquiries(conditions, sort, limit) {
    if (!supabase) throw new Error('Supabase not configured')
    
    let query = supabase.from('gallery_inquiries').select('*')
    
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(toSnakeCase({ [key]: value })[key], value)
      }
    })
    
    if (sort) {
      const ascending = !sort.startsWith('-')
      const field = sort.replace(/^-/, '')
      query = query.order(toSnakeCase({ [field]: '' })[field], { ascending })
    }
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data.map(toCamelCase)
  },

  // Utility methods
  async isAuthenticated() {
    if (!supabase) return false
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  },

  async healthCheck() {
    try {
      if (!supabase) throw new Error('Supabase not configured')
      
      // Try a simple query to check connection
      const { error } = await supabase
        .from('themes')
        .select('id')
        .limit(1)
      
      if (error) throw error
      return { status: 'ok', service: 'supabase' }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  }
}