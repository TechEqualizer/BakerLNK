import Layout from "./Layout.jsx";

import Gallery from "./Gallery";

import Calendar from "./Calendar";

import Settings from "./Settings";

import Dashboard from "./Dashboard";

import Showcase from "./Showcase";

import Orders from "./Orders";

import Customers from "./Customers";

import OnboardingWizard from "./OnboardingWizard";

import ThemeManager from "./ThemeManager";

import ThemeManagerV2 from "./ThemeManagerV2";

import AuthPage from "./AuthPage";

import { ThemeProvider } from "../providers/ThemeProvider";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';

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

// Protected Route Component
function ProtectedRoute({ children }) {
    const isAuthenticated = auth.isAuthenticated();
    
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    
    return children;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    const isAuthenticated = auth.isAuthenticated();
    
    return (
        <Routes>
            {/* Auth Route */}
            <Route 
                path="/auth" 
                element={
                    isAuthenticated ? (
                        <Navigate to="/Dashboard" replace />
                    ) : (
                        <AuthPage />
                    )
                } 
            />
            
            {/* Public Routes */}
            <Route path="/public" element={<Showcase isPublic={true} />} />
            <Route path="/public/:slug" element={<Showcase isPublic={true} />} />
            
            {/* Onboarding Route - Special case for new users */}
            <Route 
                path="/OnboardingWizard" 
                element={
                    isAuthenticated ? (
                        <OnboardingWizard />
                    ) : (
                        <Navigate to="/auth" replace />
                    )
                } 
            />
            
            {/* Protected Routes */}
            <Route path="/*" element={
                isAuthenticated ? (
                    <Layout currentPageName={currentPage}>
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