import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ThemeColorPicker({ colors, onChange }) {
    const colorGroups = [
        {
            title: 'Primary Colors',
            colors: [
                { key: 'background', label: 'Background', default: '0 0% 100%' },
                { key: 'foreground', label: 'Text', default: '222.2 84% 4.9%' },
                { key: 'primary', label: 'Primary', default: '221.2 83.2% 53.3%' },
                { key: 'primary-foreground', label: 'Primary Text', default: '210 40% 98%' }
            ]
        },
        {
            title: 'Surface Colors',
            colors: [
                { key: 'card', label: 'Card Background', default: '0 0% 100%' },
                { key: 'card-foreground', label: 'Card Text', default: '222.2 84% 4.9%' },
                { key: 'secondary', label: 'Secondary', default: '210 40% 96%' },
                { key: 'secondary-foreground', label: 'Secondary Text', default: '222.2 47.4% 11.2%' }
            ]
        },
        {
            title: 'Interactive Elements',
            colors: [
                { key: 'accent', label: 'Accent', default: '210 40% 96%' },
                { key: 'accent-foreground', label: 'Accent Text', default: '222.2 47.4% 11.2%' },
                { key: 'border', label: 'Borders', default: '214.3 31.8% 91.4%' },
                { key: 'input', label: 'Input Fields', default: '214.3 31.8% 91.4%' }
            ]
        }
    ];

    const handleColorChange = (key, value) => {
        onChange({
            ...colors,
            [key]: value
        });
    };

    return (
        <div className="space-y-6">
            {colorGroups.map((group) => (
                <Card key={group.title} className="border-amber-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-amber-800">{group.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {group.colors.map((color) => (
                            <div key={color.key} className="flex items-center gap-3">
                                <Label className="text-xs text-amber-700 w-24 flex-shrink-0">
                                    {color.label}
                                </Label>
                                <Input
                                    type="text"
                                    value={colors[color.key] || color.default}
                                    onChange={(e) => handleColorChange(color.key, e.target.value)}
                                    placeholder={color.default}
                                    className="flex-1 text-xs font-mono border-amber-300"
                                />
                                <div 
                                    className="w-8 h-8 rounded border border-amber-300 flex-shrink-0"
                                    style={{ 
                                        backgroundColor: `hsl(${colors[color.key] || color.default})` 
                                    }}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}