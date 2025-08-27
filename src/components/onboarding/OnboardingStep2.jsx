import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image as ImageIcon, Crown, Palette, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingStep2({ data, onChange }) {
    const [themes, setThemes] = useState([]);
    const [isUploading, setIsUploading] = useState({ logo: false, hero: false });
    const logoInputRef = useRef(null);
    const heroInputRef = useRef(null);

    useEffect(() => {
        const loadThemes = async () => {
            try {
                const themesData = await Theme.filter({ is_active: true }, 'theme_name');
                setThemes(themesData);
                
                // Auto-select first theme if none selected
                if (!data.selected_theme_id && themesData.length > 0) {
                    onChange({ selected_theme_id: themesData[0].id });
                }
            } catch (error) {
                console.error('Error loading themes:', error);
                toast.error('Failed to load themes');
            }
        };

        loadThemes();
    }, [data.selected_theme_id, onChange]);

    const handleFileUpload = async (file, type) => {
        if (!file) return;

        setIsUploading(prev => ({ ...prev, [type]: true }));
        
        try {
            const result = await UploadFile({ file });
            if (result?.file_url) {
                const field = type === 'logo' ? 'logo_url' : 'hero_image_url';
                onChange({ [field]: result.file_url });
                toast.success(`${type === 'logo' ? 'Logo' : 'Hero image'} uploaded successfully!`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${type}`);
        } finally {
            setIsUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file, type);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="space-y-8">
            {/* Logo and Hero Image Upload */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label className="flex items-center gap-2 text-amber-800 font-medium mb-3">
                        <ImageIcon className="w-4 h-4" />
                        Business Logo
                    </Label>
                    <div className="space-y-3">
                        {data.logo_url && (
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-200 mx-auto">
                                <img src={data.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={isUploading.logo}
                            className="w-full border-amber-300 hover:bg-amber-50"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading.logo ? 'Uploading...' : data.logo_url ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, 'logo')}
                        />
                    </div>
                </div>

                <div>
                    <Label className="flex items-center gap-2 text-amber-800 font-medium mb-3">
                        <ImageIcon className="w-4 h-4" />
                        Hero Background Image
                    </Label>
                    <div className="space-y-3">
                        {data.hero_image_url && (
                            <div className="w-full h-24 rounded-lg overflow-hidden border-2 border-amber-200">
                                <img src={data.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => heroInputRef.current?.click()}
                            disabled={isUploading.hero}
                            className="w-full border-amber-300 hover:bg-amber-50"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading.hero ? 'Uploading...' : data.hero_image_url ? 'Change Hero Image' : 'Upload Hero Image'}
                        </Button>
                        <input
                            ref={heroInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, 'hero')}
                        />
                    </div>
                </div>
            </div>

            {/* Theme Selection */}
            <div>
                <Label className="flex items-center gap-2 text-amber-800 font-medium text-lg mb-4">
                    <Palette className="w-5 h-5" />
                    Choose Your Theme
                </Label>
                <p className="text-amber-600 mb-6">Select the perfect design style for your bakery's showcase</p>
                
                {themes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {themes.map((theme) => (
                            <Card 
                                key={theme.id}
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                    data.selected_theme_id === theme.id
                                        ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20'
                                        : 'hover:shadow-md border-amber-200'
                                }`}
                                onClick={() => onChange({ selected_theme_id: theme.id })}
                            >
                                <div className="relative aspect-video overflow-hidden">
                                    <img 
                                        src={theme.preview_image_url} 
                                        alt={`${theme.theme_name} preview`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                    
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <h3 className="font-bold text-white text-sm drop-shadow-md">{theme.theme_name}</h3>
                                        <Badge variant="secondary" className="text-xs capitalize mt-1 backdrop-blur-sm bg-white/30 text-white border-white/50">
                                            {theme.category}
                                        </Badge>
                                    </div>

                                    {data.selected_theme_id === theme.id && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                
                                <CardContent className="p-3">
                                    <p className="text-xs text-amber-600 line-clamp-2">
                                        {theme.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-amber-600">
                        <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Loading beautiful themes...</p>
                    </div>
                )}
            </div>
        </div>
    );
}