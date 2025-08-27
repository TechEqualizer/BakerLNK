
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Baker } from '@/api/entities';
import { Toaster } from "@/components/ui/sonner";
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    CakeSlice,
    Users,
    Image as ImageIcon,
    Calendar,
    Settings,
    Menu,
    X,
    Home
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
    const [baker, setBaker] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        Baker.list().then(bakers => {
            if (bakers.length > 0) {
                setBaker(bakers[0]);
            }
        });
    }, []);

    if (currentPageName === 'Showcase') {
        return <>{children}</>;
    }

    const SidebarContent = () => (
        <div className="admin-sidebar flex flex-col h-full bg-card border-r">
            <div className="p-6 text-center border-b border-border">
                <Link to={createPageUrl('Dashboard')} className="flex flex-col items-center gap-2">
                    {baker?.logo_url ? (
                        <img src={baker.logo_url} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                        <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                            {baker?.business_name ? baker.business_name.charAt(0) : 'B'}
                        </div>
                    )}
                    <h1 className="text-xl font-bold text-card-foreground mt-2">{baker?.business_name || 'BakerLink'}</h1>
                </Link>
            </div>
            <nav className="flex-1 p-4">
                {navItems.map(item => <NavLink key={item.href} item={item} pathname={location.pathname} />)}
            </nav>
            <div className="p-4 border-t border-border">
                 <NavLink item={{ href: 'Settings', icon: Settings, label: 'Settings' }} pathname={location.pathname} />
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
