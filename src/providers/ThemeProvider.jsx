import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '@/api/entities';

const ThemeContext = createContext();

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }) {
    const [currentTheme, setCurrentTheme] = useState(null);
    const [allThemes, setAllThemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        try {
            setIsLoading(true);
            const themes = await Theme.list();
            setAllThemes(themes);
            
            // Check for preview theme in URL
            const urlParams = new URLSearchParams(window.location.search);
            const previewThemeId = urlParams.get('preview_theme');
            
            let selectedTheme = null;
            if (previewThemeId) {
                selectedTheme = themes.find(t => t.id === previewThemeId);
                console.log('Using preview theme:', selectedTheme?.theme_name);
            } else {
                // Get active theme or use the first available theme
                selectedTheme = themes.find(t => t.is_active) || themes[0];
                console.log('Using active theme:', selectedTheme?.theme_name);
            }
            
            if (selectedTheme) {
                setCurrentTheme(selectedTheme);
                applyTheme(selectedTheme);
            }
        } catch (error) {
            console.error('Error loading themes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyTheme = (theme, forcedMode = null) => {
        if (!theme) return;
        
        console.log('Applying theme globally:', theme.theme_name);
        
        // Determine current theme mode (light/dark)
        const currentMode = forcedMode || localStorage.getItem('theme-mode') || 'light';
        
        // Choose appropriate CSS variables based on theme mode and theme capability
        let cssVariables = '';
        
        if (theme.light_mode_variables && theme.dark_mode_variables) {
            // New dual-mode theme
            cssVariables = currentMode === 'dark' ? theme.dark_mode_variables : theme.light_mode_variables;
            console.log(`Using ${currentMode} mode variables for theme:`, theme.theme_name);
        } else if (theme.css_variables) {
            // Legacy single-mode theme
            cssVariables = theme.css_variables;
            console.log('Using legacy CSS variables for theme:', theme.theme_name);
        } else {
            console.warn('Theme has no CSS variables:', theme.theme_name);
            return;
        }
        
        // Create or update the global style element
        let styleElement = document.getElementById('dynamic-theme-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-theme-styles';
            document.head.appendChild(styleElement);
        }
        
        styleElement.innerHTML = `
            ${cssVariables}
            
            /* Global theme application */
            html, body {
                height: 100%;
                overflow-x: hidden;
            }
            
            body {
                background-color: hsl(var(--background));
                color: hsl(var(--foreground));
                transition: background-color 0.3s ease, color 0.3s ease;
            }
            
            #root {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            /* Prevent over-scrolling */
            html, body {
                overscroll-behavior: none;
            }

            /* Dark mode support */
            .dark .dark\\:rotate-0 { transform: rotate(0); }
            .dark .dark\\:scale-100 { transform: scale(1); }
            .dark .dark\\:-rotate-90 { transform: rotate(-90deg); }
            .dark .dark\\:scale-0 { transform: scale(0); }

            /* Admin sidebar theme integration */
            .admin-sidebar {
                background-color: hsl(var(--card));
                border-color: hsl(var(--border));
            }
            
            .admin-nav-link {
                color: hsl(var(--muted-foreground));
            }
            
            .admin-nav-link.active {
                background-color: hsl(var(--primary) / 0.1);
                color: hsl(var(--primary));
            }
            
            .admin-nav-link:hover {
                background-color: hsl(var(--accent));
                color: hsl(var(--accent-foreground));
            }

            /* Default fallback gradients */
            :root {
                --bg-gradient-fallback: linear-gradient(135deg, 
                    hsl(var(--primary) / 0.95) 0%, 
                    hsl(var(--primary) / 0.8) 25%,
                    hsl(var(--chart-2) / 0.85) 50%,
                    hsl(var(--primary) / 0.9) 75%,
                    hsl(var(--background) / 0.95) 100%
                ),
                radial-gradient(ellipse at top right, 
                    hsl(var(--chart-1) / 0.3) 0%, 
                    transparent 70%
                ),
                radial-gradient(ellipse at bottom left, 
                    hsl(var(--chart-2) / 0.2) 0%, 
                    transparent 70%
                );
            }
        `;
    };

    const switchTheme = (themeId) => {
        const theme = allThemes.find(t => t.id === themeId);
        if (theme) {
            setCurrentTheme(theme);
            applyTheme(theme);
        }
    };

    const toggleMode = (mode) => {
        localStorage.setItem('theme-mode', mode);
        if (currentTheme) {
            applyTheme(currentTheme, mode);
        }
    };

    const getCurrentMode = () => {
        return localStorage.getItem('theme-mode') || 'light';
    };

    const value = {
        currentTheme,
        allThemes,
        isLoading,
        switchTheme,
        applyTheme,
        toggleMode,
        getCurrentMode,
        refreshThemes: loadThemes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}