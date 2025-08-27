import React from 'react';

// A simple parser for the "One-Paste Theme Pack" feature.
// It's not a full YAML/JSON parser but is designed to handle the specific format provided.

// Helper to extract a value from a YAML-like string block
const extractValue = (block, key) => {
    // Regex to find a key followed by a colon, optional whitespace, and then capture the rest of the line.
    const regex = new RegExp(`^\\s*${key}:\\s*(.+)`, 'm');
    const match = block.match(regex);
    // Return the captured value, trimmed and with quotes removed.
    return match ? match[1].trim().replace(/['"]/g, '') : null;
};

// Helper to extract a nested block of text (e.g., meta, assets)
const extractBlock = (yaml, blockName) => {
    // This regex looks for the block name at the start of a line,
    // and captures everything indented underneath it.
    const regex = new RegExp(`^${blockName}:(\\s+[\\s\\S]*?)(?=\\n[a-zA-Z]|$)`, 'm');
    const match = yaml.match(regex);
    return match ? match[1] : '';
};


export const parseThemePack = (input) => {
    const trimmedInput = input.trim();
    
    let format;
    if (trimmedInput.startsWith('---') || trimmedInput.startsWith('meta:')) {
        format = 'yaml';
    } else if (trimmedInput.startsWith('{')) {
        format = 'json';
    } else {
        format = 'css';
    }
    
    const parsed = {};
    
    if (format === 'yaml') {
        const metaBlock = extractBlock(trimmedInput, 'meta');
        if (metaBlock) {
            parsed.theme_name = extractValue(metaBlock, 'name') || '';
            parsed.category = extractValue(metaBlock, 'category')?.toLowerCase() || 'modern';
            parsed.description = extractValue(metaBlock, 'description') || '';
        }

        const assetsBlock = extractBlock(trimmedInput, 'assets');
        if (assetsBlock) {
            parsed.preview_image_url = extractValue(assetsBlock, 'preview') || '';
            parsed.background_texture_url = extractValue(assetsBlock, 'texture') || '';
        }
        
        parsed.typography = {};
        const typographyBlock = extractBlock(trimmedInput, 'typography');
        if (typographyBlock) {
            parsed.typography.font_display = extractValue(typographyBlock, 'display') || '';
            parsed.typography.font_body = extractValue(typographyBlock, 'body') || '';
            parsed.typography.font_mono = extractValue(typographyBlock, 'mono') || '';
        }

        parsed.motion = {};
        const motionBlock = extractBlock(trimmedInput, 'motion');
        if (motionBlock) {
            parsed.motion.duration_fast = extractValue(motionBlock, 'fast') || '';
            parsed.motion.duration_medium = extractValue(motionBlock, 'med') || '';
            parsed.motion.duration_slow = extractValue(motionBlock, 'slow') || '';
        }
        
        const cssMatch = trimmedInput.match(/css_variables:.*?\|([\s\S]*)/);
        if (cssMatch) {
            const cssBlock = cssMatch[1].trim();
            const lightTokens = { brand_colors: {}, surface_colors: {}, gradients: {}, glass_effects: {}, shadows: {} };
            const cssVars = cssBlock.split(';').filter(v => v.trim());
            cssVars.forEach(variable => {
                const [key, value] = variable.split(':').map(s => s.trim());
                if (!key || !value) return;

                if (key === '--primary') lightTokens.brand_colors.primary_hsl = value;
                if (key === '--secondary') lightTokens.brand_colors.secondary_hsl = value;
                if (key === '--accent') lightTokens.brand_colors.accent_hsl = value;
                if (key === '--background') lightTokens.surface_colors.background_hsl = value;
                if (key === '--card') lightTokens.surface_colors.card_hsl = value;
                if (key === '--muted') lightTokens.surface_colors.muted_hsl = value;
                if (key === '--bg-gradient-hero') lightTokens.gradients.hero_gradient = value;
                if (key === '--bg-gradient-card') lightTokens.gradients.card_gradient = value;
                if (key === '--bg-gradient-accent') lightTokens.gradients.accent_gradient = value;
                if (key === '--glass-tint') lightTokens.glass_effects.tint_color = value;
                if (key === '--glass-blur') lightTokens.glass_effects.blur_strength = value;
                if (key === '--glass-border-opacity') lightTokens.glass_effects.border_opacity = value;
                if (key === '--shadow-subtle') lightTokens.shadows.subtle = value;
                if (key === '--shadow-medium') lightTokens.shadows.medium = value;
                if (key === '--shadow-large') lightTokens.shadows.large = value;
                if (key === '--shadow-luxury') lightTokens.shadows.luxury = value;
            });
            parsed.light_mode_tokens = lightTokens;
        }
    } else if (format === 'json') {
        try {
            const data = JSON.parse(trimmedInput);
            if (data.meta) {
                parsed.theme_name = data.meta.name || '';
                parsed.category = data.meta.category?.toLowerCase() || 'modern';
                parsed.description = data.meta.description || '';
            }
            if (data.assets) {
                parsed.preview_image_url = data.assets.preview || '';
                parsed.background_texture_url = data.assets.texture || '';
            }
        } catch (e) {
            throw new Error('Invalid JSON format.');
        }
    } else {
        throw new Error('Unsupported theme pack format.');
    }
    
    return parsed;
};