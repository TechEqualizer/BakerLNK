import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Palette, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ThemeSelector({ themes, currentThemeId, onSelectTheme }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isApplying, setIsApplying] = useState(null);

    const handleSelect = async (themeId) => {
        if (themeId === currentThemeId) {
            setIsOpen(false);
            return;
        }
        setIsApplying(themeId);
        await onSelectTheme(themeId);
        setIsApplying(null);
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in-0" 
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
            
            <div className="relative">
                {/* Panel */}
                {isOpen && (
                    <Card className="absolute bottom-[120%] right-0 w-80 shadow-2xl animate-in slide-in-from-bottom-5 fade-in-0 duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Select Theme</CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="max-h-[50vh] overflow-y-auto space-y-2">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => handleSelect(theme.id)}
                                    disabled={!!isApplying}
                                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                                        currentThemeId === theme.id 
                                            ? 'bg-accent ring-2 ring-primary' 
                                            : 'hover:bg-accent'
                                    }`}
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-card-foreground">{theme.theme_name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{theme.category}</p>
                                    </div>
                                    <div className="w-6 flex items-center justify-center">
                                    {isApplying === theme.id ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                    ) : currentThemeId === theme.id ? (
                                        <Check className="h-5 w-5 text-primary" />
                                    ) : null}
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Trigger Button */}
                <Button
                    size="lg"
                    className="rounded-full w-16 h-16 shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transform hover:scale-110 transition-transform"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-7 w-7" /> : <Palette className="h-7 w-7" />}
                </Button>
            </div>
        </div>
    );
}