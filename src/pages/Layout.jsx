
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Baker } from '@/api/entities';
import { auth } from '@/lib/express-client';
import { Toaster } from "@/components/ui/sonner";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    LayoutDashboard,
    CakeSlice,
    Users,
    Image as ImageIcon,
    Calendar,
    Settings,
    Menu,
    X,
    Home,
    LogOut
} from 'lucide-react';

const navItems = [
    { href: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: 'Orders', icon: CakeSlice, label: 'Orders' },
    { href: 'Customers', icon: Users, label: 'Customers' },
    { href: 'Gallery', icon: ImageIcon, label: 'Gallery' },
    { href: 'Calendar', icon: Calendar, label: 'Calendar' },
    { href: 'Showcase', icon: Home, label: 'Public Site' },
];

const NavLink = ({ item, pathname }) => {
    const isActive = pathname === createPageUrl(item.href);
    return (
        <Link
            to={createPageUrl(item.href)}
            className={`admin-nav-link flex items-center p-3 my-1 rounded-lg transition-colors
                ${isActive
                    ? 'active bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
        >
            <item.icon className="w-5 h-5 mr-4" />
            <span className="font-medium">{item.label}</span>
        </Link>
    );
};

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [baker, setBaker] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await auth.logout();
            toast.success('Logged out successfully');
            navigate('/');
            window.location.reload(); // Force a full reload to clear state
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    useEffect(() => {
        const loadBakerData = () => {
            Baker.list().then(bakers => {
                if (bakers.length > 0) {
                    console.log('Layout: Loading baker data:', bakers[0]);
                    setBaker(bakers[0]);
                }
            });
        };
        
        loadBakerData();
        
        // Listen for baker data updates from Settings page
        const handleBakerDataUpdate = (event) => {
            console.log('Layout: Baker data updated, reloading...', event.detail);
            // Force a reload after a small delay to ensure backend is updated
            setTimeout(() => {
                loadBakerData();
            }, 500);
        };
        
        window.addEventListener('bakerDataUpdated', handleBakerDataUpdate);
        
        // Cleanup event listener
        return () => {
            window.removeEventListener('bakerDataUpdated', handleBakerDataUpdate);
        };
    }, []);

    if (currentPageName === 'Showcase') {
        return <>{children}</>;
    }

    const SidebarContent = () => (
        <div className="admin-sidebar flex flex-col h-full bg-card border-r">
            <div className="p-6 text-center border-b border-border">
                <Link to={createPageUrl('Dashboard')} className="flex flex-col items-center gap-2">
                    <div className="relative">
                        {baker?.logo_url && (
                            <img 
                                src={baker.logo_url} 
                                alt="Logo" 
                                className="h-12 w-12 rounded-full object-cover" 
                                onError={(e) => {
                                    console.error('Failed to load logo image:', baker.logo_url, e);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        )}
                        <div 
                            className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl fallback-logo" 
                            style={{ display: baker?.logo_url ? 'none' : 'flex' }}
                        >
                            {baker?.business_name ? baker.business_name.charAt(0) : 'B'}
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-card-foreground mt-2">{baker?.business_name || 'BakerLink'}</h1>
                </Link>
            </div>
            <nav className="flex-1 p-4">
                {navItems.map(item => <NavLink key={item.href} item={item} pathname={location.pathname} />)}
            </nav>
            <div className="p-4 border-t border-border space-y-2">
                 <NavLink item={{ href: 'Settings', icon: Settings, label: 'Settings' }} pathname={location.pathname} />
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={handleLogout}
                 >
                    <LogOut className="w-5 h-5 mr-4" />
                    <span className="font-medium">Logout</span>
                 </Button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-background">
             {/* Toaster for notifications */}
            <Toaster richColors position="top-center" />
            
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
                <SidebarContent />
            </aside>
            
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border text-card-foreground flex items-center justify-between p-4 h-16 shadow-lg">
                <Link to={createPageUrl('Dashboard')} className="text-lg font-bold">
                    {baker?.business_name || 'BakerLink'}
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </header>

            {/* Mobile Sidebar (Drawer) */}
            {isMobileMenuOpen && (
                 <div 
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
                    onClick={() => setIsMobileMenuOpen(false)}
                 >
                    <aside className="fixed top-16 left-0 w-64 h-[calc(100%-4rem)] z-40">
                         <SidebarContent />
                    </aside>
                 </div>
            )}
            
            {/* Main Content */}
            <main className="flex-1 lg:ml-0 mt-16 lg:mt-0 bg-background text-foreground">
                {children}
            </main>
        </div>
    );
}
