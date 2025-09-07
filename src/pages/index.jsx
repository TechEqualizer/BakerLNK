import { lazy, Suspense } from 'react';
import Layout from "./Layout.jsx";

// Lazy load all page components for code splitting
const Gallery = lazy(() => import("./Gallery"));
const Calendar = lazy(() => import("./Calendar"));
const Settings = lazy(() => import("./Settings"));
const Dashboard = lazy(() => import("./Dashboard"));
const Showcase = lazy(() => import("./Showcase"));
const Orders = lazy(() => import("./Orders"));
const Customers = lazy(() => import("./Customers"));
const OnboardingWizard = lazy(() => import("./OnboardingWizard"));
const ThemeManager = lazy(() => import("./ThemeManager"));
const ThemeManagerV2 = lazy(() => import("./ThemeManagerV2"));
const AuthPage = lazy(() => import("./AuthPage"));

import { ThemeProvider } from "../providers/ThemeProvider";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { auth } from '../lib/express-client';

const PAGES = {
    
    Gallery: Gallery,
    
    Calendar: Calendar,
    
    Settings: Settings,
    
    Dashboard: Dashboard,
    
    Showcase: Showcase,
    
    Orders: Orders,
    
    Customers: Customers,
    
    OnboardingWizard: OnboardingWizard,
    
    ThemeManager: ThemeManager,
    
    ThemeManagerV2: ThemeManagerV2,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Loading component for lazy loaded routes
function PageLoader() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
    
    useEffect(() => {
        // Check authentication status on mount and location changes
        const checkAuth = async () => {
            try {
                const authenticated = await auth.isAuthenticated();
                setIsAuthenticated(authenticated);
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
            }
        };
        
        checkAuth();
    }, [location]);
    
    // Show loading state while checking auth
    if (isAuthenticated === null) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }
    
    return (
        <Routes>
            {/* Auth Route */}
            <Route 
                path="/auth" 
                element={
                    isAuthenticated ? (
                        <Navigate to="/Dashboard" replace />
                    ) : (
                        <Suspense fallback={<PageLoader />}>
                            <AuthPage />
                        </Suspense>
                    )
                } 
            />
            
            {/* Public Routes */}
            <Route path="/public" element={
                <Suspense fallback={<PageLoader />}>
                    <Showcase isPublic={true} />
                </Suspense>
            } />
            <Route path="/public/:slug" element={
                <Suspense fallback={<PageLoader />}>
                    <Showcase isPublic={true} />
                </Suspense>
            } />
            
            {/* Onboarding Route - Special case for new users */}
            <Route 
                path="/OnboardingWizard" 
                element={
                    isAuthenticated ? (
                        <Suspense fallback={<PageLoader />}>
                            <OnboardingWizard />
                        </Suspense>
                    ) : (
                        <Navigate to="/auth" replace />
                    )
                } 
            />
            
            {/* Protected Routes */}
            <Route path="/*" element={
                isAuthenticated ? (
                    <Layout currentPageName={currentPage}>
                        <Suspense fallback={<PageLoader />}>
                            <Routes>            
                                <Route path="/" element={<Gallery />} />
                                <Route path="/Gallery" element={<Gallery />} />
                                <Route path="/Calendar" element={<Calendar />} />
                                <Route path="/Settings" element={<Settings />} />
                                <Route path="/Dashboard" element={<Dashboard />} />
                                <Route path="/Showcase" element={<Showcase />} />
                                <Route path="/Orders" element={<Orders />} />
                                <Route path="/Customers" element={<Customers />} />
                                <Route path="/ThemeManager" element={<ThemeManager />} />
                                <Route path="/ThemeManagerV2" element={<ThemeManagerV2 />} />
                            </Routes>
                        </Suspense>
                    </Layout>
                ) : (
                    <Navigate to="/auth" replace />
                )
            } />
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <ThemeProvider>
                <PagesContent />
            </ThemeProvider>
        </Router>
    );
}