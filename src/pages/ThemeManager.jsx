
import React, { useState, useEffect } from 'react';
import { Theme } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Palette,
    Plus,
    Edit,
    Trash2,
    Eye,
    Save,
    X,
    ArrowLeft,
    Crown,
    Wand2,
    Sparkles,
    ClipboardPaste,
    Flower2,
    Moon,
    Trees // Add new icon for Dark Forest
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast, Toaster } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { compileThemeTokens } from '../components/theme/TokenCompiler';
import { compileComponentRecipes } from '../components/theme/ComponentRecipeCompiler'; // Add this import
import ComponentRecipeEditor from '../components/theme/ComponentRecipeEditor'; // Add this import
import { parseThemePack } from '../components/theme/themeParser'; // Changed path

// Constants defining default token values
const defaultLightTokens = {
    brand_colors: { primary_hsl: '221 83% 53%', secondary_hsl: '210 40% 96%', accent_hsl: '142 71% 45%' },
    surface_colors: { background_hsl: '0 0% 100%', card_hsl: '0 0% 100%', muted_hsl: '210 40% 96%' },
    gradients: { hero_gradient: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)', card_gradient: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)', accent_gradient: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)' },
    glass_effects: { tint_color: 'rgba(255, 255, 255, 0.1)', blur_strength: '12px', border_opacity: '0.2' },
    shadows: { subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', luxury: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
};

const defaultDarkTokens = {
    brand_colors: { primary_hsl: '217 91% 60%', secondary_hsl: '217 33% 17%', accent_hsl: '142 71% 45%' },
    surface_colors: { background_hsl: '222 47% 11%', card_hsl: '222 47% 14%', muted_hsl: '217 33% 17%' },
    gradients: { hero_gradient: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)', card_gradient: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)', accent_gradient: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)' },
    glass_effects: { tint_color: 'rgba(12, 12, 12, 0.1)', blur_strength: '12px', border_opacity: '0.2' },
    shadows: { subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.1)', medium: '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)', large: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)', luxury: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' },
};

