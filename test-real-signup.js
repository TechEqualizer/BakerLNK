#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Supabase Auth with Real Email Domain');

async function testAuth() {
    try {
        // Test with a real domain
        const testEmail = `test+${Date.now()}@gmail.com`;
        const testPassword = 'testpassword123';
        
        console.log(`📧 Testing signup with: ${testEmail}`);
        
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: { name: 'Test User' }
            }
        });
        
        if (error) {
            console.error('❌ Signup failed:', error.message);
            console.error('Error details:', error);
        } else {
            console.log('✅ Signup successful!');
            console.log('📧 Check your email for confirmation (if required)');
            console.log('User ID:', data.user?.id);
        }
        
        // Test login with existing demo user
        console.log('\n🔐 Testing login with demo user...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'baker@example.com',
            password: 'password123'
        });
        
        if (loginError) {
            console.log('❌ Demo user login failed (expected if user not created yet)');
            console.log('Error:', loginError.message);
        } else {
            console.log('✅ Demo user login successful!');
        }
        
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
}

testAuth();