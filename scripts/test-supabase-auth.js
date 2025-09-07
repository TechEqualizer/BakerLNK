#!/usr/bin/env node

// Quick Supabase authentication test script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Authentication Setup\n');

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase credentials in .env file');
    console.log('Expected:');
    console.log('VITE_SUPABASE_URL=your_url');
    console.log('VITE_SUPABASE_ANON_KEY=your_key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    console.log(`📧 Testing signup with: ${testEmail}`);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    name: 'Test User'
                }
            }
        });
        
        if (error) {
            console.log('❌ Signup failed:', error.message);
            console.log('Error details:', JSON.stringify(error, null, 2));
            
            // Provide specific solutions
            if (error.message.includes('Database error saving new user')) {
                console.log('\n💡 Solution: Run the database-setup.sql script in Supabase SQL Editor');
                console.log('   This error typically means RLS policies are blocking user creation');
            } else if (error.message.includes('email_confirmation')) {
                console.log('\n💡 Solution: Disable email confirmation in Supabase Auth settings');
            } else if (error.message.includes('signup_disabled')) {
                console.log('\n💡 Solution: Enable signups in Supabase Auth settings');
            }
        } else {
            console.log('✅ Signup successful!');
            console.log('User ID:', data.user?.id);
            console.log('Email:', data.user?.email);
            console.log('Needs email confirmation:', !data.session);
            
            // Clean up: delete the test user
            if (data.session) {
                await supabase.auth.signOut();
            }
        }
    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }
}

async function checkAuthSettings() {
    console.log('🔧 Checking authentication configuration...\n');
    
    try {
        // Try to get auth settings (this might not work with anon key)
        const { data, error } = await supabase
            .from('auth.config')
            .select('*')
            .limit(1);
            
        if (error && error.code !== '42P01') { // 42P01 is "relation does not exist"
            console.log('⚠️  Cannot check auth config with anon key (normal)');
        }
    } catch (err) {
        console.log('⚠️  Cannot check auth config:', err.message);
    }
}

async function runTests() {
    await checkAuthSettings();
    await testSignup();
    
    console.log('\n📋 Next Steps:');
    console.log('1. If signup failed, check the solutions above');
    console.log('2. Run database-setup.sql in Supabase SQL Editor');
    console.log('3. Check Supabase Auth settings in dashboard');
    console.log('4. Try the signup in your app again');
}

runTests().catch(console.error);