export default function ThemeManager() {
    const [themes, setThemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingTheme, setEditingTheme] = useState(null);
    const [previewTheme, setPreviewTheme] = useState(null);
    const [showPasteDialog, setShowPasteDialog] = useState(false);
    const [pastedThemeData, setPastedThemeData] = useState('');
    const [formData, setFormData] = useState({
        theme_name: '',
        description: '',
        preview_image_url: '',
        category: 'modern',
        is_active: true,
        light_mode_tokens: defaultLightTokens,
        dark_mode_tokens: defaultDarkTokens,
        component_recipes: {}, // Add this line
        typography: {
            font_display: '"Inter", system-ui, sans-serif',
            font_body: '"Inter", system-ui, sans-serif',
            font_mono: '"JetBrains Mono", monospace',
            scale_ratio: '1.25'
        },
        motion: {
            duration_fast: '150ms',
            duration_medium: '300ms',
            duration_slow: '500ms',
            easing_standard: 'ease-out',
            easing_emphasized: 'cubic-bezier(0.2, 0, 0, 1)'
        },
    });

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        setIsLoading(true);
        try {
            const themesData = await Theme.list('theme_name');
            setThemes(themesData);
        } catch (error) {
            console.error('Error loading themes:', error);
            toast.error('Failed to load themes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        const fieldParts = field.split('.');
        if (fieldParts.length > 1) {
            setFormData(prev => {
                const newState = { ...prev };
                let currentLevel = newState;
                for (let i = 0; i < fieldParts.length - 1; i++) {
                    // Ensure the nested object exists or create it
                    if (!currentLevel[fieldParts[i]]) {
                        currentLevel[fieldParts[i]] = {};
                    }
                    currentLevel = currentLevel[fieldParts[i]];
                }
                currentLevel[fieldParts[fieldParts.length - 1]] = value;
                return newState;
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleRecipeChange = (newRecipes) => {
        setFormData(prev => ({
            ...prev,
            component_recipes: newRecipes
        }));
    };

    const handlePasteAndFill = () => {
        if (!pastedThemeData.trim()) {
            toast.error('Paste area is empty. Please paste your theme pack.');
            return;
        }

        try {
            const parsedData = parseThemePack(pastedThemeData);

            // Deep merge to preserve any existing structure not in the paste
            setFormData(prev => ({
                ...prev,
                ...parsedData,
                typography: { ...prev.typography, ...parsedData.typography },
                motion: { ...prev.motion, ...parsedData.motion },
                component_recipes: { ...prev.component_recipes, ...(parsedData.component_recipes || {}) }, // Merge component recipes
                light_mode_tokens: {
                    ...prev.light_mode_tokens,
                    ...parsedData.light_mode_tokens,
                    brand_colors: { ...prev.light_mode_tokens.brand_colors, ...(parsedData.light_mode_tokens?.brand_colors || {}) },
                    surface_colors: { ...prev.light_mode_tokens.surface_colors, ...(parsedData.light_mode_tokens?.surface_colors || {}) },
                    gradients: { ...prev.light_mode_tokens.gradients, ...(parsedData.light_mode_tokens?.gradients || {}) },
                    glass_effects: { ...prev.light_mode_tokens.glass_effects, ...(parsedData.light_mode_tokens?.glass_effects || {}) },
                    shadows: { ...prev.light_mode_tokens.shadows, ...(parsedData.light_mode_tokens?.shadows || {}) },
                },
                // NOTE: Dark mode tokens are not yet fully supported by the simple parser
                // Therefore, we don't attempt to merge them from parsedData here to avoid overwriting defaults with empty objects.
                // We'll keep the existing dark_mode_tokens or defaults if not provided by parsing.
            }));

            toast.success('✨ Theme Pack applied! Review the fields and save.');
            setShowPasteDialog(false);
            setPastedThemeData('');

        } catch (error) {
            console.error('Theme parsing error:', error);
            toast.error('Could not parse the theme pack. Please check the format and try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.theme_name.trim()) {
            toast.error('Theme name is required');
            return;
        }

        try {
            // Compile the design tokens into CSS variables
            const css_variables = compileThemeTokens(formData);

            // Compile component recipes into CSS classes
            const component_css = compileComponentRecipes(formData.component_recipes, formData.theme_name.toLowerCase().replace(/\s+/g, '-'));

            const themePayload = {
                ...formData,
                css_variables,
                component_css
            };

            if (editingTheme) {
                await Theme.update(editingTheme.id, themePayload);
                toast.success('Theme updated successfully!');
            } else {
                await Theme.create(themePayload);
                toast.success('Theme created successfully!');
            }

            resetForm();
            setShowDialog(false);
            loadThemes();
        } catch (error) {
            console.error('Error saving theme:', error);
            toast.error(`Failed to ${editingTheme ? 'update' : 'create'} theme`);
        }
    };

    const handleEdit = (theme) => {
        setEditingTheme(theme);
        // Deep merge for light_mode_tokens and dark_mode_tokens to handle old schema and ensure defaults
        const mergedLightTokens = {
            ...defaultLightTokens,
            ...(theme.light_mode_tokens || {}),
            brand_colors: { ...defaultLightTokens.brand_colors, ...(theme.light_mode_tokens?.brand_colors || theme.brand_colors || {}) },
            surface_colors: { ...defaultLightTokens.surface_colors, ...(theme.light_mode_tokens?.surface_colors || theme.surface_colors || {}) },
            gradients: { ...defaultLightTokens.gradients, ...(theme.light_mode_tokens?.gradients || theme.gradients || {}) },
            glass_effects: { ...defaultLightTokens.glass_effects, ...(theme.light_mode_tokens?.glass_effects || theme.glass_effects || {}) },
            shadows: { ...defaultLightTokens.shadows, ...(theme.light_mode_tokens?.shadows || theme.shadows || {}) },
        };

        const mergedDarkTokens = {
            ...defaultDarkTokens,
            ...(theme.dark_mode_tokens || {}),
            brand_colors: { ...defaultDarkTokens.brand_colors, ...(theme.dark_mode_tokens?.brand_colors || {}) },
            surface_colors: { ...defaultDarkTokens.surface_colors, ...(theme.dark_mode_tokens?.surface_colors || {}) },
            gradients: { ...defaultDarkTokens.gradients, ...(theme.dark_mode_tokens?.gradients || {}) },
            glass_effects: { ...defaultDarkTokens.glass_effects, ...(theme.dark_mode_tokens?.glass_effects || {}) },
            shadows: { ...defaultDarkTokens.shadows, ...(theme.dark_mode_tokens?.shadows || {}) },
        };

        setFormData({
            theme_name: theme.theme_name || '',
            description: theme.description || '',
            preview_image_url: theme.preview_image_url || '',
            category: theme.category || 'modern',
            is_active: theme.is_active !== false,
            light_mode_tokens: mergedLightTokens,
            dark_mode_tokens: mergedDarkTokens,
            component_recipes: theme.component_recipes || {}, // Add this line
            typography: theme.typography || {
                font_display: '"Inter", system-ui, sans-serif',
                font_body: '"Inter", system-ui, sans-serif',
                font_mono: '"JetBrains Mono", monospace',
                scale_ratio: '1.25'
            },
            motion: theme.motion || {
                duration_fast: '150ms',
                duration_medium: '300ms',
                duration_slow: '500ms',
                easing_standard: 'ease-out',
                easing_emphasized: 'cubic-bezier(0.2, 0, 0, 1)'
            },
        });
        setShowDialog(true);
    };

    const handleDelete = async (theme) => {
        if (!confirm(`Are you sure you want to delete "${theme.theme_name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await Theme.delete(theme.id);
            toast.success('Theme deleted successfully');
            loadThemes();
        } catch (error) {
            console.error('Error deleting theme:', error);
            toast.error('Failed to delete theme');
        }
    };

    const handlePreview = (theme) => {
        setPreviewTheme(theme);
    };

    const resetForm = () => {
        setEditingTheme(null);
        setFormData({
            theme_name: '',
            description: '',
            preview_image_url: '',
            category: 'modern',
            is_active: true,
            light_mode_tokens: defaultLightTokens,
            dark_mode_tokens: defaultDarkTokens,
            component_recipes: {}, // Add this line
            typography: {
                font_display: '"Inter", system-ui, sans-serif',
                font_body: '"Inter", system-ui, sans-serif',
                font_mono: '"JetBrains Mono", monospace',
                scale_ratio: '1.25'
            },
            motion: {
                duration_fast: '150ms',
                duration_medium: '300ms',
                duration_slow: '500ms',
                easing_standard: 'ease-out',
                easing_emphasized: 'cubic-bezier(0.2, 0, 0, 1)'
            },
        });
    };

    const handleNewTheme = () => {
        resetForm();
        setShowDialog(true);
    };

    const createGoldenEleganceTheme = async () => {
        try {
            const goldenEleganceData = {
                theme_name: 'Golden Elegance v2',
                description: 'A luxurious theme combining warm golds with elegant champagne tones and sophisticated gradients',
                preview_image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
                category: 'luxury',
                is_active: true,
                typography: {
                    font_display: '"Playfair Display", serif',
                    font_body: '"Inter", system-ui, sans-serif',
                    font_mono: '"JetBrains Mono", monospace',
                    scale_ratio: '1.3'
                },
                motion: {
                    duration_fast: '200ms',
                    duration_medium: '400ms',
                    duration_slow: '600ms',
                    easing_standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    easing_emphasized: 'cubic-bezier(0.2, 0, 0, 1)'
                },
                light_mode_tokens: {
                    brand_colors: { primary_hsl: '45 85% 58%', secondary_hsl: '48 32% 85%', accent_hsl: '30 48% 25%' },
                    surface_colors: { background_hsl: '48 20% 97%', card_hsl: '50 25% 95%', muted_hsl: '48 15% 92%' },
                    gradients: { hero_gradient: 'radial-gradient(ellipse at top, hsl(45 85% 85%) 0%, hsl(48 32% 85%) 25%, hsl(45 85% 58%) 75%, hsl(30 48% 35%) 100%)', card_gradient: 'linear-gradient(145deg, hsl(50 25% 98%) 0%, hsl(48 15% 95%) 100%)', accent_gradient: 'linear-gradient(135deg, hsl(45 85% 75%) 0%, hsl(45 85% 58%) 50%, hsl(30 48% 45%) 100%)' },
                    glass_effects: { tint_color: 'rgba(255, 248, 220, 0.15)', blur_strength: '16px', border_opacity: '0.3' },
                    shadows: { subtle: '0 2px 4px 0 rgba(181, 152, 90, 0.08)', medium: '0 8px 16px -4px rgba(181, 152, 90, 0.12), 0 4px 8px -2px rgba(181, 152, 90, 0.08)', large: '0 16px 32px -8px rgba(181, 152, 90, 0.16), 0 8px 16px -4px rgba(181, 152, 90, 0.12)', luxury: '0 32px 64px -16px rgba(181, 152, 90, 0.25), inset 0 1px 0 0 rgba(255, 248, 220, 0.6)' }
                },
                dark_mode_tokens: {
                    brand_colors: { primary_hsl: '45 75% 65%', secondary_hsl: '48 15% 15%', accent_hsl: '35 40% 80%' },
                    surface_colors: { background_hsl: '48 10% 8%', card_hsl: '48 10% 12%', muted_hsl: '48 15% 15%' },
                    gradients: { hero_gradient: 'radial-gradient(ellipse at top, hsl(45 75% 35%) 0%, hsl(48 15% 10%) 25%, hsl(45 75% 65%) 75%, hsl(35 40% 80%) 100%)', card_gradient: 'linear-gradient(145deg, hsl(48 10% 14%) 0%, hsl(48 15% 10%) 100%)', accent_gradient: 'linear-gradient(135deg, hsl(45 75% 55%) 0%, hsl(45 75% 65%) 50%, hsl(35 40% 80%) 100%)' },
                    glass_effects: { tint_color: 'rgba(40, 35, 25, 0.15)', blur_strength: '16px', border_opacity: '0.3' },
                    shadows: { subtle: '0 2px 4px 0 rgba(0, 0, 0, 0.15)', medium: '0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 4px 8px -2px rgba(0, 0, 0, 0.15)', large: '0 16px 32px -8px rgba(0, 0, 0, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.2)', luxury: '0 32px 64px -16px rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 220, 150, 0.1)' }
                },
                component_recipes: {} // default to empty
            };

            const css_variables = compileThemeTokens(goldenEleganceData);
            const component_css = compileComponentRecipes(goldenEleganceData.component_recipes, goldenEleganceData.theme_name.toLowerCase().replace(/\s+/g, '-'));
            const themePayload = { ...goldenEleganceData, css_variables, component_css };

            await Theme.create(themePayload);
            toast.success('🌟 Golden Elegance v2 theme created!');
            loadThemes();

        } catch (error) {
            console.error('Error creating Golden Elegance theme:', error);
            toast.error('Failed to create Golden Elegance theme');
        }
    };

    const createSakuraDreamTheme = async () => {
        try {
            const sakuraDreamData = {
                theme_name: 'Sakura Dream',
                description: 'An elegant and serene theme inspired by cherry blossoms, with soft pinks, muted plums, and deep charcoal tones.',
                preview_image_url: 'https://images.unsplash.com/photo-1559267143-5d5904731353?w=800&h=600&fit=crop',
                category: 'artistic',
                is_active: true,
                typography: {
                    font_display: '"Lora", serif',
                    font_body: '"Sora", sans-serif',
                    font_mono: '"Fira Code", monospace',
                    scale_ratio: '1.2'
                },
                motion: {
                    duration_fast: '200ms',
                    duration_medium: '350ms',
                    duration_slow: '550ms',
                    easing_standard: 'cubic-bezier(0.45, 0, 0.55, 1)',
                    easing_emphasized: 'cubic-bezier(0.65, 0, 0.35, 1)'
                },
                light_mode_tokens: {
                    brand_colors: { primary_hsl: '345 80% 65%', secondary_hsl: '345 30% 96%', accent_hsl: '280 40% 50%' },
                    surface_colors: { background_hsl: '345 10% 99%', card_hsl: '0 0% 100%', muted_hsl: '345 20% 94%' },
                    gradients: { hero_gradient: 'linear-gradient(145deg, hsl(345 80% 75%) 0%, hsl(280 40% 60%) 100%)', card_gradient: 'linear-gradient(145deg, hsl(0 0% 100%) 0%, hsl(345 20% 97%) 100%)', accent_gradient: 'linear-gradient(90deg, hsl(345 80% 65%) 0%, hsl(280 40% 50%) 100%)' },
                    glass_effects: { tint_color: 'rgba(255, 245, 248, 0.5)', blur_strength: '10px', border_opacity: '0.15' },
                    shadows: { subtle: '0 1px 2px 0 rgba(213, 159, 179, 0.08)', medium: '0 4px 8px -2px rgba(213, 159, 179, 0.12), 0 2px 4px -1px rgba(213, 159, 179, 0.07)', large: '0 10px 20px -5px rgba(213, 159, 179, 0.15), 0 4px 6px -2px rgba(213, 159, 179, 0.1)', luxury: '0 25px 50px -12px rgba(213, 159, 179, 0.25)' }
                },
                dark_mode_tokens: {
                    brand_colors: { primary_hsl: '345 85% 70%', secondary_hsl: '345 10% 18%', accent_hsl: '280 50% 75%' },
                    surface_colors: { background_hsl: '280 10% 11%', card_hsl: '280 10% 14%', muted_hsl: '345 10% 18%' },
                    gradients: { hero_gradient: 'linear-gradient(145deg, hsl(345 85% 70% / 0.8) 0%, hsl(280 50% 75% / 0.8) 100%)', card_gradient: 'linear-gradient(145deg, hsl(280 10% 16%) 0%, hsl(280 10% 12%) 100%)', accent_gradient: 'linear-gradient(90deg, hsl(345 85% 70%) 0%, hsl(280 50% 75%) 100%)' },
                    glass_effects: { tint_color: 'rgba(25, 20, 30, 0.5)', blur_strength: '12px', border_opacity: '0.2' },
                    shadows: { subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.2)', medium: '0 4px 8px -2px rgba(0, 0, 0, 0.3), 0 0 0 1px hsl(345 10% 22%)', large: '0 10px 20px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px hsl(345 10% 22%)', luxury: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px hsl(345 10% 22%)' }
                },
                component_recipes: {} // default to empty
            };

            const css_variables = compileThemeTokens(sakuraDreamData);
            const component_css = compileComponentRecipes(sakuraDreamData.component_recipes, sakuraDreamData.theme_name.toLowerCase().replace(/\s+/g, '-'));
            const themePayload = { ...sakuraDreamData, css_variables, component_css };

            await Theme.create(themePayload);
            toast.success('🌸 Sakura Dream theme has blossomed!');
            loadThemes();

        } catch (error) {
            console.error('Error creating Sakura Dream theme:', error);
            toast.error('Failed to create Sakura Dream theme');
        }
    };

    const createMidnightRoseTheme = async () => {
        try {
            const midnightRoseData = {
                theme_name: 'Midnight Rose',
                description: 'A dramatic and elegant dark theme with a deep charcoal base and vibrant, jewel-toned ruby accents.',
                preview_image_url: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=800&h=600&fit=crop',
                category: 'luxury',
                is_active: true,
                typography: {
                    font_display: '"Playfair Display", serif',
                    font_body: '"Inter", sans-serif',
                    font_mono: '"JetBrains Mono", monospace',
                    scale_ratio: '1.333'
                },
                motion: {
                    duration_fast: '180ms',
                    duration_medium: '350ms',
                    duration_slow: '500ms',
                    easing_standard: 'cubic-bezier(0.6, 0.05, 0.4, 0.95)',
                    easing_emphasized: 'cubic-bezier(0.7, 0, 0.2, 1)'
                },
                light_mode_tokens: {
                    brand_colors: { primary_hsl: '350 75% 55%', secondary_hsl: '220 20% 96%', accent_hsl: '350 85% 65%' },
                    surface_colors: { background_hsl: '220 10% 99%', card_hsl: '0 0% 100%', muted_hsl: '220 15% 94%' },
                    gradients: { hero_gradient: 'linear-gradient(145deg, hsl(350 80% 95%) 0%, hsl(0 0% 100%) 50%)', card_gradient: 'linear-gradient(145deg, hsl(0 0% 100%) 0%, hsl(220 15% 97%) 100%)', accent_gradient: 'linear-gradient(90deg, hsl(350 75% 55%) 0%, hsl(350 85% 65%) 100%)' },
                    glass_effects: { tint_color: 'rgba(255, 245, 248, 0.5)', blur_strength: '10px', border_opacity: '0.1' },
                    shadows: { subtle: '0 1px 2px 0 rgba(120, 0, 30, 0.05)', medium: '0 4px 8px -2px rgba(120, 0, 30, 0.08), 0 2px 4px -1px rgba(120, 0, 30, 0.04)', large: '0 10px 20px -5px rgba(120, 0, 30, 0.1), 0 4px 6px -2px rgba(120, 0, 30, 0.06)', luxury: '0 25px 50px -12px rgba(120, 0, 30, 0.2)' }
                },
                dark_mode_tokens: {
                    brand_colors: { primary_hsl: '350 85% 68%', secondary_hsl: '220 15% 25%', accent_hsl: '350 95% 75%' },
                    surface_colors: { background_hsl: '220 15% 10%', card_hsl: '220 15% 13%', muted_hsl: '220 12% 20%' },
                    gradients: { hero_gradient: 'radial-gradient(ellipse at bottom, hsl(var(--primary)) 0%, transparent 70%)', card_gradient: 'linear-gradient(145deg, hsl(220 15% 15%) 0%, hsl(220 15% 11%) 100%)', accent_gradient: 'linear-gradient(90deg, hsl(350 85% 68%) 0%, hsl(350 95% 75%) 100%)' },
                    glass_effects: { tint_color: 'rgba(18, 18, 24, 0.5)', blur_strength: '12px', border_opacity: '0.15' },
                    shadows: { subtle: '0 1px 0 0 hsl(0 0% 100% / 0.05)', medium: '0 0 15px -5px hsl(var(--primary) / 0.2), 0 1px 0 0 hsl(0 0% 100% / 0.05)', large: '0 0 30px -10px hsl(var(--primary) / 0.3), 0 1px 0 0 hsl(0 0% 100% / 0.07)', luxury: '0 0 50px -15px hsl(var(--primary) / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.1)' }
                },
                component_recipes: {} // default to empty
            };

            const css_variables = compileThemeTokens(midnightRoseData);
            const component_css = compileComponentRecipes(midnightRoseData.component_recipes, midnightRoseData.theme_name.toLowerCase().replace(/\s+/g, '-'));
            const themePayload = { ...midnightRoseData, css_variables, component_css };

            await Theme.create(themePayload);
            toast.success('🌹 Midnight Rose theme has bloomed!');
            loadThemes();

        } catch (error) {
            console.error('Error creating Midnight Rose theme:', error);
            toast.error('Failed to create Midnight Rose theme');
        }
    };

    const createDarkForestTheme = async () => {
        try {
            const darkForestData = {
                theme_name: 'Dark Forest',
                description: 'A mysterious and natural theme inspired by ancient woodlands, with deep emerald greens, earthy tones, and golden sunlight accents.',
                preview_image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
                category: 'artistic',
                is_active: true,
                typography: {
                    font_display: '"Merriweather", serif',
                    font_body: '"Source Sans Pro", sans-serif',
                    font_mono: '"Fira Code", monospace',
                    scale_ratio: '1.2'
                },
                motion: {
                    duration_fast: '200ms',
                    duration_medium: '400ms',
                    duration_slow: '600ms',
                    easing_standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    easing_emphasized: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                },
                light_mode_tokens: {
                    brand_colors: { primary_hsl: '140 60% 35%', secondary_hsl: '120 25% 88%', accent_hsl: '45 85% 55%' },
                    surface_colors: { background_hsl: '120 15% 97%', card_hsl: '120 20% 99%', muted_hsl: '120 20% 92%' },
                    gradients: { hero_gradient: 'linear-gradient(135deg, hsl(140 60% 25%) 0%, hsl(120 40% 30%) 35%, hsl(45 85% 55%) 70%, hsl(140 60% 35%) 100%)', card_gradient: 'linear-gradient(145deg, hsl(120 20% 99%) 0%, hsl(120 15% 94%) 100%)', accent_gradient: 'linear-gradient(90deg, hsl(140 60% 35%) 0%, hsl(45 85% 55%) 100%)' },
                    glass_effects: { tint_color: 'rgba(240, 248, 240, 0.6)', blur_strength: '12px', border_opacity: '0.2' },
                    shadows: { subtle: '0 1px 2px 0 rgba(34, 60, 34, 0.1)', medium: '0 4px 8px -2px rgba(34, 60, 34, 0.15), 0 2px 4px -1px rgba(34, 60, 34, 0.08)', large: '0 10px 20px -5px rgba(34, 60, 34, 0.2), 0 4px 6px -2px rgba(34, 60, 34, 0.12)', luxury: '0 25px 50px -12px rgba(34, 60, 34, 0.3)' }
                },
                dark_mode_tokens: {
                    brand_colors: { primary_hsl: '140 70% 45%', secondary_hsl: '140 15% 22%', accent_hsl: '45 95% 65%' },
                    surface_colors: { background_hsl: '140 20% 8%', card_hsl: '140 18% 12%', muted_hsl: '140 15% 18%' },
                    gradients: { hero_gradient: 'radial-gradient(ellipse at center, hsl(140 70% 15%) 0%, hsl(140 20% 8%) 50%, hsl(45 95% 15%) 100%)', card_gradient: 'linear-gradient(145deg, hsl(140 18% 14%) 0%, hsl(140 20% 10%) 100%)', accent_gradient: 'linear-gradient(90deg, hsl(140 70% 45%) 0%, hsl(45 95% 65%) 100%)' },
                    glass_effects: { tint_color: 'rgba(15, 25, 15, 0.7)', blur_strength: '14px', border_opacity: '0.25' },
                    shadows: { subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.3)', medium: '0 4px 8px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px hsl(140 15% 20%)', large: '0 10px 20px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px hsl(140 15% 20%)', luxury: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 hsl(140 70% 45% / 0.1)' }
                },
                component_recipes: {} // default to empty
            };

            const css_variables = compileThemeTokens(darkForestData);
            const component_css = compileComponentRecipes(darkForestData.component_recipes, darkForestData.theme_name.toLowerCase().replace(/\s+/g, '-'));
            const themePayload = { ...darkForestData, css_variables, component_css };

            await Theme.create(themePayload);
            toast.success('🌲 Dark Forest theme has grown!');
            loadThemes();

        } catch (error) {
            console.error('Error creating Dark Forest theme:', error);
            toast.error('Failed to create Dark Forest theme');
        }
    };

    // Create Aurora Luxe Theme - A one-of-a-kind premium theme
    const createAuroraLuxeTheme = async () => {
        try {
            // 1. Check if Aurora Luxe already exists
            const existingTheme = themes.find(t => t.theme_name === 'Aurora Luxe');
            if (existingTheme) {
                toast.info('Aurora Luxe theme already exists!');
                setPreviewTheme(existingTheme);
                return;
            }

            // 2. Create Aurora Luxe theme data
            const auroraLuxeData = {
                theme_name: 'Aurora Luxe',
                description: 'An ethereal masterpiece inspired by the Northern Lights. This premium theme combines cosmic gradients with luxurious gold accents, creating an otherworldly elegance that captivates and mesmerizes.',
                category: 'luxury',
                is_active: true,
                background_texture_url: null,
                // Sophisticated color palette with aurora-inspired hues
                primary_hue: 280,           // Deep purple aurora
                primary_saturation: 85,     
                primary_lightness: 65,
                
                secondary_hue: 190,         // Cyan aurora glow
                secondary_saturation: 90,
                secondary_lightness: 92,
                
                accent_hue: 45,             // Luxurious gold accent
                accent_saturation: 95,
                accent_lightness: 60,
                
                background_hue: 230,        // Deep space blue
                background_saturation: 25,
                background_lightness: 7,    // Near black with blue tint
                
                foreground_hue: 0,          
                foreground_saturation: 0,
                foreground_lightness: 95,   // Almost white
                
                card_hue: 240,              // Deep purple-blue card
                card_saturation: 20,
                card_lightness: 12,
                
                muted_hue: 250,
                muted_saturation: 15,
                muted_lightness: 20,
                
                border_opacity: 15,
                input_opacity: 8,
                ring_opacity: 80,
                
                // Premium visual effects
                radius: 1.2,                // Slightly rounded for elegance
                shadow_strength: 'strong',
                transition_speed: 350,      // Smooth, luxurious transitions
                btn_hover_scale: 1.03,
                
                // Aurora-inspired gradients
                bg_gradient_hero: `
                    linear-gradient(135deg, 
                        rgba(139, 92, 246, 0.3) 0%, 
                        rgba(59, 130, 246, 0.2) 25%, 
                        rgba(16, 185, 129, 0.2) 50%, 
                        rgba(251, 191, 36, 0.1) 75%,
                        rgba(139, 92, 246, 0.3) 100%
                    ),
                    radial-gradient(ellipse at top left, 
                        rgba(59, 130, 246, 0.4) 0%, 
                        transparent 50%
                    ),
                    radial-gradient(ellipse at bottom right, 
                        rgba(16, 185, 129, 0.3) 0%, 
                        transparent 50%
                    ),
                    linear-gradient(0deg,
                        hsl(230, 25%, 7%) 0%,
                        hsl(240, 30%, 10%) 100%
                    )
                `,
                
                // Premium shadows and effects
                shadow_luxury: '0 20px 40px -10px rgba(139, 92, 246, 0.3), 0 10px 25px -5px rgba(59, 130, 246, 0.2)',
                shadow_hero_text: '0 0 40px rgba(139, 92, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.8)',
                
                // Theme overrides for unique aurora effect
                theme_overrides: `
                    /* Aurora glow animations */
                    @keyframes aurora-glow {
                        0%, 100% { 
                            filter: hue-rotate(0deg) brightness(1); 
                            transform: translateY(0);
                        }
                        25% { 
                            filter: hue-rotate(30deg) brightness(1.1); 
                            transform: translateY(-2px);
                        }
                        50% { 
                            filter: hue-rotate(-30deg) brightness(1.2); 
                            transform: translateY(-4px);
                        }
                        75% { 
                            filter: hue-rotate(15deg) brightness(1.1); 
                            transform: translateY(-2px);
                        }
                    }
                    
                    /* Premium metallic text effect */
                    @keyframes metallic-shine {
                        0% { background-position: -200% center; }
                        100% { background-position: 200% center; }
                    }
                    
                    /* Apply aurora glow to primary buttons */
                    .bg-primary {
                        position: relative;
                        overflow: hidden;
                        background: linear-gradient(135deg, 
                            hsl(var(--primary)) 0%, 
                            hsl(var(--accent)) 50%, 
                            hsl(var(--primary)) 100%
                        );
                        background-size: 200% 200%;
                        animation: aurora-glow 8s ease-in-out infinite;
                    }
                    
                    .bg-primary::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(
                            circle,
                            rgba(255, 255, 255, 0.3) 0%,
                            transparent 70%
                        );
                        animation: aurora-glow 4s ease-in-out infinite reverse;
                    }
                    
                    /* Luxury heading styles */
                    h1, h2, h3 {
                        background: linear-gradient(
                            90deg,
                            hsl(var(--primary)) 0%,
                            hsl(var(--accent)) 35%,
                            hsl(var(--chart-2)) 70%,
                            hsl(var(--primary)) 100%
                        );
                        background-size: 200% auto;
                        background-clip: text;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: metallic-shine 3s linear infinite;
                    }
                    
                    /* Premium card hover effects */
                    .group:hover {
                        box-shadow: 
                            0 0 30px rgba(139, 92, 246, 0.4),
                            0 0 60px rgba(59, 130, 246, 0.2),
                            var(--shadow-luxury);
                    }
                    
                    /* Aurora border effect */
                    .border {
                        position: relative;
                    }
                    
                    .border::after {
                        content: '';
                        position: absolute;
                        inset: -1px;
                        border-radius: inherit;
                        padding: 1px;
                        background: linear-gradient(
                            45deg,
                            hsl(var(--primary)),
                            hsl(var(--chart-2)),
                            hsl(var(--accent)),
                            hsl(var(--primary))
                        );
                        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                        mask-composite: exclude;
                        opacity: 0;
                        transition: opacity 0.3s;
                    }
                    
                    .border:hover::after {
                        opacity: 0.5;
                    }
                    
                    /* Cosmic background particles */
                    body::before {
                        content: '';
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: 
                            radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 40% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
                        pointer-events: none;
                        z-index: 1;
                    }
                    
                    #root {
                        position: relative;
                        z-index: 2;
                    }
                `
            };

            // 3. Compile theme tokens
            const css_variables = compileThemeTokens(auroraLuxeData);
            
            const themePayload = { ...auroraLuxeData, css_variables };
            
            // 4. Create the theme
            await Theme.create(themePayload);
            
            toast.success('✨ Aurora Luxe theme has illuminated your world!');
            loadThemes();

        } catch (error) {
            console.error('Error creating Aurora Luxe theme:', error);
            toast.error('Failed to create Aurora Luxe theme');
        }
    };


    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-64 border border-amber-200"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster richColors position="top-center" />
            <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-orange-50 to-amber-50 min-h-screen">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link to={createPageUrl('Settings')}>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <Palette className="w-8 h-8 text-amber-800" />
                            <div>
                                <h1 className="text-3xl font-bold text-amber-900">Design System Manager</h1>
                                <p className="text-amber-700 mt-1">Create advanced themes with semantic tokens, gradients, and visual effects</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link to={createPageUrl('ThemeManagerV2')} className="w-full sm:w-auto">
                            <Button
                                variant="default"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-xl w-full animate-pulse"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Try New Streamlined Manager →
                            </Button>
                        </Link>
                        <Button
                            onClick={createDarkForestTheme}
                            variant="outline"
                            className="bg-gradient-to-r from-emerald-900 to-green-800 border-green-700 text-green-50 hover:from-emerald-800 hover:to-green-700 w-full sm:w-auto"
                        >
                            <Trees className="w-4 h-4 mr-2" />
                            Create Dark Forest
                        </Button>
                        <Button
                            onClick={createMidnightRoseTheme}
                            variant="outline"
                            className="bg-gradient-to-r from-gray-800 to-rose-950 border-rose-800 text-white hover:from-gray-700 hover:to-rose-900 w-full sm:w-auto"
                        >
                            <Moon className="w-4 h-4 mr-2" />
                            Create Midnight Rose
                        </Button>
                        <Button
                            onClick={createSakuraDreamTheme}
                            variant="outline"
                            className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300 text-purple-800 hover:from-pink-200 hover:to-purple-200 w-full sm:w-auto"
                        >
                            <Flower2 className="w-4 h-4 mr-2" />
                            Create Sakura Dream
                        </Button>
                        <Button
                            onClick={createGoldenEleganceTheme}
                            variant="outline"
                            className="bg-gradient-to-r from-yellow-100 to-amber-100 border-amber-300 text-amber-800 hover:from-yellow-200 hover:to-amber-200 w-full sm:w-auto"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Create Golden Elegance v2
                        </Button>
                        <Button
                            onClick={createAuroraLuxeTheme}
                            variant="outline"
                            className="bg-gradient-to-r from-purple-900 via-blue-800 to-emerald-800 border-purple-700 text-white hover:from-purple-800 hover:via-blue-700 hover:to-emerald-700 w-full sm:w-auto shadow-lg hover:shadow-purple-500/50"
                        >
                            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                            Create Aurora Luxe ✨
                        </Button>
                        <Button
                            onClick={handleNewTheme}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Theme
                        </Button>
                    </div>
                </div>

                {/* Themes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map((theme) => (
                        <Card key={theme.id} className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="p-0">
                                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                                    {theme.preview_image_url ? (
                                        <img
                                            src={theme.preview_image_url}
                                            alt={`${theme.theme_name} preview`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                            <Palette className="w-12 h-12 text-white/80" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                        <Badge
                                            variant={theme.is_active ? "default" : "secondary"}
                                            className="capitalize"
                                        >
                                            {theme.category}
                                        </Badge>
                                        {!theme.is_active && (
                                            <Badge variant="outline" className="bg-white/90 text-gray-600">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <CardTitle className="flex items-center gap-2 mb-2 text-amber-900">
                                    {theme.theme_name}
                                    {theme.category === 'luxury' && <Crown className="w-4 h-4 text-amber-600" />}
                                    {theme.category === 'artistic' && <Flower2 className="w-4 h-4 text-pink-500" />}
                                </CardTitle>
                                <p className="text-sm text-amber-600 mb-4 line-clamp-2">
                                    {theme.description || 'No description provided'}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handlePreview(theme)}
                                        className="flex-1 border-amber-300 hover:bg-amber-50"
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        Preview
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(theme)}
                                        className="flex-1 border-amber-300 hover:bg-amber-50"
                                    >
                                        <Edit className="w-3 h-3 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(theme)}
                                        className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {themes.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Wand2 className="w-24 h-24 mx-auto mb-4 text-amber-400 opacity-50" />
                        <h3 className="text-xl font-semibold text-amber-800 mb-2">No design systems yet</h3>
                        <p className="text-amber-600 mb-6">Create your first advanced theme with semantic tokens and visual effects</p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={createDarkForestTheme}
                                variant="outline"
                                className="bg-gradient-to-r from-emerald-900 to-green-800 border-green-700 text-green-50 hover:from-emerald-800 hover:to-green-700"
                            >
                                <Trees className="w-4 h-4 mr-2" />
                                Try Dark Forest
                            </Button>
                             <Button
                                onClick={createMidnightRoseTheme}
                                variant="outline"
                                className="bg-gradient-to-r from-gray-800 to-rose-950 border-rose-800 text-white hover:from-gray-700 hover:to-rose-900"
                            >
                                <Moon className="w-4 h-4 mr-2" />
                                Try Midnight Rose
                            </Button>
                            <Button
                                onClick={createSakuraDreamTheme}
                                variant="outline"
                                className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300 text-purple-800 hover:from-pink-200 hover:to-purple-200"
                            >
                                <Flower2 className="w-4 h-4 mr-2" />
                                Try Sakura Dream
                            </Button>
                            <Button
                                onClick={createGoldenEleganceTheme}
                                variant="outline"
                                className="bg-gradient-to-r from-yellow-100 to-amber-100 border-amber-300 text-amber-800 hover:from-yellow-200 hover:to-amber-200"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Try Golden Elegance v2
                            </Button>
                            <Button
                                onClick={handleNewTheme}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Custom Theme
                            </Button>
                        </div>
                    </div>
                )}

                {/* Enhanced Theme Creation/Edit Dialog */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent className="max-w-7xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-lg">
                        <DialogHeader>
                            <div className="flex justify-between items-center">
                                <DialogTitle className="flex items-center gap-2">
                                    <Wand2 className="w-5 h-5" />
                                    {editingTheme ? 'Edit Design System' : 'Create New Design System'}
                                </DialogTitle>
                                <div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowPasteDialog(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <ClipboardPaste className="w-4 h-4" />
                                        Paste Theme Pack
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 p-1 md:p-6">

                            <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                    <TabsTrigger value="light">Light Mode</TabsTrigger>
                                    <TabsTrigger value="dark">Dark Mode</TabsTrigger>
                                    <TabsTrigger value="global">Global Tokens</TabsTrigger>
                                    <TabsTrigger value="components">Component Recipes</TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-4 pt-4">
                                    {/* --- BASIC INFO --- */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="theme_name">Theme Name *</Label>
                                            <Input
                                                id="theme_name"
                                                value={formData.theme_name}
                                                onChange={(e) => handleInputChange('theme_name', e.target.value)}
                                                placeholder="e.g., Golden Elegance v2"
                                                required
                                                className="border-amber-300 focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="category">Category</Label>
                                            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                                <SelectTrigger className="border-amber-300">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="luxury">Luxury</SelectItem>
                                                    <SelectItem value="modern">Modern</SelectItem>
                                                    <SelectItem value="classic">Classic</SelectItem>
                                                    <SelectItem value="minimal">Minimal</SelectItem>
                                                    <SelectItem value="artistic">Artistic</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Describe the mood, style and visual characteristics of this theme..."
                                            rows={3}
                                            className="border-amber-300 focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="preview_image_url">Preview Image URL</Label>
                                        <Input
                                            id="preview_image_url"
                                            value={formData.preview_image_url}
                                            onChange={(e) => handleInputChange('preview_image_url', e.target.value)}
                                            placeholder="https://images.unsplash.com/..."
                                            className="border-amber-300 focus:border-amber-500"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(checked) => handleInputChange('is_active', !!checked)} />
                                        <Label htmlFor="is_active">Active theme (available for selection)</Label>
                                    </div>
                                </TabsContent>

                                <TabsContent value="light" className="pt-4">
                                    <TokenEditor mode="light" formData={formData.light_mode_tokens} handleInputChange={handleInputChange} />
                                </TabsContent>

                                <TabsContent value="dark" className="pt-4">
                                    <TokenEditor mode="dark" formData={formData.dark_mode_tokens} handleInputChange={handleInputChange} />
                                </TabsContent>

                                <TabsContent value="global" className="space-y-4 pt-4">
                                    {/* --- TYPOGRAPHY & MOTION --- */}
                                    <h3 className="text-xl font-semibold mb-4 text-amber-900">Global Tokens</h3>
                                    <p className="text-sm text-amber-700 -mt-3 mb-6">These tokens for typography and motion are shared across both Light and Dark modes.</p>
                                    <Tabs defaultValue="typography" className="w-full">
                                        <TabsList>
                                            <TabsTrigger value="typography">Typography</TabsTrigger>
                                            <TabsTrigger value="motion">Motion</TabsTrigger>
                                            <TabsTrigger value="preview">CSS Preview</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="typography" className="space-y-4 pt-4">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor="font_display">Display Font (Headers)</Label>
                                                    <Input
                                                        id="font_display"
                                                        value={formData.typography.font_display}
                                                        onChange={(e) => handleInputChange('typography.font_display', e.target.value)}
                                                        placeholder='"Playfair Display", serif'
                                                        className="border-amber-300 focus:border-amber-500 font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="font_body">Body Font</Label>
                                                    <Input
                                                        id="font_body"
                                                        value={formData.typography.font_body}
                                                        onChange={(e) => handleInputChange('typography.font_body', e.target.value)}
                                                        placeholder='"Inter", system-ui, sans-serif'
                                                        className="border-amber-300 focus:border-amber-500 font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="font_mono">Monospace Font</Label>
                                                    <Input
                                                        id="font_mono"
                                                        value={formData.typography.font_mono}
                                                        onChange={(e) => handleInputChange('typography.font_mono', e.target.value)}
                                                        placeholder='"JetBrains Mono", monospace'
                                                        className="border-amber-300 focus:border-amber-500 font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="scale_ratio">Type Scale Ratio</Label>
                                                    <Input
                                                        id="scale_ratio"
                                                        value={formData.typography.scale_ratio}
                                                        onChange={(e) => handleInputChange('typography.scale_ratio', e.target.value)}
                                                        placeholder="1.25"
                                                        className="border-amber-300 focus:border-amber-500 font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="motion" className="space-y-4 pt-4">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-medium mb-3 text-amber-800">Duration Tokens</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <Label htmlFor="duration_fast">Fast Duration</Label>
                                                            <Input
                                                                id="duration_fast"
                                                                value={formData.motion.duration_fast}
                                                                onChange={(e) => handleInputChange('motion.duration_fast', e.target.value)}
                                                                placeholder="150ms"
                                                                className="border-amber-300 focus:border-amber-500 font-mono"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="duration_medium">Medium Duration</Label>
                                                            <Input
                                                                id="duration_medium"
                                                                value={formData.motion.duration_medium}
                                                                onChange={(e) => handleInputChange('motion.duration_medium', e.target.value)}
                                                                placeholder="300ms"
                                                                className="border-amber-300 focus:border-amber-500 font-mono"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="duration_slow">Slow Duration</Label>
                                                            <Input
                                                                id="duration_slow"
                                                                value={formData.motion.duration_slow}
                                                                onChange={(e) => handleInputChange('motion.duration_slow', e.target.value)}
                                                                placeholder="500ms"
                                                                className="border-amber-300 focus:border-amber-500 font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-3 text-amber-800">Easing Functions</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <Label htmlFor="easing_standard">Standard Easing</Label>
                                                            <Input
                                                                id="easing_standard"
                                                                value={formData.motion.easing_standard}
                                                                onChange={(e) => handleInputChange('motion.easing_standard', e.target.value)}
                                                                placeholder="ease-out"
                                                                className="border-amber-300 focus:border-amber-500 font-mono"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="easing_emphasized">Emphasized Easing</Label>
                                                            <Input
                                                                id="easing_emphasized"
                                                                value={formData.motion.easing_emphasized}
                                                                onChange={(e) => handleInputChange('motion.easing_emphasized', e.target.value)}
                                                                placeholder="cubic-bezier(0.2, 0, 0, 1)"
                                                                className="border-amber-300 focus:border-amber-500 font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="preview" className="space-y-4 pt-4">
                                            <div>
                                                <Label className="text-amber-800 font-medium mb-3 block">Generated CSS Variables Preview</Label>
                                                <div className="bg-gray-100 rounded-lg p-4 border border-amber-200 max-h-80 overflow-y-auto">
                                                    <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                                                        {compileThemeTokens(formData) || '/* CSS variables will be generated here */'}
                                                    </pre>
                                                </div>
                                                <p className="text-xs text-amber-600 mt-2">
                                                    This preview shows the CSS variables that will be generated from your design tokens for both light and dark modes.
                                                </p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </TabsContent>

                                <TabsContent value="components" className="space-y-4 pt-4">
                                    <ComponentRecipeEditor 
                                        recipes={formData.component_recipes} 
                                        onRecipeChange={handleRecipeChange}
                                    />
                                </TabsContent>
                            </Tabs>

                            <div className="flex justify-end gap-3 pt-6 border-t border-amber-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDialog(false)}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingTheme ? 'Update Theme' : 'Create Theme'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Paste Theme Pack Dialog */}
                <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Paste Theme Pack</DialogTitle>
                            <p className="text-sm text-muted-foreground pt-2">
                                Paste a complete theme pack (YAML, JSON, or raw CSS variables) to auto-fill the form.
                            </p>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                value={pastedThemeData}
                                onChange={(e) => setPastedThemeData(e.target.value)}
                                placeholder="---
meta:
  name: My Awesome Theme
tokens:
  light:
    brand_colors:
      primary_hsl: '100 50% 50%'
  dark:
    brand_colors:
      primary_hsl: '200 50% 50%'
..."
                                className="h-64 font-mono text-xs"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowPasteDialog(false)}>Cancel</Button>
                            <Button onClick={handlePasteAndFill} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Auto-Fill & Preview
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Enhanced Theme Preview Dialog with Live Preview */}
                <Dialog open={!!previewTheme} onOpenChange={(open) => !open && setPreviewTheme(null)}>
                    <DialogContent className="max-w-6xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>Preview: {previewTheme?.theme_name}</span>
                                <Button
                                    onClick={() => {
                                        const showcaseUrl = createPageUrl('Showcase');
                                        const previewUrl = `${showcaseUrl}?preview_theme=${encodeURIComponent(previewTheme?.id || '')}`;
                                        console.log('Opening preview URL:', previewUrl);
                                        window.open(previewUrl, '_blank');
                                    }}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Live Preview
                                </Button>
                            </DialogTitle>
                        </DialogHeader>
                        {previewTheme && (
                            <div className="p-4">
                                {/* Theme Info */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-amber-900 mb-2">{previewTheme?.theme_name || 'Unnamed Theme'}</h3>
                                    <p className="text-amber-600 mb-4">{previewTheme?.description || 'No description available'}</p>
                                    <Badge className="capitalize">{previewTheme?.category || 'uncategorized'}</Badge>
                                </div>

                                {/* Preview Image */}
                                {previewTheme.preview_image_url && (
                                    <div className="aspect-video overflow-hidden rounded-lg border border-amber-200 mb-6">
                                        <img
                                            src={previewTheme?.preview_image_url}
                                            alt={`${previewTheme?.theme_name || 'Theme'} preview`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Live Theme Preview Component */}
                                <div className="mb-6">
                                    <h4 className="text-md font-medium text-amber-800 mb-3">Theme Elements Preview</h4>
                                    <div
                                        className="border border-amber-200 rounded-lg p-6 space-y-4"
                                        style={{
                                            background: `hsl(${previewTheme.css_variables?.match(/--background:\s*([^;]+)/)?.[1] || '0 0% 100%'})`,
                                            color: `hsl(${previewTheme.css_variables?.match(/--foreground:\s*([^;]+)/)?.[1] || '0 0% 0%'})`
                                        }}
                                    >
                                        {/* Sample Elements */}
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <button
                                                className="px-4 py-2 rounded-lg font-medium transition-all"
                                                style={{
                                                    background: `hsl(${previewTheme.css_variables?.match(/--primary:\s*([^;]+)/)?.[1] || '220 90% 50%'})`,
                                                    color: `hsl(${previewTheme.css_variables?.match(/--primary-foreground:\s*([^;]+)/)?.[1] || '0 0% 100%'})`
                                                }}
                                            >
                                                Primary Button
                                            </button>
                                            <div
                                                className="px-4 py-2 rounded-lg border"
                                                style={{
                                                    background: `hsl(${previewTheme.css_variables?.match(/--card:\s*([^;]+)/)?.[1] || '0 0% 100%'})`,
                                                    borderColor: `hsl(${previewTheme.css_variables?.match(/--border:\s*([^;]+)/)?.[1] || '0 0% 90%'})`,
                                                    color: `hsl(${previewTheme.css_variables?.match(/--card-foreground:\s*([^;]+)/)?.[1] || '0 0% 0%'})`
                                                }}
                                            >
                                                Card Element
                                            </div>
                                            <div
                                                className="px-3 py-1 text-xs rounded-full"
                                                style={{
                                                    background: `hsl(${previewTheme.css_variables?.match(/--secondary:\s*([^;]+)/)?.[1] || '0 0% 95%'})`,
                                                    color: `hsl(${previewTheme.css_variables?.match(/--secondary-foreground:\s*([^;]+)/)?.[1] || '0 0% 0%'})`
                                                }}
                                            >
                                                Badge
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="font-semibold mb-2">Sample Heading</h5>
                                            <p className="text-sm opacity-80">This is how text will appear with this theme's color scheme and typography tokens.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* CSS Variables Preview */}
                                <div>
                                    <h4 className="text-md font-medium text-amber-800 mb-3">Generated CSS Variables</h4>
                                    <div className="bg-gray-100 rounded-lg p-4 border border-amber-200 max-h-40 overflow-y-auto">
                                        <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                                            {previewTheme.css_variables || 'No CSS variables available'}
                                        </pre>
                                    </div>
                                </div>

                                {/* Component CSS Preview (if available) */}
                                {previewTheme.component_css && (
                                    <div className="mt-6">
                                        <h4 className="text-md font-medium text-amber-800 mb-3">Generated Component CSS</h4>
                                        <div className="bg-gray-100 rounded-lg p-4 border border-amber-200 max-h-40 overflow-y-auto">
                                            <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                                                {previewTheme.component_css}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}


// New sub-component for editing mode-specific tokens to avoid repetition
const TokenEditor = ({ mode, formData, handleInputChange }) => (
    <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="shadows">Shadows</TabsTrigger>
        </TabsList>
        <TabsContent value="colors" className="space-y-6 pt-4">
            <h3 className="text-lg font-semibold text-amber-900">Brand Colors (HSL)</h3>
            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor={`${mode}_primary_hsl`}>Primary</Label>
                    <Input id={`${mode}_primary_hsl`} value={formData.brand_colors.primary_hsl} onChange={(e) => handleInputChange(`${mode}_mode_tokens.brand_colors.primary_hsl`, e.target.value)} className="border-amber-300 font-mono" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_secondary_hsl`}>Secondary</Label>
                    <Input id={`${mode}_secondary_hsl`} value={formData.brand_colors.secondary_hsl} onChange={(e) => handleInputChange(`${mode}_mode_tokens.brand_colors.secondary_hsl`, e.target.value)} className="border-amber-300 font-mono" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_accent_hsl`}>Accent</Label>
                    <Input id={`${mode}_accent_hsl`} value={formData.brand_colors.accent_hsl} onChange={(e) => handleInputChange(`${mode}_mode_tokens.brand_colors.accent_hsl`, e.target.value)} className="border-amber-300 font-mono" />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-amber-900">Surface Colors (HSL)</h3>
            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor={`${mode}_background_hsl`}>Background</Label>
                    <Input id={`${mode}_background_hsl`} value={formData.surface_colors.background_hsl} onChange={(e) => handleInputChange(`${mode}_mode_tokens.surface_colors.background_hsl`, e.target.value)} className="border-amber-300 font-mono" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_card_hsl`}>Card</Label>
                    <Input id={`${mode}_card_hsl`} value={formData.surface_colors.card_hsl} onChange={(e) => handleInputChange(`${mode}_mode_tokens.surface_colors.card_hsl`, e.target.value)} className="border-amber-300 font-mono" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_muted_hsl`}>Muted</Label>
                    <Input id={`${mode}_muted_hsl`} value={formData.surface_colors.muted_hsl} onChange={(e) => handleInputChange(`${mode}_mode_tokens.surface_colors.muted_hsl`, e.target.value)} className="border-amber-300 font-mono" />
                </div>
            </div>
        </TabsContent>
        <TabsContent value="effects" className="space-y-6 pt-4">
            <h3 className="text-lg font-semibold text-amber-900">Gradients</h3>
            <div className="space-y-4">
                <div>
                    <Label htmlFor={`${mode}_hero_gradient`}>Hero Gradient</Label>
                    <Textarea id={`${mode}_hero_gradient`} value={formData.gradients.hero_gradient} onChange={(e) => handleInputChange(`${mode}_mode_tokens.gradients.hero_gradient`, e.target.value)} rows={2} className="border-amber-300 font-mono text-sm" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_card_gradient`}>Card Gradient</Label>
                    <Textarea id={`${mode}_card_gradient`} value={formData.gradients.card_gradient} onChange={(e) => handleInputChange(`${mode}_mode_tokens.gradients.card_gradient`, e.target.value)} rows={2} className="border-amber-300 font-mono text-sm" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_accent_gradient`}>Accent Gradient</Label>
                    <Textarea id={`${mode}_accent_gradient`} value={formData.gradients.accent_gradient} onChange={(e) => handleInputChange(`${mode}_mode_tokens.gradients.accent_gradient`, e.target.value)} rows={2} className="border-amber-300 font-mono text-sm" />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-amber-900">Glass Effects</h3>
            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor={`${mode}_tint_color`}>Tint Color (RGBA)</Label>
                    <Input id={`${mode}_tint_color`} value={formData.glass_effects.tint_color} onChange={(e) => handleInputChange(`${mode}_mode_tokens.glass_effects.tint_color`, e.target.value)} className="border-amber-300 font-mono" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_blur_strength`}>Blur Strength</Label>
                    <Input id={`${mode}_blur_strength`} value={formData.glass_effects.blur_strength} onChange={(e) => handleInputChange(`${mode}_mode_tokens.glass_effects.blur_strength`, e.target.value)} className="border-amber-300 font-mono" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_border_opacity`}>Border Opacity</Label>
                    <Input id={`${mode}_border_opacity`} value={formData.glass_effects.border_opacity} onChange={(e) => handleInputChange(`${mode}_mode_tokens.glass_effects.border_opacity`, e.target.value)} className="border-amber-300 font-mono" />
                </div>
            </div>
        </TabsContent>
        <TabsContent value="shadows" className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-amber-900">Shadows</h3>
            <div className="space-y-4">
                <div>
                    <Label htmlFor={`${mode}_shadow_subtle`}>Subtle Shadow</Label>
                    <Input id={`${mode}_shadow_subtle`} value={formData.shadows.subtle} onChange={(e) => handleInputChange(`${mode}_mode_tokens.shadows.subtle`, e.target.value)} className="border-amber-300 font-mono text-sm" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_shadow_medium`}>Medium Shadow</Label>
                    <Input id={`${mode}_shadow_medium`} value={formData.shadows.medium} onChange={(e) => handleInputChange(`${mode}_mode_tokens.shadows.medium`, e.target.value)} className="border-amber-300 font-mono text-sm" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_shadow_large`}>Large Shadow</Label>
                    <Input id={`${mode}_shadow_large`} value={formData.shadows.large} onChange={(e) => handleInputChange(`${mode}_mode_tokens.shadows.large`, e.target.value)} className="border-amber-300 font-mono text-sm" />
                </div>
                <div>
                    <Label htmlFor={`${mode}_shadow_luxury`}>Luxury Shadow</Label>
                    <Input id={`${mode}_shadow_luxury`} value={formData.shadows.luxury} onChange={(e) => handleInputChange(`${mode}_mode_tokens.shadows.luxury`, e.target.value)} className="border-amber-300 font-mono text-sm" />
                </div>
            </div>
        </TabsContent>
    </Tabs>
);
