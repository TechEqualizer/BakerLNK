import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';

export default function ThemeModeToggle({ className }) {
    const { toggleMode, getCurrentMode } = useTheme();
    const currentMode = getCurrentMode();

    const handleToggle = () => {
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        toggleMode(newMode);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className={className}
            aria-label={`Switch to ${currentMode === 'light' ? 'dark' : 'light'} mode`}
        >
            <Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
                currentMode === 'light' 
                    ? 'rotate-0 scale-100' 
                    : '-rotate-90 scale-0'
            }`} />
            <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
                currentMode === 'dark' 
                    ? 'rotate-0 scale-100' 
                    : 'rotate-90 scale-0'
            }`} />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}