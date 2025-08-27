import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Store, Mail, Phone, MapPin, Clock, Users, Percent } from 'lucide-react';

export default function OnboardingStep1({ data, onChange }) {
    const handleInputChange = (field, value) => {
        onChange({ [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="business_name" className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                        <Store className="w-4 h-4" />
                        Business Name *
                    </Label>
                    <Input
                        id="business_name"
                        value={data.business_name}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        placeholder="Sweet Dreams Bakery"
                        required
                        className="border-amber-300 focus:border-amber-500"
                    />
                </div>
                
                <div>
                    <Label htmlFor="tagline" className="text-amber-800 font-medium mb-2 block">
                        Tagline
                    </Label>
                    <Input
                        id="tagline"
                        value={data.tagline}
                        onChange={(e) => handleInputChange('tagline', e.target.value)}
                        placeholder="Making sweet memories since..."
                        className="border-amber-300 focus:border-amber-500"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="description" className="text-amber-800 font-medium mb-2 block">
                    About Your Bakery
                </Label>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell your customers about your passion, your story, and what makes your bakery special..."
                    rows={4}
                    className="border-amber-300 focus:border-amber-500"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="email" className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                        <Mail className="w-4 h-4" />
                        Contact Email *
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="hello@sweetdreamsbakery.com"
                        required
                        className="border-amber-300 focus:border-amber-500"
                    />
                </div>
                
                <div>
                    <Label htmlFor="phone" className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="border-amber-300 focus:border-amber-500"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="location" className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                    <MapPin className="w-4 h-4" />
                    Location / Service Area
                </Label>
                <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="San Francisco Bay Area"
                    className="border-amber-300 focus:border-amber-500"
                />
            </div>

            {/* Business Rules Section */}
            <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-4">Business Settings</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="lead_time_days" className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                            <Clock className="w-4 h-4" />
                            Lead Time (days)
                        </Label>
                        <Input
                            id="lead_time_days"
                            type="number"
                            value={data.lead_time_days}
                            onChange={(e) => handleInputChange('lead_time_days', parseInt(e.target.value) || 7)}
                            min="1"
                            className="border-amber-300 focus:border-amber-500"
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="max_orders_per_day" className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                            <Users className="w-4 h-4" />
                            Max Orders/Day
                        </Label>
                        <Input
                            id="max_orders_per_day"
                            type="number"
                            value={data.max_orders_per_day}
                            onChange={(e) => handleInputChange('max_orders_per_day', parseInt(e.target.value) || 3)}
                            min="1"
                            className="border-amber-300 focus:border-amber-500"
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="deposit_percentage" className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                            <Percent className="w-4 h-4" />
                            Deposit %
                        </Label>
                        <Input
                            id="deposit_percentage"
                            type="number"
                            value={data.deposit_percentage}
                            onChange={(e) => handleInputChange('deposit_percentage', parseInt(e.target.value) || 25)}
                            min="0"
                            max="100"
                            className="border-amber-300 focus:border-amber-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}