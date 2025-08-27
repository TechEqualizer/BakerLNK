import React, { useState, useEffect } from 'react';
import { ChefHat, Sparkles, Heart, Crown } from 'lucide-react';

export default function BakingAnimation() {
    const [currentStep, setCurrentStep] = useState(0);
    const [ovenOpen, setOvenOpen] = useState(false);

    const steps = [
        "Mixing the perfect ingredients...",
        "Preheating your custom oven...",
        "Baking your beautiful website...",
        "Adding the finishing touches...",
        "Almost ready to serve!"
    ];

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 600);

        // Open oven door animation after 2 seconds
        const ovenTimeout = setTimeout(() => {
            setOvenOpen(true);
        }, 2000);

        return () => {
            clearInterval(stepInterval);
            clearTimeout(ovenTimeout);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-200/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-orange-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-yellow-200/30 rounded-full blur-xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 text-center max-w-lg">
                {/* Oven Animation */}
                <div className="relative mx-auto mb-12 w-48 h-48">
                    {/* Oven Body */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-400 rounded-2xl shadow-2xl">
                        {/* Oven Door */}
                        <div 
                            className={`absolute bottom-4 left-4 right-4 top-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg transition-all duration-1000 transform-gpu ${
                                ovenOpen ? 'rotate-x-45 origin-bottom' : ''
                            }`}
                            style={{
                                perspective: '1000px',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            {/* Oven Window */}
                            <div className="absolute top-2 left-2 right-2 bottom-8 bg-gradient-to-br from-yellow-400/80 to-orange-500/80 rounded-md overflow-hidden">
                                {/* Baking Glow */}
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/50 to-yellow-300/50 animate-pulse"></div>
                                
                                {/* Cake Rising Animation */}
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                                    <div className="relative">
                                        <div className="w-16 h-8 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-full animate-bounce"></div>
                                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                                            <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" />
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Hearts */}
                                <div className="absolute inset-0">
                                    {[...Array(5)].map((_, i) => (
                                        <Heart 
                                            key={i}
                                            className={`absolute w-3 h-3 text-pink-300 animate-float opacity-60`}
                                            style={{
                                                left: `${20 + i * 15}%`,
                                                animationDelay: `${i * 0.5}s`,
                                                animationDuration: '2s'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Oven Handle */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gray-600 rounded-full"></div>
                        </div>

                        {/* Oven Controls */}
                        <div className="absolute top-2 left-4 right-4 flex justify-between">
                            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-300"></div>
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-700"></div>
                        </div>
                    </div>

                    {/* Steam/Smoke Effects */}
                    {ovenOpen && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-4 h-8 bg-white/60 rounded-full blur-sm animate-float opacity-80"
                                    style={{
                                        left: `${-10 + i * 10}px`,
                                        animationDelay: `${i * 0.3}s`,
                                        animationDuration: '3s'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Chef Hat Icon with Animation */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <ChefHat className="w-16 h-16 text-amber-600 animate-bounce" />
                        <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6">
                    Baking Your Perfect Website
                </h1>

                {/* Progress Steps */}
                <div className="space-y-3 mb-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-center gap-3 text-lg transition-all duration-500 ${
                                index <= currentStep 
                                    ? 'text-amber-800 font-semibold scale-105' 
                                    : 'text-amber-400 opacity-60'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                index <= currentStep ? 'bg-amber-500 animate-pulse' : 'bg-amber-300'
                            }`} />
                            <span>{step}</span>
                            {index <= currentStep && (
                                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Loading Bar */}
                <div className="max-w-xs mx-auto mb-6">
                    <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 relative"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </div>
                    </div>
                    <p className="text-amber-600 text-sm mt-2 font-medium">
                        {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                    </p>
                </div>

                {/* Fun Message */}
                <p className="text-amber-700 text-lg font-light leading-relaxed">
                    We're crafting something absolutely <em className="font-semibold text-amber-800">delicious</em> for you! 
                    <br />
                    Your bakery's digital showcase is rising beautifully in our ovens.
                </p>

                {/* Decorative Elements */}
                <div className="flex justify-center gap-4 mt-8">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 bg-amber-300 rounded-full animate-bounce opacity-60"
                            style={{
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '1.5s'
                            }}
                        />
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 1; }
                    50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
                }
                
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
                
                @keyframes rotate-x {
                    from { transform: rotateX(0deg); }
                    to { transform: rotateX(45deg); }
                }
            `}</style>
        </div>
    );
}