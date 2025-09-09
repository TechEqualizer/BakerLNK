import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/express-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, CakeSlice } from 'lucide-react';

export default function AuthPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '' 
    });

    const generateTestAccount = async () => {
        const randomId = Math.floor(Math.random() * 9999);
        const testData = {
            name: `Test Baker ${randomId}`,
            email: `testbaker${randomId}@gmail.com`,
            password: 'test123',
            confirmPassword: 'test123'
        };
        setSignupData(testData);
        
        // Auto-submit after generating
        setIsLoading(true);
        try {
            const result = await auth.signup({
                name: testData.name,
                email: testData.email,
                password: testData.password
            });
            
            if (result.message && result.user?.needsEmailConfirmation) {
                toast.success('Test account created! Please check email for confirmation.');
                return;
            }
            
            toast.success('Test account created! Starting onboarding...');
            navigate('/OnboardingWizard');
        } catch (error) {
            console.error('Test signup error:', error);
            toast.error(error.message || 'Failed to create test account');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await auth.login(loginData.email, loginData.password);
            toast.success('Welcome back!');
            navigate('/Dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (signupData.password !== signupData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const result = await auth.signup({
                name: signupData.name,
                email: signupData.email,
                password: signupData.password
            });
            
            // Handle email confirmation required
            if (result.message && result.user?.needsEmailConfirmation) {
                toast.success('Account created! Please check your email to confirm your account before logging in.', {
                    duration: 8000
                });
                // Show helpful message
                console.log('✅ User created but needs email confirmation');
                // Don't navigate to onboarding, wait for email confirmation
                return;
            }
            
            toast.success('Account created successfully!');
            navigate('/OnboardingWizard');
        } catch (error) {
            console.error('Signup error:', error);
            
            // Show more helpful error messages
            let errorMessage = 'Failed to create account';
            if (error.message) {
                errorMessage = error.message;
            }
            
            // Special handling for common errors
            if (error.message?.includes('Password should be at least 6 characters')) {
                errorMessage = 'Password must be at least 6 characters long';
            } else if (error.message?.includes('User already registered')) {
                errorMessage = 'An account with this email already exists. Try logging in instead.';
            }
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async () => {
        setIsLoading(true);
        try {
            await auth.login('baker@example.com', 'password123');
            toast.success('Welcome to the demo!');
            navigate('/Dashboard');
        } catch (error) {
            console.error('Quick login error:', error);
            toast.error('Demo login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                        <CakeSlice className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">BakerLink</h1>
                    <p className="text-gray-600 mt-2">Manage your bakery business with ease</p>
                </div>

                <Card>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login">
                            <form onSubmit={handleLogin}>
                                <CardHeader>
                                    <CardTitle>Welcome back</CardTitle>
                                    <CardDescription>
                                        Enter your credentials to access your account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="baker@example.com"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-2">
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Logging in...
                                            </>
                                        ) : (
                                            'Login'
                                        )}
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        className="w-full"
                                        onClick={handleQuickLogin}
                                        disabled={isLoading}
                                    >
                                        Quick Demo Login
                                    </Button>
                                </CardFooter>
                            </form>
                        </TabsContent>
                        
                        <TabsContent value="signup">
                            <form onSubmit={handleSignup}>
                                <CardHeader>
                                    <CardTitle>Create an account</CardTitle>
                                    <CardDescription>
                                        Start managing your bakery business today
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Name</Label>
                                        <Input
                                            id="signup-name"
                                            type="text"
                                            placeholder="John Baker"
                                            value={signupData.name}
                                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="john@bakery.com"
                                            value={signupData.email}
                                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            value={signupData.password}
                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                            required
                                            disabled={isLoading}
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-confirm">Confirm Password</Label>
                                        <Input
                                            id="signup-confirm"
                                            type="password"
                                            value={signupData.confirmPassword}
                                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-2">
                                    <Button 
                                        type="submit" 
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                    
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        className="w-full border-green-200 text-green-700 hover:bg-green-50"
                                        onClick={generateTestAccount}
                                        disabled={isLoading}
                                    >
                                        ⚡ Quick Test Signup → Onboarding
                                    </Button>
                                </CardFooter>
                            </form>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}