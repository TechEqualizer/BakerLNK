
import React from 'react';

// Utility functions
const parseHSL = (hslString) => {
    if (!hslString || typeof hslString !== 'string') return { h: 0, s: 0, l: 50 };
    const match = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!match) return { h: 0, s: 0, l: 50 };
    return { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) };
};

const generateContrastForeground = (backgroundHSL) => {
    const { l } = parseHSL(backgroundHSL);
    // Use a slightly lower threshold for dark text to improve readability on mid-tones
    return l > 55 ? '222 47% 11%' : '210 40% 98%';
};

// Generates CSS variables for a given mode's token set
const generateModeTokens = (modeTokens) => {
    if (!modeTokens) return {};
    
    const tokens = {};
    const { brand_colors, surface_colors, gradients, glass_effects, shadows } = modeTokens;

    // Brand Colors
    if (brand_colors) {
        if (brand_colors.primary_hsl) {
            tokens['--primary'] = brand_colors.primary_hsl;
            tokens['--primary-foreground'] = generateContrastForeground(brand_colors.primary_hsl);
        }
        if (brand_colors.secondary_hsl) {
            tokens['--secondary'] = brand_colors.secondary_hsl;
            tokens['--secondary-foreground'] = generateContrastForeground(brand_colors.secondary_hsl);
        }
        if (brand_colors.accent_hsl) {
            tokens['--accent'] = brand_colors.accent_hsl;
            tokens['--accent-foreground'] = generateContrastForeground(brand_colors.accent_hsl);
        }
    }
    
    // Surface Colors
    if (surface_colors) {
        if (surface_colors.background_hsl) {
            tokens['--background'] = surface_colors.background_hsl;
            tokens['--foreground'] = generateContrastForeground(surface_colors.background_hsl);
        }
        if (surface_colors.card_hsl) {
            tokens['--card'] = surface_colors.card_hsl;
            tokens['--card-foreground'] = generateContrastForeground(surface_colors.card_hsl);
        }
        if (surface_colors.muted_hsl) {
            tokens['--muted'] = surface_colors.muted_hsl;
            tokens['--muted-foreground'] = generateContrastForeground(surface_colors.muted_hsl);
        }
    }

    // Default semantic colors (can be overridden by theme)
    tokens['--destructive'] = tokens['--destructive'] || '0 84% 60%';
    tokens['--destructive-foreground'] = tokens['--destructive-foreground'] || '0 0% 98%';
    tokens['--border'] = tokens['--border'] || (modeTokens.surface_colors ? parseHSL(modeTokens.surface_colors.background_hsl).l > 50 ? '214 32% 91%' : '217 33% 27%' : '214 32% 91%');
    tokens['--input'] = tokens['--input'] || tokens['--border'];
    tokens['--ring'] = tokens['--ring'] || tokens['--primary'] || '221 83% 53%';
    
    // Gradients, Glass, Shadows
    if (gradients) {
        if (gradients.hero_gradient) tokens['--bg-gradient-hero'] = gradients.hero_gradient;
        if (gradients.card_gradient) tokens['--bg-gradient-card'] = gradients.card_gradient;
        if (gradients.accent_gradient) tokens['--bg-gradient-accent'] = gradients.accent_gradient;
    }
    if (glass_effects) {
        if (glass_effects.tint_color) tokens['--glass-tint'] = glass_effects.tint_color;
        if (glass_effects.blur_strength) tokens['--glass-blur'] = glass_effects.blur_strength;
        if (glass_effects.border_opacity) tokens['--glass-border-opacity'] = glass_effects.border_opacity;
    }
    if (shadows) {
        if (shadows.subtle) tokens['--shadow-subtle'] = shadows.subtle;
        if (shadows.medium) tokens['--shadow-medium'] = shadows.medium;
        if (shadows.large) tokens['--shadow-large'] = shadows.large;
        if (shadows.luxury) tokens['--shadow-luxury'] = shadows.luxury;
    }

    return tokens;
};


export const compileThemeTokens = (themeData) => {
    if (!themeData) return '';

    // --- 1. Global Tokens (Typography, Motion, etc.) ---
    const globalTokens = {};
    if (themeData.typography) {
        if (themeData.typography.font_display) globalTokens['--font-display'] = themeData.typography.font_display;
        if (themeData.typography.font_body) globalTokens['--font-body'] = themeData.typography.font_body;
        if (themeData.typography.font_mono) globalTokens['--font-mono'] = themeData.typography.font_mono;
        if (themeData.typography.scale_ratio) globalTokens['--type-scale-ratio'] = themeData.typography.scale_ratio;
    }
    if (themeData.motion) {
        if (themeData.motion.duration_fast) globalTokens['--duration-fast'] = themeData.motion.duration_fast;
        if (themeData.motion.duration_medium) globalTokens['--duration-medium'] = themeData.motion.duration_medium;
        if (themeData.motion.duration_slow) globalTokens['--duration-slow'] = themeData.motion.duration_slow;
        if (themeData.motion.easing_standard) globalTokens['--easing-standard'] = themeData.motion.easing_standard;
        if (themeData.motion.easing_emphasized) globalTokens['--easing-emphasized'] = themeData.motion.easing_emphasized;
    }

    // --- 2. Mode-Specific Tokens ---
    const lightModeTokens = generateModeTokens(themeData.light_mode_tokens);
    const darkModeTokens = generateModeTokens(themeData.dark_mode_tokens);

    // --- 3. Chart Colors (based on light mode primary) ---
    const chartColors = [
        lightModeTokens['--primary'] || '221 83% 53%',
        lightModeTokens['--accent'] || '142 71% 45%',
        '38 92% 50%', // Orange
        '268 71% 63%', // Purple
        '198 93% 60%', // Blue
        '160 84% 39%', // Green
        '348 83% 47%', // Red
        '48 96% 89%'   // Yellow
    ];
    chartColors.forEach((color, index) => {
        globalTokens[`--chart-${index + 1}`] = color;
    });

    // --- 4. Assemble CSS String ---
    const formatTokens = (tokens) => Object.entries(tokens).map(([key, value]) => `    ${key}: ${value};`).join('\n');
    
    const rootCss = formatTokens({ ...globalTokens, ...lightModeTokens });
    const darkCss = formatTokens(darkModeTokens);

    return `
:root {
${rootCss}
}

[data-theme="dark"] {
${darkCss}
}

/* --- Base Theme Styles --- */
body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: var(--font-body);
    transition: color, background-color var(--duration-medium) ease;
}

h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
}
    `.trim();
};

export default function TokenCompiler() {
    return null; // This is a utility component
}
