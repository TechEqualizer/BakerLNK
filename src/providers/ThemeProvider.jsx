import { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '@/api/entities';
import { logger } from '@/utils/logger';

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
            
            // Check if Supabase is configured
            const supabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                      import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url_here' &&
                                      import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                      import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here';
            
            if (!supabaseConfigured) {
                logger.warn('Supabase not configured. Using default theme.');
                // Apply a default theme when Supabase is not configured
                applyDefaultTheme();
                return;
            }
            
            const themes = await Theme.list();
            setAllThemes(themes);
            
            // Check for preview theme in URL
            const urlParams = new URLSearchParams(window.location.search);
            const previewThemeId = urlParams.get('preview_theme');
            
            let selectedTheme = null;
            if (previewThemeId) {
                selectedTheme = themes.find(t => t.id === previewThemeId);
                logger.log('Using preview theme:', selectedTheme?.theme_name);
            } else {
                // Get active theme or use the first available theme
                selectedTheme = themes.find(t => t.is_active) || themes[0];
                logger.log('Using active theme:', selectedTheme?.theme_name);
            }
            
            if (selectedTheme) {
                setCurrentTheme(selectedTheme);
                applyTheme(selectedTheme);
            } else {
                // If no themes available, apply default
                applyDefaultTheme();
            }
        } catch (error) {
            logger.error('Error loading themes:', error);
            // Apply default theme on error
            applyDefaultTheme();
        } finally {
            setIsLoading(false);
        }
    };

    const applyDefaultTheme = () => {
        logger.log('Applying default theme');
        
        // Default theme CSS variables (shadcn/ui default theme)
        const defaultCSS = `
            :root {
                --background: 0 0% 100%;
                --foreground: 222.2 84% 4.9%;
                --card: 0 0% 100%;
                --card-foreground: 222.2 84% 4.9%;
                --popover: 0 0% 100%;
                --popover-foreground: 222.2 84% 4.9%;
                --primary: 222.2 47.4% 11.2%;
                --primary-foreground: 210 40% 98%;
                --secondary: 210 40% 96.1%;
                --secondary-foreground: 222.2 47.4% 11.2%;
                --muted: 210 40% 96.1%;
                --muted-foreground: 215.4 16.3% 46.9%;
                --accent: 210 40% 96.1%;
                --accent-foreground: 222.2 47.4% 11.2%;
                --destructive: 0 84.2% 60.2%;
                --destructive-foreground: 210 40% 98%;
                --border: 214.3 31.8% 91.4%;
                --input: 214.3 31.8% 91.4%;
                --ring: 222.2 84% 4.9%;
                --radius: 0.5rem;
                --chart-1: 12 76% 61%;
                --chart-2: 173 58% 39%;
                --chart-3: 197 37% 24%;
                --chart-4: 43 74% 66%;
                --chart-5: 27 87% 67%;
            }
            
            .dark {
                --background: 222.2 84% 4.9%;
                --foreground: 210 40% 98%;
                --card: 222.2 84% 4.9%;
                --card-foreground: 210 40% 98%;
                --popover: 222.2 84% 4.9%;
                --popover-foreground: 210 40% 98%;
                --primary: 210 40% 98%;
                --primary-foreground: 222.2 47.4% 11.2%;
                --secondary: 217.2 32.6% 17.5%;
                --secondary-foreground: 210 40% 98%;
                --muted: 217.2 32.6% 17.5%;
                --muted-foreground: 215 20.2% 65.1%;
                --accent: 217.2 32.6% 17.5%;
                --accent-foreground: 210 40% 98%;
                --destructive: 0 62.8% 30.6%;
                --destructive-foreground: 210 40% 98%;
                --border: 217.2 32.6% 17.5%;
                --input: 217.2 32.6% 17.5%;
                --ring: 212.7 26.8% 83.9%;
                --chart-1: 220 70% 50%;
                --chart-2: 160 60% 45%;
                --chart-3: 30 80% 55%;
                --chart-4: 280 65% 60%;
                --chart-5: 340 75% 55%;
            }
        `;
        
        // Apply the default theme
        let styleElement = document.getElementById('dynamic-theme-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-theme-styles';
            document.head.appendChild(styleElement);
        }
        
        styleElement.innerHTML = defaultCSS + `
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
        `;
        
        setCurrentTheme({
            id: 'default',
            theme_name: 'Default Theme',
            description: 'Default theme (Supabase not configured)'
        });
    };

    const applyTheme = (theme, forcedMode = null) => {
        if (!theme) return;
        
        logger.log('Applying theme globally:', theme.theme_name);
        
        // Determine current theme mode (light/dark)
        const currentMode = forcedMode || localStorage.getItem('theme-mode') || 'light';
        
        // Choose appropriate CSS variables based on theme mode and theme capability
        let cssVariables = '';
        
        if (theme.light_mode_variables && theme.dark_mode_variables) {
            // New dual-mode theme
            cssVariables = currentMode === 'dark' ? theme.dark_mode_variables : theme.light_mode_variables;
            logger.log(`Using ${currentMode} mode variables for theme:`, theme.theme_name);
        } else if (theme.css_variables) {
            // Legacy single-mode theme
            cssVariables = theme.css_variables;
            logger.log('Using legacy CSS variables for theme:', theme.theme_name);
        } else {
            logger.warn('Theme has no CSS variables:', theme.theme_name);
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