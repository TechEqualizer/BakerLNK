#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Creating Demo User for BakerLNK');

async function createDemoUser() {
    try {
        // Create demo user via signup
        console.log('📧 Creating demo user: baker@example.com');
        
        const { data, error } = await supabase.auth.signUp({
            email: 'baker@example.com',
            password: 'password123',
            options: {
                data: { name: 'Demo Baker' }
            }
        });
        
        if (error) {
            if (error.message.includes('User already registered')) {
                console.log('✅ Demo user already exists! Testing login...');
                
                // Test login
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: 'baker@example.com',
                    password: 'password123'
                });
                
                if (loginError) {
                    console.error('❌ Login failed:', loginError.message);
                } else {
                    console.log('✅ Login successful! Demo user is ready.');
                    console.log('User ID:', loginData.user?.id);
                }
            } else {
                console.error('❌ Failed to create demo user:', error.message);
                console.error('Error details:', error);
            }
        } else {
            console.log('✅ Demo user created successfully!');
            if (data.user && !data.session) {
                console.log('📧 Email confirmation may be required');
            }
            console.log('User ID:', data.user?.id);
        }
        
    } catch (err) {
        console.error('❌ Demo user creation failed:', err.message);
    }
}

createDemoUser();