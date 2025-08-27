
import React, { useState, useEffect } from 'react';
import { Baker, Gallery, Customer, Order, User, Theme } from '@/api/entities';
import { GalleryInquiry } from '@/api/entities'; // Import new GalleryInquiry entity
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ChefHat, Crown, Shield, ArrowRight, LayoutDashboard, Palette, Users, BadgePercent } from 'lucide-react'; // Added Palette, Users, BadgePercent for stats
import { toast, Toaster } from 'sonner';
import DesignUploader from '../components/showcase/DesignUploader';
import ThemeSelector from '../components/showcase/ThemeSelector';
import ThemeModeToggle from '../components/theme/ThemeModeToggle';
import { useTheme } from '../providers/ThemeProvider';
import moment from 'moment'; // Import moment for date handling

export default function Showcase() {
    const { currentTheme, allThemes, isLoading: themeLoading, switchTheme } = useTheme();
    const [baker, setBaker] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        event_date: '',
        event_type: 'birthday',
        serves_count: '',
        budget_min: '',
        budget_max: '',
        cake_description: '',
        inspiration_images: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch baker, gallery, and orders data
                const [bakerData, galleryData, ordersData] = await Promise.all([
                    Baker.list().then(b => b[0] || null),
                    Gallery.list('-featured', 30),
                    Order.list('-created_date', 100)
                ]);
                
                setBaker(bakerData);
                setGallery(galleryData);
                setOrders(ordersData);
                
            } catch (error) {
                console.error("Error loading showcase data:", error);
                toast.error("Could not load baker's showcase. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        
        const checkLoginStatus = async () => {
            try {
                await User.me();
                setIsLoggedIn(true);
            } catch (error) {
                setIsLoggedIn(false);
            }
        };

        loadData();
        checkLoginStatus();
    }, []); // Remove dependency on URL search since theme provider handles this now
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleImagesChange = (imageUrls) => {
        setFormData(prev => ({...prev, inspiration_images: imageUrls}));
    };

    const handleThemeSelect = async (themeId) => {
        if (!baker || !themeId) return;
        
        console.log('Selecting theme with ID:', themeId); // Debug log
        
        // Find the new theme from global state
        const newTheme = allThemes.find(t => t.id === themeId);
        console.log('Found theme:', newTheme ? newTheme.theme_name : 'Not found'); // Debug log
        
        if (newTheme) {
            // Use global theme provider to switch themes
            switchTheme(themeId);
        }

        try {
            // Update the baker's selected theme in the database
            await Baker.update(baker.id, { selected_theme_id: themeId });
            // Update local baker state as well
            setBaker(prev => ({ ...prev, selected_theme_id: themeId }));
            toast.success(`${newTheme?.theme_name || 'Theme'} applied!`);
        } catch (error) {
            console.error("Failed to apply theme:", error);
            toast.error("Could not apply theme.");
            // Revert on failure by switching back to baker's original theme
            if (baker.selected_theme_id) {
                switchTheme(baker.selected_theme_id);
            }
        }
    };

    const handleHeartClick = async (galleryItem) => {
        try {
            // Optimistic UI update
            const newHeartsCount = (galleryItem.hearts_count || 0) + 1;
            setGallery(prev => prev.map(item => 
                item.id === galleryItem.id 
                    ? { ...item, hearts_count: newHeartsCount }
                    : item
            ));

            // Update database
            await Gallery.update(galleryItem.id, {
                hearts_count: newHeartsCount
            });

            toast.success("❤️ Thanks for the love!", {
                duration: 2000,
                position: "top-center"
            });

        } catch (error) {
            console.error('Error updating hearts:', error);
            // Revert optimistic update on error
            setGallery(prev => prev.map(item => 
                item.id === galleryItem.id 
                    ? { ...item, hearts_count: galleryItem.hearts_count }
                    : item
            ));
            toast.error("Couldn't add heart. Please try again.");
        }
    };

    const handleOrderClick = async (galleryItem) => {
        // First, pre-fill form and scroll for a smooth user experience
        setFormData(prev => ({
            ...prev,
            cake_description: `Inquiry for "${galleryItem.title}" cake.`,
            inspiration_images: galleryItem.image_url ? [galleryItem.image_url] : []
        }));
        document.getElementById('consultation').scrollIntoView({ behavior: 'smooth' });

        // Then, handle the inquiry counting logic
        if (!isLoggedIn) {
            toast.info("Please log in to track your inquiry. The form is pre-filled for you!");
            return;
        }

        try {
            const currentUser = await User.me();
            const startOfDay = moment().startOf('day').toISOString();
            
            const existingInquiry = await GalleryInquiry.filter({
                user_id: currentUser.id,
                gallery_item_id: galleryItem.id,
                created_date_gte: startOfDay, // Check if inquiry was made today
            });

            if (existingInquiry.length > 0) {
                toast.info("Your interest is noted! The form has been pre-filled for you again.");
                return; // User has already inquired today, do not increment
            }

            // User has not inquired today, so proceed
            const newInquiryCount = (galleryItem.inquiries_count || 0) + 1;

            // Optimistic UI update
            setGallery(prev => prev.map(item =>
                item.id === galleryItem.id
                    ? { ...item, inquiries_count: newInquiryCount }
                    : item
            ));

            // Create a record of the inquiry and update the count in parallel
            await Promise.all([
                GalleryInquiry.create({
                    user_id: currentUser.id,
                    gallery_item_id: galleryItem.id,
                }),
                Gallery.update(galleryItem.id, {
                    inquiries_count: newInquiryCount
                })
            ]);
            
            toast.success("Thanks for your interest! The form is pre-filled below.");

        } catch (error) {
            console.error('Error handling inquiry click:', error);
            toast.error("Could not record inquiry. Please proceed with the form.");
            // Revert optimistic update on error if needed
            setGallery(prev => prev.map(item =>
                item.id === galleryItem.id
                    ? { ...item, inquiries_count: galleryItem.inquiries_count }
                    : item
            ));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.event_date || !formData.cake_description) {
            toast.error("Please fill out all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            let customer = await Customer.filter({email: formData.email}).then(c => c[0]);
            if (!customer) {
                customer = await Customer.create({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                });
            }

            const orderData = {
                customer_id: customer.id,
                event_date: formData.event_date,
                event_type: formData.event_type,
                serves_count: parseInt(formData.serves_count) || null,
                budget_min: parseFloat(formData.budget_min) || null,
                budget_max: parseFloat(formData.budget_max) || null,
                cake_description: formData.cake_description,
                status: 'inquiry',
            };

            if (formData.inspiration_images.length > 0) {
                orderData.baker_notes = `Inspiration images: ${formData.inspiration_images.join(', ')}. ` + (orderData.baker_notes || '');
            }

            await Order.create(orderData);
            
            toast.success("🎉 Your luxury cake consultation has been booked! Expect our call within 2 hours.");
            setFormData({ 
                name: '', email: '', phone: '', event_date: '', event_type: 'birthday',
                serves_count: '', budget_min: '', budget_max: '', cake_description: '',
                inspiration_images: []
            });

        } catch (error) {
            console.error("Inquiry submission error:", error);
            toast.error("There was a problem with your submission. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate stats
    const totalHearts = gallery.reduce((sum, item) => sum + (item.hearts_count || 0), 0);
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    
    // HeroSection component as outlined
    const HeroSection = () => {
        const hasHeroImage = baker?.hero_image_url;
        
        return (
            <section 
                id="home"
                className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center text-center p-4 overflow-hidden"
            >
                {hasHeroImage ? (
                    // User uploaded hero image
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0" 
                        style={{ 
                            backgroundImage: `url(${baker.hero_image_url})`,
                            '--theme-hero-overlay': 'var(--theme-hero-overlay, rgba(0,0,0,0.6))' 
                        }}
                    >
                        <div className="absolute inset-0 bg-[var(--theme-hero-overlay)]"></div>
                    </div>
                ) : (
                    // Use the beautiful, theme-specific hero gradient
                    <div 
                        className="absolute inset-0 z-0"
                        style={{ background: 'var(--bg-gradient-hero, var(--bg-gradient-fallback))' }}
                    >
                        {/* Subtle animated particles overlay, works on top of the gradient */}
                        <div className="absolute inset-0 opacity-10">
                            <div 
                                className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" 
                                style={{ animationDelay: '0s', animationDuration: '3s' }}
                            ></div
                            ><div 
                                className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" 
                                style={{ animationDelay: '1s', animationDuration: '4s' }}
                            ></div
                            ><div 
                                className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" 
                                style={{ animationDelay: '2s', animationDuration: '5s' }}
                            ></div>
                        </div>
                    </div>
                )}
                
                <div className="relative z-10 flex flex-col items-center gap-6 text-white animate-fade-in-up">
                    {baker?.logo_url ? (
                        <img 
                            src={baker.logo_url} 
                            alt={`${baker.business_name} Logo`}
                            className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover shadow-2xl bg-white/20 p-1"
                        />
                    ) : (
                        <div className="h-24 w-24 md:h-32 md:w-32 rounded-full flex items-center justify-center bg-white/20 p-1 shadow-2xl">
                            <span className="text-4xl md:text-5xl font-light text-white">{baker?.business_name?.charAt(0) || 'B'}</span>
                        </div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight" style={{ textShadow: 'var(--shadow-hero-text, 0 4px 6px rgba(0,0,0,0.4))' }}>
                        {baker?.business_name || 'Welcome to the Bakery'}
                    </h1>
                    <p className="max-w-2xl text-lg md:text-xl font-light text-white/90" style={{ textShadow: 'var(--shadow-hero-text, 0 4px 6px rgba(0,0,0,0.4))' }}>
                        {baker?.tagline || 'Crafting delicious memories, one cake at a time.'}
                    </p>

                    {/* Relocated Metrics */}
                    <div className="mt-6 flex items-center justify-center gap-6 md:gap-10 text-white/90" style={{ textShadow: 'var(--shadow-hero-text, 0 2px 4px rgba(0,0,0,0.3))' }}>
                        <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-white/80" />
                            <div>
                                <span className="font-semibold">{totalHearts}</span>
                                <span className="font-light text-sm ml-1.5">Hearts</span>
                            </div>
                        </div>
                        <div className="w-px h-6 bg-white/20"></div>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-white/80" />
                            <div>
                                <span className="font-semibold">{completedOrders}</span>
                                <span className="font-light text-sm ml-1.5">Happy Customers</span>
                            </div>
                        </div>
                    </div>

                    <Button 
                        size="lg" 
                        className="mt-8 bg-primary text-primary-foreground font-semibold px-8 py-6 rounded-[var(--radius)] transition-all duration-[var(--transition-speed)] hover:scale-[var(--btn-hover-scale)] shadow-[var(--shadow-luxury)]"
                        onClick={() => document.getElementById('consultation').scrollIntoView({ behavior: 'smooth' })}
                    >
                        Request a Consultation
                    </Button>
                </div>
            </section>
        );
    };

    if (isLoading || themeLoading) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center bg-background"
            >
                <div className="text-center">
                    <div className="relative">
                        <div 
                            className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 mx-auto mb-4 border-primary"
                        ></div>
                        <div 
                            className="absolute inset-0 animate-ping rounded-full h-32 w-32 border mx-auto border-primary opacity-20"
                        ></div>
                    </div>
                    <p 
                        className="font-light text-lg tracking-wide text-muted-foreground"
                    >
                        Curating perfection...
                    </p>
                </div>
            </div>
        );
    }

    if (!baker) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center text-center p-8 bg-background"
            >
                <div className="max-w-2xl">
                    <div className="relative mb-8">
                        <Crown 
                            className="w-32 h-32 mx-auto animate-pulse text-primary" 
                        />
                        <div 
                            className="absolute -inset-4 rounded-full blur-xl bg-primary opacity-10"
                        ></div>
                    </div>
                    <h1 
                        className="text-6xl font-light mb-6 tracking-tight text-foreground"
                    >
                        Arriving Soon
                    </h1>
                    <p 
                        className="text-xl leading-relaxed text-muted-foreground"
                    >
                        An extraordinary culinary artisan is preparing their masterpiece collection. Return soon to witness edible luxury redefined.
                    </p>
                </div>
            </div>
        );
    }
    
    const filteredGallery = selectedCategory === "all" 
        ? gallery 
        : gallery.filter(item => item.category && item.category.toLowerCase() === selectedCategory);

    const displayGallery = [...filteredGallery].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.id.localeCompare(b.id);
    });

    return (
        <>
        {/* The dynamic CSS variables are now handled by a useEffect hook that manipulates a <style> tag in the document <head>. */}
        
        <Toaster richColors position="top-right" />
        
        {isLoggedIn && (
            <>
                <div className="fixed top-4 left-4 z-[100]">
                    <Button asChild className="bg-primary text-primary-foreground font-medium shadow-xl rounded-[calc(var(--radius)-4px)] px-6 py-3 hover:scale-[var(--btn-hover-scale)] transition-all duration-[var(--transition-speed)] backdrop-blur-sm">
                        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
                            <LayoutDashboard className="h-5 w-5" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </Link>
                    </Button>
                </div>
                {allThemes.length > 0 && (
                    <ThemeSelector
                        themes={allThemes}
                        currentThemeId={currentTheme?.id}
                        onSelectTheme={handleThemeSelect}
                    />
                )}
            </>
        )}
        
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-border" style={{ background: 'hsla(var(--background-hsl), 0.8)' }}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {baker.logo_url && (
                        <img src={baker.logo_url} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
                    )}
                    <span className="text-foreground font-light text-xl tracking-wider">
                        {baker.business_name}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-full hover:scale-[var(--btn-hover-scale)] transition-all duration-[var(--transition-speed)] shadow-[var(--shadow-luxury)]"
                        onClick={() => document.getElementById('consultation').scrollIntoView({ behavior: 'smooth' })}
                    >
                        Book Consultation
                    </Button>
                    <ThemeModeToggle className="text-foreground" />
                </div>
            </div>
        </nav>

        <div 
            className="flex flex-col min-h-screen text-foreground"
            style={{ 
                background: `hsl(var(--background))`,
                ...(currentTheme?.background_texture_url && {
                    backgroundImage: `url(${currentTheme.background_texture_url})`,
                    backgroundRepeat: 'repeat',
                    backgroundBlendMode: 'soft-light'
                })
            }}
        >
            {/* Aurora Background Glows */}
            <div 
                className="fixed top-0 left-0 w-3/4 h-3/4 rounded-full -translate-x-1/2 -translate-y-1/3 opacity-20 pointer-events-none -z-10" 
                style={{
                    background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 60%)',
                    filter: 'blur(150px)'
                }}
            ></div>
            <div 
                className="fixed bottom-0 right-0 w-2/3 h-2/3 rounded-full translate-x-1/3 translate-y-2/3 opacity-15 pointer-events-none -z-10"
                style={{
                    background: 'radial-gradient(circle, hsl(var(--chart-2)) 0%, transparent 60%)',
                    filter: 'blur(150px)'
                }}
            ></div>
            
            {/* Main content grows to push footer down */}
            <main className="flex-grow">
                {/* New Hero Section */}
                <HeroSection />

                {/* Gallery Section */}
                <section className="py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl md:text-6xl font-extralight mb-8 text-foreground">
                                Our Masterpieces
                            </h2>
                            <p className="text-xl md:text-2xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                Explore a collection crafted with passion and precision.
                            </p>
                            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-8"></div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                            {['all', 'wedding', 'birthday', 'corporate', 'holiday', 'specialty', 'cupcakes', 'desserts'].map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-6 py-3 rounded-[var(--radius)] font-medium transition-all duration-[var(--transition-speed)] hover:scale-[var(--btn-hover-scale)] ${
                                        selectedCategory === category
                                            ? 'bg-primary text-primary-foreground shadow-[var(--shadow-luxury)]'
                                            : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border'
                                    }`}
                                >
                                    {category === 'all' ? '# All' : category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                        
                        {displayGallery.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                                {displayGallery.slice(0, 9).map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="group bg-card border border-border rounded-[calc(var(--radius)*2)] overflow-hidden transition-all duration-[var(--transition-speed)] hover:scale-[var(--btn-hover-scale)] hover:shadow-[var(--shadow-luxury)]"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img 
                                                src={item.image_url} 
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 rounded-[var(--radius)] shadow-lg">
                                                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                                </Badge>
                                            </div>
                                            {item.featured && (
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-gradient-to-r from-chart-1 to-chart-2 text-primary-foreground font-semibold px-3 py-1 rounded-[var(--radius)] shadow-lg flex items-center">
                                                        <Crown className="w-3 h-3 mr-1" />
                                                        Featured
                                                    </Badge>
                                                </div>
                                            )}
                                            
                                            {/* Heart Button Overlay */}
                                            <div className="absolute bottom-4 right-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleHeartClick(item);
                                                    }}
                                                    className="group/heart bg-card/90 backdrop-blur-sm border border-border/50 rounded-full p-3 shadow-[var(--shadow-luxury)] hover:scale-110 transition-all duration-300 hover:bg-primary/20"
                                                >
                                                    <Heart 
                                                        className="w-5 h-5 text-primary group-hover/heart:fill-primary transition-all duration-300" 
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="flex-shrink-0">
                                                    {baker.logo_url ? (
                                                        <img 
                                                            src={baker.logo_url} 
                                                            alt={baker.business_name}
                                                            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg bg-primary">
                                                            {baker.business_name?.charAt(0) || 'B'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-lg leading-tight mb-1 text-card-foreground">
                                                        {baker.business_name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date().toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <h4 className="font-semibold mb-2 line-clamp-2 text-card-foreground">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm leading-relaxed mb-4 line-clamp-2 text-muted-foreground">
                                                {item.description}
                                            </p>
                                            
                                            <div className="flex items-center justify-between text-sm mb-4 text-muted-foreground">
                                                <button onClick={(e) => { e.stopPropagation(); handleHeartClick(item); }} className="flex items-center gap-2 font-semibold text-primary hover:opacity-80 transition-opacity">
                                                    <Heart className="w-4 h-4 fill-primary text-primary" />
                                                    {item.hearts_count || 0} hearts
                                                </button>
                                                <div className="font-semibold text-primary">
                                                    {`${item.inquiries_count || 0} ${item.inquiries_count === 1 ? 'inquiry' : 'inquiries'}`}
                                                </div>
                                            </div>
                                            
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOrderClick(item);
                                                }}
                                                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-[var(--radius)] transition-all duration-[var(--transition-speed)] hover:scale-[var(--btn-hover-scale)] shadow-[var(--shadow-luxury)]"
                                            >
                                                Order Similar Design
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <ChefHat className="w-32 h-32 mx-auto mb-8 animate-pulse opacity-50 text-muted-foreground" />
                                <h3 className="text-3xl font-light mb-4 text-muted-foreground">
                                    Portfolio Curation in Progress
                                </h3>
                                <p className="text-lg font-light text-muted-foreground">
                                    Our finest works are being carefully selected for display
                                </p>
                            </div>
                        )}
                        
                        <div className="text-center mt-16">
                            <Button 
                                onClick={() => document.getElementById('consultation').scrollIntoView({ behavior: 'smooth' })}
                                size="lg"
                                className="group font-bold px-12 py-4 text-xl rounded-[var(--radius)] bg-primary text-primary-foreground shadow-[var(--shadow-luxury)] transform hover:scale-[var(--btn-hover-scale)] transition-all duration-[var(--transition-speed)]"
                            >
                                <Crown className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                                Begin Your Experience
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
                        </div>
                    </div>
                </section>

                <section id="consultation" className="py-32 bg-gradient-to-b from-secondary/80 via-transparent to-secondary/80 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
                    
                    <div className="max-w-4xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl md:text-6xl font-extralight mb-8 text-foreground">
                                Begin Your Journey
                            </h2>
                            <p className="text-2xl text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed">
                                Tell us about your vision and we'll craft something extraordinary together
                            </p>
                            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-8"></div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-8 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-[calc(var(--radius)*3)] blur-3xl"></div>
                            <div className="relative bg-card border border-border rounded-[calc(var(--radius)*3)] p-10 shadow-[var(--shadow-luxury)]">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <Label htmlFor="name" className="text-card-foreground font-light text-lg mb-3 block">Full Name</Label>
                                            <Input 
                                                id="name" 
                                                value={formData.name} 
                                                onChange={e => handleInputChange('name', e.target.value)} 
                                                required 
                                                className="bg-input border-border text-foreground placeholder-muted-foreground text-lg py-4 rounded-[var(--radius)] focus:border-ring focus:ring-ring/25 focus:bg-accent transition-all duration-[var(--transition-speed)]"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email" className="text-card-foreground font-light text-lg mb-3 block">Email Address</Label>
                                            <Input 
                                                id="email" 
                                                type="email" 
                                                value={formData.email} 
                                                onChange={e => handleInputChange('email', e.target.value)} 
                                                required 
                                                className="bg-input border-border text-foreground placeholder-muted-foreground text-lg py-4 rounded-[var(--radius)] focus:border-ring focus:ring-ring/25 focus:bg-accent transition-all duration-[var(--transition-speed)]"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <Label htmlFor="phone" className="text-card-foreground font-light text-lg mb-3 block">Phone Number</Label>
                                            <Input 
                                                id="phone" 
                                                type="tel" 
                                                value={formData.phone} 
                                                onChange={e => handleInputChange('phone', e.target.value)} 
                                                className="bg-input border-border text-foreground placeholder-muted-foreground text-lg py-4 rounded-[var(--radius)] focus:border-ring focus:ring-ring/25 focus:bg-accent transition-all duration-[var(--transition-speed)]"
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="event_date" className="text-card-foreground font-light text-lg mb-3 block">Event Date</Label>
                                            <Input 
                                                id="event_date" 
                                                type="date" 
                                                value={formData.event_date} 
                                                onChange={e => handleInputChange('event_date', e.target.value)} 
                                                required 
                                                className="bg-input border-border text-foreground placeholder-muted-foreground text-lg py-4 rounded-[var(--radius)] focus:border-ring focus:ring-ring/25 focus:bg-accent transition-all duration-[var(--transition-speed)]"
                                                min={new Date(Date.now() + (baker?.lead_time_days || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div>
                                            <Label htmlFor="event_type" className="text-card-foreground font-light text-lg mb-3 block">Occasion</Label>
                                            <select
                                                id="event_type"
                                                value={formData.event_type}
                                                onChange={e => handleInputChange('event_type', e.target.value)}
                                                className="w-full bg-input border border-border text-foreground text-lg py-4 px-4 rounded-[var(--radius)] focus:border-ring focus:ring-ring/25 focus:bg-accent transition-all duration-[var(--transition-speed)]"
                                            >
                                                <option value="birthday">Birthday Celebration</option>
                                                <option value="wedding">Wedding</option>
                                                <option value="anniversary">Anniversary</option>
                                                <option value="graduation">Graduation</option>
                                                <option value="baby_shower">Baby Shower</option>
                                                <option value="corporate">Corporate Event</option>
                                                <option value="holiday">Holiday</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="serves_count" className="text-card-foreground font-light text-lg mb-3 block">Serves</Label>
                                            <Input 
                                                id="serves_count" 
                                                type="number" 
                                                value={formData.serves_count} 
                                                onChange={e => handleInputChange('serves_count', e.target.value)} 
                                                className="bg-input border-border text-foreground placeholder-muted-foreground text-lg py-4 rounded-[var(--radius)] focus:border-ring focus:ring-ring/25 focus:bg-accent transition-all duration-[var(--transition-speed)]"
                                                placeholder="20 people"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-card-foreground font-light text-lg mb-3 block">Investment Range</Label>
                                            <div className="flex gap-3">
                                                <Input 
                                                    type="number" 
                                                    value={formData.budget_min} 
                                                    onChange={e => handleInputChange('budget_min', e.target.value)} 
                                                    className="bg-input border-border text-foreground placeholder-muted-foreground text-lg py-4 rounded-[var(--radius)] focus:border-ring focus:ring-ring/25 focus:bg-accent transition-all duration-[var(--transition-speed)]"
                                                    placeholder="$500"
                                                />
                                                <Input 
                                                    type="number" 
                                                    value={formData.budget_max} 
                                                    onChange={e => handleInputChange('budget_max', e.target.value)} 
                                                    className="bg-input border-border text-foreground placeholder-muted-foreground text-lg py-4 rounded-[var(--radius)] focus:border-ring focus:ring-ring/25 focus:bg-accent transition-all duration-[var(--transition-speed)]"
                                                    placeholder="$2000"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="cake_description" className="text-card-foreground font-light text-lg mb-3 block">Vision & Details</Label>
                                        <Textarea 
                                            id="cake_description" 
                                            value={formData.cake_description} 
                                            onChange={e => handleInputChange('cake_description', e.target.value)} 
                                            required 
                                            rows={6} 
                                            className="bg-input border-border text-foreground placeholder-muted-foreground text-lg py-4 rounded-[var(--radius)] focus:border-ring focus:ring-ring/25 focus:bg-accent transition-all duration-[var(--transition-speed)] resize-none"
                                            placeholder="Share your vision... Tell us about themes, colors, flavors, dietary requirements, inspiration, and any special details that will make this creation uniquely yours."
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-card-foreground font-light text-lg mb-3 block">Design Inspiration</Label>
                                        <DesignUploader onImagesChange={handleImagesChange} />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="group relative w-full bg-primary text-primary-foreground font-bold py-6 text-xl rounded-[calc(var(--radius)*2)] shadow-[var(--shadow-luxury)] transform hover:scale-[var(--btn-hover-scale)] transition-all duration-[var(--transition-speed)] overflow-hidden"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current mr-3"></div>
                                                Processing Your Request...
                                            </>
                                        ) : (
                                            <>
                                                <Crown className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                                                Begin Luxury Experience
                                                <Shield className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform duration-300" />
                                            </>
                                        )}
                                    </Button>
                                    
                                    <div className="text-center">
                                        <p className="text-muted-foreground font-light flex items-center justify-center">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Personalized response within 2 hours • 100% satisfaction guaranteed
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-auto border-t border-border py-16 bg-card/80 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <div className="mb-12">
                        {baker.logo_url && (
                            <img src={baker.logo_url} alt="Logo" className="h-16 w-16 rounded-full mx-auto mb-6 object-cover"/>
                        )}
                        <h3 className="text-3xl font-light mb-4 text-card-foreground">
                            {baker.business_name}
                        </h3>
                        <p className="font-light text-lg text-muted-foreground">
                            {baker.tagline}
                        </p>
                    </div>
                    <div className="border-t border-border pt-8">
                        <p className="font-light text-muted-foreground">
                            &copy; {new Date().getFullYear()} {baker.business_name}. Crafting edible luxury since inception.
                        </p>
                    </div>
                </div>
            </footer>
        </div>

        <style jsx>{`
            @keyframes fade-in-up {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .animate-fade-in-up {
                animation: fade-in-up 0.8s ease-out forwards;
            }
            
            .delay-200 {
                animation-delay: 0.2s;
            }
            
            .delay-400 {
                animation-delay: 0.4s;
            }
        `}</style>
        </>
    );
}
