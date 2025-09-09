#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Auth Workarounds for Rate Limiting');

async function testAuthWorkarounds() {
    // Test 1: Check if we can get auth session info
    console.log('\n📋 Test 1: Check current auth state');
    const { data: session } = await supabase.auth.getSession();
    console.log('Current session:', session.session ? 'Authenticated' : 'Not authenticated');
    
    // Test 2: Try to sign up with a more unique email
    console.log('\n📋 Test 2: Try signup with unique timestamp email');
    const uniqueEmail = `test${Date.now()}@gmail.com`;
    console.log(`Testing with: ${uniqueEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
        email: uniqueEmail,
        password: 'password123456',
        options: {
            data: { name: 'Test User' }
        }
    });
    
    if (error) {
        console.error('❌ Signup failed:', error.message);
        
        if (error.message.includes('seconds')) {
            console.log('💡 Rate limiting detected. Suggestions:');
            console.log('   1. Wait 2-3 minutes before trying again');
            console.log('   2. Try from a different IP/network');
            console.log('   3. Use incognito mode');
            console.log('   4. Check Supabase Auth settings in dashboard');
        }
    } else {
        console.log('✅ Signup successful!');
        console.log('User created:', data.user?.email);
        
        // Test login immediately
        console.log('\n📋 Test 3: Try immediate login');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: uniqueEmail,
            password: 'password123456'
        });
        
        if (loginError) {
            console.error('❌ Login failed:', loginError.message);
        } else {
            console.log('✅ Login successful!');
        }
    }
    
    // Test 4: Check if demo user exists now
    console.log('\n📋 Test 4: Check for existing demo user');
    const { data: demoLogin, error: demoError } = await supabase.auth.signInWithPassword({
        email: 'baker@example.com',
        password: 'password123'
    });
    
    if (demoError) {
        console.log('ℹ️  Demo user baker@example.com does not exist yet');
    } else {
        console.log('✅ Demo user exists and login works!');
    }
}

testAuthWorkarounds();