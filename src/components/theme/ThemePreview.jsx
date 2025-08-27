import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Palette, CheckCircle } from 'lucide-react';

export default function ThemePreview({ theme, isSelected = false, onSelect, isLoading = false }) {
    return (
        <Card className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ${
            isSelected 
                ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' 
                : 'hover:shadow-md border-amber-200 bg-white hover:-translate-y-1'
        }`}>
            <div className="relative aspect-video overflow-hidden">
                <img 
                    src={theme.preview_image_url} 
                    alt={`Preview of ${theme.theme_name} theme`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-white text-lg drop-shadow-md">{theme.theme_name}</h3>
                    <Badge variant="secondary" className="text-xs capitalize mt-1 backdrop-blur-sm bg-white/30 text-white border-white/50">
                        {theme.category}
                    </Badge>
                </div>

                {isSelected && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Crown className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>
            
            <CardContent className="p-4">
                <p className="text-sm text-amber-600 mb-4 h-10 line-clamp-2">
                    {theme.description}
                </p>
                
                {onSelect && (
                    <Button 
                        onClick={() => onSelect(theme.id)}
                        disabled={isLoading}
                        className={`w-full transition-all duration-300 ${
                            isSelected 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Applying...
                            </>
                        ) : isSelected ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Active Theme
                            </>
                        ) : (
                            <>
                                <Palette className="w-4 h-4 mr-2" />
                                Select Theme
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}