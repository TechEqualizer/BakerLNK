import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, MousePointer, Square, Type, MessageSquare } from 'lucide-react';

export default function ComponentRecipeEditor({ recipes, onRecipeChange }) {
    const handleInputChange = (component, variant, property, value) => {
        const newRecipes = { ...recipes };
        if (!newRecipes[component]) newRecipes[component] = {};
        if (!newRecipes[component][variant]) newRecipes[component][variant] = {};
        newRecipes[component][variant][property] = value;
        onRecipeChange(newRecipes);
    };

    const getRecipeValue = (component, variant, property) => {
        return recipes?.[component]?.[variant]?.[property] || '';
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-amber-900 mb-4">Component Recipes</h3>
                <p className="text-amber-700">Define how individual UI components should look and behave with this theme</p>
            </div>

            <Tabs defaultValue="button" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="button" className="flex items-center gap-2">
                        <MousePointer className="w-4 h-4" />
                        Buttons
                    </TabsTrigger>
                    <TabsTrigger value="card" className="flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        Cards
                    </TabsTrigger>
                    <TabsTrigger value="input" className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Inputs
                    </TabsTrigger>
                    <TabsTrigger value="dialog" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Dialogs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="button" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5" />
                                Primary Button Recipe
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Border Radius</Label>
                                <Input
                                    value={getRecipeValue('button', 'primary', 'border_radius')}
                                    onChange={(e) => handleInputChange('button', 'primary', 'border_radius', e.target.value)}
                                    placeholder="12px"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Padding</Label>
                                <Input
                                    value={getRecipeValue('button', 'primary', 'padding')}
                                    onChange={(e) => handleInputChange('button', 'primary', 'padding', e.target.value)}
                                    placeholder="12px 24px"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Font Weight</Label>
                                <Input
                                    value={getRecipeValue('button', 'primary', 'font_weight')}
                                    onChange={(e) => handleInputChange('button', 'primary', 'font_weight', e.target.value)}
                                    placeholder="600"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Letter Spacing</Label>
                                <Input
                                    value={getRecipeValue('button', 'primary', 'letter_spacing')}
                                    onChange={(e) => handleInputChange('button', 'primary', 'letter_spacing', e.target.value)}
                                    placeholder="0.5px"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Box Shadow</Label>
                                <Input
                                    value={getRecipeValue('button', 'primary', 'box_shadow')}
                                    onChange={(e) => handleInputChange('button', 'primary', 'box_shadow', e.target.value)}
                                    placeholder="var(--shadow-luxury)"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Hover Transform</Label>
                                <Input
                                    value={getRecipeValue('button', 'primary', 'hover_transform')}
                                    onChange={(e) => handleInputChange('button', 'primary', 'hover_transform', e.target.value)}
                                    placeholder="scale(1.02) translateY(-1px)"
                                    className="font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Secondary Button Recipe</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Border Radius</Label>
                                <Input
                                    value={getRecipeValue('button', 'secondary', 'border_radius')}
                                    onChange={(e) => handleInputChange('button', 'secondary', 'border_radius', e.target.value)}
                                    placeholder="8px"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Border Style</Label>
                                <Input
                                    value={getRecipeValue('button', 'secondary', 'border_style')}
                                    onChange={(e) => handleInputChange('button', 'secondary', 'border_style', e.target.value)}
                                    placeholder="2px solid"
                                    className="font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="card" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Default Card Recipe</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Border Radius</Label>
                                <Input
                                    value={getRecipeValue('card', 'default', 'border_radius')}
                                    onChange={(e) => handleInputChange('card', 'default', 'border_radius', e.target.value)}
                                    placeholder="16px"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Backdrop Filter</Label>
                                <Input
                                    value={getRecipeValue('card', 'default', 'backdrop_filter')}
                                    onChange={(e) => handleInputChange('card', 'default', 'backdrop_filter', e.target.value)}
                                    placeholder="blur(12px)"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Border</Label>
                                <Input
                                    value={getRecipeValue('card', 'default', 'border')}
                                    onChange={(e) => handleInputChange('card', 'default', 'border', e.target.value)}
                                    placeholder="1px solid rgba(255,255,255,0.1)"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Hover Transform</Label>
                                <Input
                                    value={getRecipeValue('card', 'default', 'hover_transform')}
                                    onChange={(e) => handleInputChange('card', 'default', 'hover_transform', e.target.value)}
                                    placeholder="translateY(-4px)"
                                    className="font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="input" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Input Field Recipe</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Border Radius</Label>
                                <Input
                                    value={getRecipeValue('input', 'default', 'border_radius')}
                                    onChange={(e) => handleInputChange('input', 'default', 'border_radius', e.target.value)}
                                    placeholder="8px"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Font Size</Label>
                                <Input
                                    value={getRecipeValue('input', 'default', 'font_size')}
                                    onChange={(e) => handleInputChange('input', 'default', 'font_size', e.target.value)}
                                    placeholder="16px"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Focus Ring</Label>
                                <Input
                                    value={getRecipeValue('input', 'default', 'focus_ring')}
                                    onChange={(e) => handleInputChange('input', 'default', 'focus_ring', e.target.value)}
                                    placeholder="0 0 0 3px hsl(var(--ring) / 0.2)"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Transition</Label>
                                <Input
                                    value={getRecipeValue('input', 'default', 'transition')}
                                    onChange={(e) => handleInputChange('input', 'default', 'transition', e.target.value)}
                                    placeholder="all 200ms ease"
                                    className="font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dialog" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dialog Recipe</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Border Radius</Label>
                                <Input
                                    value={getRecipeValue('dialog', 'default', 'border_radius')}
                                    onChange={(e) => handleInputChange('dialog', 'default', 'border_radius', e.target.value)}
                                    placeholder="20px"
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Backdrop Filter</Label>
                                <Input
                                    value={getRecipeValue('dialog', 'default', 'backdrop_filter')}
                                    onChange={(e) => handleInputChange('dialog', 'default', 'backdrop_filter', e.target.value)}
                                    placeholder="blur(20px)"
                                    className="font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}