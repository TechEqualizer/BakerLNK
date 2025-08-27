import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Palette, 
    Eye,
    Edit,
    Copy,
    Trash2,
    Check,
    X
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ThemeManagerV2() {
    const [themes, setThemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Quick edit form state
    const [editForm, setEditForm] = useState({
        theme_name: '',
        description: '',
        category: 'modern',
        is_active: false
    });

    useEffect(() => {
        checkAuth();
        loadThemes();
    }, []);
    
    const checkAuth = () => {
        const token = localStorage.getItem('auth_token');
        console.log('Checking auth - token found:', !!token);
        setIsAuthenticated(!!token);
    };
    
    const quickLogin = async () => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'baker@example.com',
                    password: 'password123'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_data', JSON.stringify(data.user));
                setIsAuthenticated(true);
                toast.success('Logged in successfully!');
                return true;
            } else {
                toast.error('Login failed');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed: ' + error.message);
            return false;
        }
    };


    const loadThemes = async () => {
        setIsLoading(true);
        try {
            const themesData = await Theme.list();
            setThemes(themesData);
            if (themesData.length > 0 && !selectedTheme) {
                setSelectedTheme(themesData[0]);
            }
        } catch (error) {
            console.error('Error loading themes:', error);
            toast.error('Failed to load themes');
        } finally {
            setIsLoading(false);
        }
    };


    const handleQuickEdit = (theme) => {
        console.log('Quick Edit clicked for theme:', theme.theme_name);
        console.log('Is authenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('Not authenticated - button should be disabled');
            return;
        }
        
        setSelectedTheme(theme);
        setIsEditing(true);
        setEditForm({
            theme_name: theme.theme_name || '',
            description: theme.description || '',
            category: theme.category || 'modern',
            is_active: theme.is_active || false
        });
        
        console.log('Edit form set:', {
            theme_name: theme.theme_name,
            description: theme.description,
            category: theme.category,
            is_active: theme.is_active
        });
    };

    const handleSaveQuickEdit = async () => {
        if (!selectedTheme) return;
        
        try {
            const updatedData = {
                ...selectedTheme,
                ...editForm
            };
            
            await Theme.update(selectedTheme.id, updatedData);
            toast.success('Theme updated successfully!');
            setIsEditing(false);
            loadThemes();
        } catch (error) {
            console.error('Error updating theme:', error);
            toast.error('Failed to update theme');
        }
    };

    const handleDuplicate = async (theme) => {
        try {
            const duplicatedTheme = {
                ...theme,
                theme_name: `${theme.theme_name} Copy`,
                id: undefined
            };
            delete duplicatedTheme.id;
            await Theme.create(duplicatedTheme);
            toast.success('Theme duplicated successfully!');
            loadThemes();
        } catch (error) {
            console.error('Error duplicating theme:', error);
            toast.error('Failed to duplicate theme');
        }
    };

    const handleDelete = async (themeId) => {
        if (!confirm('Are you sure you want to delete this theme?')) return;
        
        try {
            await Theme.delete(themeId);
            toast.success('Theme deleted successfully!');
            if (selectedTheme?.id === themeId) {
                setSelectedTheme(null);
                setIsEditing(false);
            }
            loadThemes();
        } catch (error) {
            console.error('Error deleting theme:', error);
            toast.error('Failed to delete theme');
        }
    };



    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Palette className="w-12 h-12 mx-auto mb-4 animate-spin text-amber-600" />
                    <p className="text-muted-foreground">Loading themes...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster richColors position="top-center" />
            <div className="flex h-screen bg-background">
                {/* Main Panel - Theme List and Controls */}
                <div className="w-full flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Button asChild variant="ghost" size="icon">
                                    <Link to={createPageUrl('Settings')}>
                                        <ArrowLeft className="w-4 h-4" />
                                    </Link>
                                </Button>
                                <div>
                                    <h1 className="text-xl font-semibold">Theme Manager</h1>
                                    <p className="text-sm text-muted-foreground">Quick edit and preview themes</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Authentication Warning */}
                        {!isAuthenticated && (
                            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-amber-800">
                                        <span className="font-semibold">Note:</span> You're in read-only mode. Log in to create or edit themes.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={quickLogin}
                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        Quick Login
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                    </div>
                    
                    {/* Theme Table */}
                    <ScrollArea className="flex-1">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">Theme</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        <span className="inline-flex items-center gap-1">
                                            Actions
                                            <span className="text-xs text-muted-foreground">(👁️ = Live Preview)</span>
                                        </span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {themes.map((theme) => (
                                    <TableRow 
                                        key={theme.id}
                                        className={`cursor-pointer transition-colors ${selectedTheme?.id === theme.id ? 'bg-accent' : ''}`}
                                        onClick={() => !isEditing && setSelectedTheme(theme)}
                                    >
                                        <TableCell className="font-medium">
                                            <div>
                                                <p>{theme.theme_name}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {theme.description}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {theme.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {theme.is_active ? (
                                                <Badge variant="default" className="text-xs">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-blue-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const showcaseUrl = createPageUrl('Showcase');
                                                        const previewUrl = `${showcaseUrl}?preview_theme=${encodeURIComponent(theme.id)}`;
                                                        window.open(previewUrl, '_blank');
                                                    }}
                                                    title="Preview on live site"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-7 w-7 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Edit button clicked, authenticated:', isAuthenticated);
                                                        if (isAuthenticated) {
                                                            handleQuickEdit(theme);
                                                        }
                                                    }}
                                                    title={!isAuthenticated ? "Login required - Click 'Quick Login' above" : "Quick edit theme properties"}
                                                    disabled={!isAuthenticated}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDuplicate(theme);
                                                    }}
                                                    title={!isAuthenticated ? "Login required" : "Duplicate"}
                                                    disabled={!isAuthenticated}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(theme.id);
                                                    }}
                                                    title={!isAuthenticated ? "Login required" : "Delete"}
                                                    disabled={!isAuthenticated}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                    
                    {/* Quick Edit Panel */}
                    {isEditing && selectedTheme && (
                        <div className="p-4 border-t bg-card space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Quick Edit: {selectedTheme.theme_name}</h3>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsEditing(false);
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveQuickEdit}
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Save
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Theme Name</Label>
                                    <Input
                                        value={editForm.theme_name}
                                        onChange={(e) => setEditForm({...editForm, theme_name: e.target.value})}
                                        className="h-8"
                                        placeholder="Enter theme name"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        className="h-8"
                                        placeholder="Enter theme description"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Category</Label>
                                        <Select
                                            value={editForm.category}
                                            onValueChange={(value) => setEditForm({...editForm, category: value})}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="modern">Modern</SelectItem>
                                                <SelectItem value="classic">Classic</SelectItem>
                                                <SelectItem value="luxury">Luxury</SelectItem>
                                                <SelectItem value="artistic">Artistic</SelectItem>
                                                <SelectItem value="minimal">Minimal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-xs">Status</Label>
                                        <Select
                                            value={editForm.is_active ? "active" : "inactive"}
                                            onValueChange={(value) => setEditForm({...editForm, is_active: value === "active"})}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}