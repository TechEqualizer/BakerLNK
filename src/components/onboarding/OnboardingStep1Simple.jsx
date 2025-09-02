import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Store, Sparkles, CakeSlice, Croissant, Cookie, Wheat } from 'lucide-react';

export default function OnboardingStep1Simple({ data, onChange }) {
    const handleInputChange = (field, value) => {
        onChange({ [field]: value });
    };

    const categories = [
        { 
            id: 'custom-cakes', 
            label: 'Custom Cakes', 
            icon: CakeSlice, 
            description: 'Weddings, birthdays, special occasions',
            color: 'from-pink-400 to-rose-500' 
        },
        { 
            id: 'bakery-cafe', 
            label: 'Bakery & Cafe', 
            icon: Croissant, 
            description: 'Daily fresh bread, pastries, coffee',
            color: 'from-amber-400 to-orange-500' 
        },
        { 
            id: 'desserts-pastries', 
            label: 'Desserts & Pastries', 
            icon: Cookie, 
            description: 'Cookies, cupcakes, sweet treats',
            color: 'from-purple-400 to-indigo-500' 
        },
        { 
            id: 'artisan-breads', 
            label: 'Artisan Breads', 
            icon: Wheat, 
            description: 'Handcrafted sourdough, specialty breads',
            color: 'from-yellow-400 to-amber-500' 
        }
    ];

    return (
        <div className="space-y-8">
            {/* Business Name - Most Important */}
            <div className="text-center">
                <Label htmlFor="business_name" className="flex items-center justify-center gap-2 text-amber-800 font-semibold text-lg mb-4">
                    <Store className="w-5 h-5" />
                    What's your bakery called?
                </Label>
                <Input
                    id="business_name"
                    value={data.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Sweet Dreams Bakery"
                    required
                    className="text-center text-2xl font-bold border-2 border-amber-300 focus:border-amber-500 py-4 bg-white"
                />
            </div>

            {/* Tagline */}
            <div>
                <Label htmlFor="tagline" className="text-amber-800 font-medium mb-3 block text-center">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    What makes you special? (Optional)
                </Label>
                <Input
                    id="tagline"
                    value={data.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="Creating magical moments, one cake at a time"
                    className="text-center border-amber-300 focus:border-amber-500 py-3"
                />
            </div>

            {/* Category Selection */}
            <div>
                <Label className="text-amber-800 font-medium mb-4 block text-center text-lg">
                    What type of bakery are you?
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        const isSelected = data.category === category.id;
                        
                        return (
                            <Card
                                key={category.id}
                                className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                                    isSelected 
                                        ? 'border-amber-500 bg-amber-50 shadow-lg' 
                                        : 'border-amber-200 hover:border-amber-400 hover:shadow-md'
                                }`}
                                onClick={() => handleInputChange('category', category.id)}
                            >
                                <div className="p-6 text-center">
                                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {category.label}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {category.description}
                                    </p>
                                    {isSelected && (
                                        <div className="mt-3">
                                            <div className="w-6 h-6 bg-amber-500 rounded-full mx-auto flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
                <Label className="text-amber-800 font-medium mb-3 block text-center text-lg">
                    Contact Information
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="phone_number" className="text-amber-800 font-medium mb-2 block">
                            Phone Number
                        </Label>
                        <Input
                            id="phone_number"
                            value={data.phone_number}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="border-amber-300 focus:border-amber-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email" className="text-amber-800 font-medium mb-2 block">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="hello@sweetdreams.com"
                            className="border-amber-300 focus:border-amber-500"
                        />
                    </div>
                </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
                <Label className="text-amber-800 font-medium mb-3 block text-center text-lg">
                    Social Media (Optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="instagram_url" className="text-amber-800 font-medium mb-2 block">
                            📷 Instagram
                        </Label>
                        <Input
                            id="instagram_url"
                            value={data.instagram_url}
                            onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                            placeholder="https://instagram.com/sweetdreamsbakery"
                            className="border-amber-300 focus:border-amber-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="facebook_url" className="text-amber-800 font-medium mb-2 block">
                            📘 Facebook
                        </Label>
                        <Input
                            id="facebook_url"
                            value={data.facebook_url}
                            onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                            placeholder="https://facebook.com/sweetdreamsbakery"
                            className="border-amber-300 focus:border-amber-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="tiktok_url" className="text-amber-800 font-medium mb-2 block">
                            🎵 TikTok
                        </Label>
                        <Input
                            id="tiktok_url"
                            value={data.tiktok_url}
                            onChange={(e) => handleInputChange('tiktok_url', e.target.value)}
                            placeholder="https://tiktok.com/@sweetdreamsbakery"
                            className="border-amber-300 focus:border-amber-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="website_url" className="text-amber-800 font-medium mb-2 block">
                            🌐 Website
                        </Label>
                        <Input
                            id="website_url"
                            value={data.website_url}
                            onChange={(e) => handleInputChange('website_url', e.target.value)}
                            placeholder="https://sweetdreamsbakery.com"
                            className="border-amber-300 focus:border-amber-500"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Description */}
            <div>
                <Label htmlFor="description" className="text-amber-800 font-medium mb-3 block text-center">
                    Tell customers about your bakery in one sentence
                </Label>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="We create beautiful custom cakes and fresh pastries using family recipes passed down for generations..."
                    rows={3}
                    className="border-amber-300 focus:border-amber-500 text-center"
                />
            </div>
        </div>
    );
}