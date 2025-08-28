
import React, { useState, useEffect } from "react";
import { Baker } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save, Palette, Eye, Wand2, Sparkles, Check } from "lucide-react"; // Added icons
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTheme } from "../providers/ThemeProvider";

export default function Settings() {
  const { currentTheme, allThemes, switchTheme, toggleMode, getCurrentMode, isLoading: themeLoading } = useTheme();
  const [baker, setBaker] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentMode, setCurrentMode] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    loadData();
    setCurrentMode(getCurrentMode());
  }, [getCurrentMode]);

  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    console.log('Settings page - checking auth, token found:', !!token);
    setIsAuthenticated(!!token);
  };

  const quickLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'elena@artisancakesstudio.com',
          password: 'demo123'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
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

  const loadData = async () => {
    try {
      // Simplified data loading, as Theme data is no longer needed directly in this component
      const bakerData = await Baker.list().then(data => data[0]);
      
      if (bakerData) {
        setBaker(bakerData);
        setFormData(bakerData);
      }
    } catch (error) {
      console.error('Error loading settings data:', error);
      toast.error("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/integrations/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formDataUpload
      });

      if (response.ok) {
        const result = await response.json();
        handleInputChange(fieldName, result.url);
        toast.success(`${fieldName === 'logo_url' ? 'Logo' : 'Hero image'} uploaded successfully!`);
        
        // Trigger a custom event to notify other components about the update
        window.dispatchEvent(new CustomEvent('bakerDataUpdated', { 
          detail: { field: fieldName, value: result.url } 
        }));
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login first to save business settings');
      return;
    }
    
    setIsSaving(true);
    try {
      const dataToSave = { ...formData };
      delete dataToSave.id;
      delete dataToSave.created_date;
      delete dataToSave.updated_date;

      console.log('Submitting business settings:', {
        bakerId: baker?.id,
        dataToSave,
        hasAuth: !!localStorage.getItem('auth_token')
      });

      if (baker) {
        await Baker.update(baker.id, dataToSave);
      } else {
        await Baker.create(dataToSave);
      }
      toast.success("Business settings saved successfully!");
      loadData();
      
      // Trigger a custom event to notify other components about the update
      window.dispatchEvent(new CustomEvent('bakerDataUpdated', { 
        detail: { type: 'businessSettings', data: dataToSave } 
      }));
    } catch (error) {
      console.error('Error saving business settings:', error);
      const errorMessage = error?.message || error?.error || "Failed to save business settings. Please try again.";
      toast.error(`Failed to save: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-gradient-to-br from-background via-background/95 to-muted/50 min-h-screen">
        <div className="animate-pulse bg-card rounded-xl h-96 border"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <SettingsIcon className="w-8 h-8 text-foreground" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your bakery's information and appearance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="w-full md:w-auto">
            <Link to={createPageUrl('Showcase')} className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview Site
            </Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground w-full md:w-auto">
            <a href="/public" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Public URL
            </a>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:inline-grid md:grid-cols-2 h-auto">
          <TabsTrigger value="business" className="py-2">
            Business Info
          </TabsTrigger>
          <TabsTrigger value="design" className="py-2">
            <Palette className="w-4 h-4 mr-2" />
            Theme & Design
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          {!isAuthenticated && (
            <div className="mb-4 p-4 bg-muted/50 border border-border rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">Authentication Required</p>
                  <p className="text-xs text-muted-foreground">Please login to edit business settings</p>
                </div>
                <Button
                  size="sm"
                  onClick={quickLogin}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Quick Login
                </Button>
              </div>
            </div>
          )}
          <form onSubmit={handleBusinessSubmit}>
            <div className="space-y-8">
              <Card className="bg-card/80 backdrop-blur-sm border shadow-lg">
                <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input id="business_name" value={formData.business_name || ''} onChange={e => handleInputChange('business_name', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input id="tagline" value={formData.tagline || ''} onChange={e => handleInputChange('tagline', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">About / Description</Label>
                    <Textarea id="description" value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} rows={4} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Contact Email</Label>
                      <Input id="email" type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Contact Phone</Label>
                      <Input id="phone" type="tel" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location / Service Area</Label>
                    <Input id="location" value={formData.location || ''} onChange={e => handleInputChange('location', e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border shadow-lg">
                <CardHeader><CardTitle>Order Rules</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="lead_time_days">Lead Time (days)</Label>
                    <Input id="lead_time_days" type="number" value={formData.lead_time_days || ''} onChange={e => handleInputChange('lead_time_days', parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label htmlFor="max_orders_per_day">Max Orders per Day</Label>
                    <Input id="max_orders_per_day" type="number" value={formData.max_orders_per_day || ''} onChange={e => handleInputChange('max_orders_per_day', parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label htmlFor="deposit_percentage">Deposit (%)</Label>
                    <Input id="deposit_percentage" type="number" value={formData.deposit_percentage || ''} onChange={e => handleInputChange('deposit_percentage', parseInt(e.target.value) || 0)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border shadow-lg">
                <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input id="logo_url" value={formData.logo_url || ''} onChange={e => handleInputChange('logo_url', e.target.value)} placeholder="https://example.com/logo.png or upload below" />
                    <div className="mt-2">
                      <Label className="text-sm text-muted-foreground">Or upload a logo:</Label>
                      <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_url')} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="hero_image_url">Hero Image URL</Label>
                    <Input id="hero_image_url" value={formData.hero_image_url || ''} onChange={e => handleInputChange('hero_image_url', e.target.value)} placeholder="https://example.com/hero.jpg or upload below" />
                    <div className="mt-2">
                      <Label className="text-sm text-muted-foreground">Or upload a hero image:</Label>
                      <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero_image_url')} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving || !isAuthenticated}
                  className={`bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg ${
                    !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : !isAuthenticated ? 'Login Required' : 'Save Business Settings'}
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          {/* Current Theme Display */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Current Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentTheme ? (
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border">
                  <div>
                    <p className="font-semibold text-primary">{currentTheme.theme_name}</p>
                    <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
                    <Badge variant="outline" className="mt-2 capitalize">{currentTheme.category}</Badge>
                  </div>
                  <Check className="h-8 w-8 text-primary" />
                </div>
              ) : (
                <p className="text-muted-foreground">Loading theme...</p>
              )}
            </CardContent>
          </Card>

          {/* Theme Mode Toggle */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Theme Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Switch between light and dark mode for better viewing comfort.
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant={currentMode === 'light' ? 'default' : 'outline'}
                  onClick={() => {
                    toggleMode('light');
                    setCurrentMode('light');
                  }}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Light Mode
                </Button>
                <Button
                  variant={currentMode === 'dark' ? 'default' : 'outline'}
                  onClick={() => {
                    toggleMode('dark');
                    setCurrentMode('dark');
                  }}
                  className="flex-1"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Dark Mode
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Current mode: <span className="font-medium capitalize">{currentMode}</span>
                {currentTheme && currentTheme.light_mode_variables && currentTheme.dark_mode_variables && (
                  <span className="text-green-600"> • Dual-mode theme</span>
                )}
                {currentTheme && !currentTheme.light_mode_variables && (
                  <span className="text-amber-600"> • Legacy theme (light only)</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Theme Selection */}
          <Card className="bg-card border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Quick Theme Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Choose from available themes to instantly update your site appearance.
              </p>
              
              {themeLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {allThemes.slice(0, 4).map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => switchTheme(theme.id)}
                      className={`p-3 rounded-lg text-left transition-colors flex items-center justify-between border ${
                        currentTheme?.id === theme.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-muted/50 hover:bg-muted border-border'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{theme.theme_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {theme.category}
                          {theme.light_mode_variables && theme.dark_mode_variables && (
                            <span className="ml-2 text-green-600">• Dual-mode</span>
                          )}
                        </p>
                      </div>
                      {currentTheme?.id === theme.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              <Button asChild className="w-full">
                <Link to={createPageUrl('ThemeManagerV2')}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Advanced Theme Manager
                </Link>
              </Button>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}
