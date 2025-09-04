import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions to match your existing API
export const api = {
  // Bakers
  async getBakers() {
    const { data, error } = await supabase
      .from('bakers')
      .select('*, theme:themes(*), user:users(*)')
    if (error) throw error
    return data
  },

  async createBaker(bakerData) {
    const { data, error } = await supabase
      .from('bakers')
      .insert([bakerData])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateBaker(id, updates) {
    const { data, error } = await supabase
      .from('bakers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Gallery
  async getGallery(bakerId) {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('baker_id', bakerId)
      .order('featured', { ascending: false })
    if (error) throw error
    return data
  },

  // File uploads
  async uploadFile(file) {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName)
    
    return { url: publicUrl }
  },

  // Auth
  async signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}