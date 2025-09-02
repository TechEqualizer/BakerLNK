import React, { useState, useEffect } from 'react';
import { Baker, Gallery, Theme } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ChefHat, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import OnboardingStep1Simple from '../components/onboarding/OnboardingStep1Simple';
import OnboardingStep2 from '../components/onboarding/OnboardingStep2';
import OnboardingStep3 from '../components/onboarding/OnboardingStep3';
import BakingAnimation from '../components/onboarding/BakingAnimation';

export default function OnboardingWizard() {
    const [currentStep, setCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem('onboarding_step');
        return savedStep ? parseInt(savedStep) : 1;
    });
    const [isCompleting, setIsCompleting] = useState(false);
    const [user, setUser] = useState(null);
    // Load saved data from localStorage or use defaults
    const getInitialWizardData = () => {
        const saved = localStorage.getItem('onboarding_data');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing saved onboarding data:', e);
            }
        }
        return {
            step1: {
                business_name: '',
                tagline: '',
                description: '',
                category: '',
                email: '',
                phone: '',
                location: '',
                lead_time_days: 7,
                max_orders_per_day: 3,
                deposit_percentage: 25
            },
            step2: {
                logo_url: '',
                hero_image_url: '',
                selected_theme_id: ''
            },
            step3: {
                galleryImages: []
            }
        };
    };

    const [wizardData, setWizardData] = useState(getInitialWizardData());

    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                
                // Check for force parameter to bypass baker check (for testing)
                const urlParams = new URLSearchParams(window.location.search);
                const forceWizard = urlParams.get('force') === 'true';
                
                if (!forceWizard) {
                    // Check if THIS user already has baker data
                    const allBakers = await Baker.list();
                    const userBaker = allBakers.find(baker => baker.user_id === currentUser.id);
                    if (userBaker) {
                        // This user already has a baker setup, redirect to dashboard
                        navigate(createPageUrl('Dashboard'));
                        return;
                    }
                }
                
                // Pre-fill email from user data
                setWizardData(prev => ({
                    ...prev,
                    step1: {
                        ...prev.step1,
                        email: currentUser.email || ''
                    }
                }));
            } catch (error) {
                console.error('Error checking user:', error);
                toast.error('Please log in to continue');
            }
        };

        checkUser();
    }, [navigate]);

    const updateStepData = (step, data) => {
        setWizardData(prev => {
            const newData = {
                ...prev,
                [step]: { ...prev[step], ...data }
            };
            
            // Save to localStorage for persistence
            localStorage.setItem('onboarding_data', JSON.stringify(newData));
            
            return newData;
        });
    };

    const nextStep = () => {
        if (currentStep < 3) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            localStorage.setItem('onboarding_step', newStep.toString());
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            localStorage.setItem('onboarding_step', newStep.toString());
        }
    };

    const completeBaking = async () => {
        console.log('completeBaking called with data:', wizardData);
        setIsCompleting(true);
        
        try {
            // Check if this is a forced wizard run (testing)
            const urlParams = new URLSearchParams(window.location.search);
            const forceWizard = urlParams.get('force') === 'true';
            
            if (forceWizard) {
                // For testing, update existing baker instead of creating new
                const existingBakers = await Baker.list();
                if (existingBakers.length > 0) {
                    const bakerData = {
                        ...wizardData.step1,
                        ...wizardData.step2,
                        lead_time_days: parseInt(wizardData.step1.lead_time_days) || 7,
                        max_orders_per_day: parseInt(wizardData.step1.max_orders_per_day) || 3,
                        deposit_percentage: parseInt(wizardData.step1.deposit_percentage) || 25
                    };
                    await Baker.update(existingBakers[0].id, bakerData);
                } else {
                    // Create new baker if none exists
                    const bakerData = {
                        ...wizardData.step1,
                        ...wizardData.step2,
                        lead_time_days: parseInt(wizardData.step1.lead_time_days) || 7,
                        max_orders_per_day: parseInt(wizardData.step1.max_orders_per_day) || 3,
                        deposit_percentage: parseInt(wizardData.step1.deposit_percentage) || 25
                    };
                    await Baker.create(bakerData);
                }
            } else {
                // Normal flow: create or update baker for this user
                const bakerData = {
                    business_name: wizardData.step1.business_name,
                    tagline: wizardData.step1.tagline,
                    description: wizardData.step1.description,
                    email: wizardData.step1.email,
                    phone: wizardData.step1.phone,
                    location: wizardData.step1.location,
                    logo_url: wizardData.step2.logo_url,
                    hero_image_url: wizardData.step2.hero_image_url,
                    selected_theme_id: wizardData.step2.selected_theme_id,
                    user_id: user.id, // Associate baker with current user
                    lead_time_days: parseInt(wizardData.step1.lead_time_days) || 7,
                    max_orders_per_day: parseInt(wizardData.step1.max_orders_per_day) || 3,
                    deposit_percentage: parseInt(wizardData.step1.deposit_percentage) || 25
                };
                
                // Check if user already has a baker profile
                const allBakers = await Baker.list();
                const existingBaker = allBakers.find(baker => baker.user_id === user.id);
                
                if (existingBaker) {
                    await Baker.update(existingBaker.id, bakerData);
                } else {
                    await Baker.create(bakerData);
                }
            }

            // Step 2: Create Gallery items if any
            if (wizardData.step3.galleryImages.length > 0) {
                for (const image of wizardData.step3.galleryImages) {
                    const galleryItem = {
                        title: image.title || 'Beautiful Creation',
                        description: image.description || 'A delightful creation from our kitchen',
                        image_url: image.url,
                        category: image.category || 'specialty',
                        featured: image.featured || false,
                        tags: Array.isArray(image.tags) ? image.tags.join(',') : (image.tags || '')
                    };
                    
                    await Gallery.create(galleryItem);
                }
            }

            // Wait for baking animation to complete (3 seconds)
            await new Promise(resolve => setTimeout(resolve, 3000));

            toast.success('🎉 Your bakery website is ready!');
            
            // Store first visit flag for celebration
            localStorage.setItem('showCelebration', 'true');
            
            // Clear onboarding data after successful completion
            localStorage.removeItem('onboarding_data');
            localStorage.removeItem('onboarding_step');
            
            // Redirect to public showcase page to see their live site
            navigate('/public');
            
        } catch (error) {
            console.error('Error completing onboarding:', error);
            toast.error('Something went wrong. Please try again.');
            setIsCompleting(false);
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1: return 'Let\'s Meet Your Bakery!';
            case 2: return 'Pick Your Perfect Style';
            case 3: return 'Show Off Your Best Work';
            default: return 'Getting Started';
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case 1: return 'Just the basics - this will only take 30 seconds!';
            case 2: return 'Choose a theme that makes your creations shine';
            case 3: return 'Upload 3-5 photos of your amazing work';
            default: return 'Let\'s create something amazing together';
        }
    };

    const progressValue = (currentStep / 3) * 100;

    if (isCompleting) {
        return <BakingAnimation />;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <ChefHat className="w-12 h-12 text-amber-600" />
                        <h1 className="text-4xl font-bold text-amber-900">Welcome to BakerLink!</h1>
                        <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                    <p className="text-xl text-amber-700 mb-8">Let's bake your perfect bakery website in just 3 easy steps</p>
                    
                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto mb-8">
                        <div className="flex justify-between text-sm text-amber-600 mb-2">
                            <span className={currentStep >= 1 ? 'font-semibold' : ''}>📝 Basics</span>
                            <span className={currentStep >= 2 ? 'font-semibold' : ''}>🎨 Style</span>
                            <span className={currentStep >= 3 ? 'font-semibold' : ''}>📸 Gallery</span>
                        </div>
                        <Progress value={progressValue} className="h-3" />
                        <p className="text-sm text-amber-600 mt-2">
                            Step {currentStep} of 3 • 
                            {currentStep === 1 && " Almost there! Just the essentials"}
                            {currentStep === 2 && " Looking great! Pick your style"}
                            {currentStep === 3 && " Final step! Show your best work"}
                        </p>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">{getStepTitle()}</h2>
                        <p className="text-amber-100">{getStepDescription()}</p>
                    </div>
                    
                    <div className="p-8">
                        {currentStep === 1 && (
                            <OnboardingStep1Simple 
                                data={wizardData.step1}
                                onChange={(data) => updateStepData('step1', data)}
                            />
                        )}
                        {currentStep === 2 && (
                            <OnboardingStep2 
                                data={wizardData.step2}
                                onChange={(data) => updateStepData('step2', data)}
                            />
                        )}
                        {currentStep === 3 && (
                            <OnboardingStep3 
                                data={wizardData.step3}
                                onChange={(data) => updateStepData('step3', data)}
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="px-8 pb-8 flex justify-between items-center">
                        <Button 
                            variant="outline" 
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-6"
                        >
                            ← Previous
                        </Button>

                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map(step => (
                                <div 
                                    key={step}
                                    className={`w-3 h-3 rounded-full transition-colors ${
                                        step <= currentStep 
                                            ? 'bg-amber-500' 
                                            : 'bg-amber-200'
                                    }`}
                                />
                            ))}
                        </div>

                        {currentStep < 3 ? (
                            <Button 
                                onClick={nextStep}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6"
                            >
                                Next →
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => {
                                    console.log('Start Baking clicked, wizardData:', wizardData);
                                    completeBaking();
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 font-semibold"
                            >
                                <ChefHat className="w-4 h-4 mr-2" />
                                Start Baking! 🔥
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}