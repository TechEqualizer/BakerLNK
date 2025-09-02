import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    Sparkles, 
    Share2, 
    Copy, 
    Check, 
    ExternalLink, 
    LayoutDashboard,
    PartyPopper
} from 'lucide-react';
import { toast } from 'sonner';

export default function CelebrationOverlay({ bakeryName, onClose }) {
    const [copied, setCopied] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);
    
    // Generate a simple URL slug from bakery name
    const urlSlug = bakeryName?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() || 'mybakery';
    
    const publicUrl = `${window.location.origin}/public/${urlSlug}`;
    
    useEffect(() => {
        // Auto-hide confetti after 5 seconds
        const timer = setTimeout(() => {
            setShowConfetti(false);
        }, 5000);
        
        return () => clearTimeout(timer);
    }, []);
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${bakeryName} - Bakery Showcase`,
                text: `Check out my bakery's beautiful showcase!`,
                url: publicUrl
            }).catch(err => console.log('Error sharing:', err));
        } else {
            handleCopy();
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Confetti Animation */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10px',
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        >
                            <div 
                                className={`w-3 h-3 ${
                                    ['bg-pink-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][Math.floor(Math.random() * 6)]
                                } ${
                                    ['rounded-full', 'rotate-45'][Math.floor(Math.random() * 2)]
                                }`}
                            />
                        </div>
                    ))}
                </div>
            )}
            
            <Card className="relative max-w-lg w-full bg-white shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8 text-center">
                    {/* Celebration Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                                <PartyPopper className="w-12 h-12 text-white" />
                            </div>
                            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-spin" />
                            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-pink-500 animate-spin" style={{ animationDirection: 'reverse' }} />
                        </div>
                    </div>
                    
                    {/* Success Message */}
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Your Bakery is Live! 🎉
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {bakeryName} is now ready to delight customers with your amazing creations!
                    </p>
                    
                    {/* URL Display */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-2">Your bakery's public URL:</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm font-mono text-gray-800 truncate">
                                {publicUrl}
                            </code>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopy}
                                className="shrink-0"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleShare}
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Your Bakery
                        </Button>
                        
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => window.open(publicUrl, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Site
                            </Button>
                            
                            <Link to={createPageUrl('Dashboard')} className="flex-1">
                                <Button
                                    variant="default"
                                    className="w-full"
                                    onClick={onClose}
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                    
                    {/* Tips */}
                    <p className="text-xs text-gray-500 mt-6">
                        💡 Tip: You can customize your bakery further from the dashboard!
                    </p>
                </div>
            </Card>
            
            <style jsx>{`
                @keyframes confetti {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                
                .animate-confetti {
                    animation: confetti linear forwards;
                }
            `}</style>
        </div>
    );
}