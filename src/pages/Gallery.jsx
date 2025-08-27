
import React, { useState, useEffect } from "react";
import { Gallery as GalleryEntity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus,
  Edit,
  Trash2,
  Star,
  UploadCloud,
  Crown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import BulkUploader from "../components/gallery/BulkUploader";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'birthday',
    tags: [],
    featured: false,
    price_range: '$',
    serves_count: ''
  });
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('edit'); // 'edit' or 'upload'

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const galleryData = await GalleryEntity.list('-featured', 50);
      setGallery(galleryData);
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast.error("Failed to load gallery items.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGallery = selectedCategory === "all" 
    ? gallery 
    : gallery.filter(item => item.category === selectedCategory);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        serves_count: formData.serves_count ? parseInt(formData.serves_count) : null,
        tags: Array.isArray(formData.tags) ? formData.tags.filter(tag => tag && tag.trim()) : [],
      };
      
      if (editingItem) {
        await GalleryEntity.update(editingItem.id, submitData);
        toast.success("Gallery item updated!");
      }

      resetForm();
      setShowDialog(false);
      loadGallery();
    } catch (error) {
      console.error('Error saving gallery item:', error);
      toast.error("Failed to save item.");
    }
  };

  const handleEdit = (item) => {
    setDialogMode('edit');
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      image_url: item.image_url || '',
      category: item.category || 'birthday',
      tags: item.tags || [],
      featured: item.featured || false,
      price_range: item.price_range || '$',
      serves_count: item.serves_count?.toString() || ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      try {
        await GalleryEntity.delete(id);
        toast.success("Item deleted from gallery.");
        loadGallery();
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        toast.error("Failed to delete item.");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '', description: '', image_url: '', category: 'birthday',
      tags: [], featured: false, price_range: '$', serves_count: ''
    });
  };

  const handleNewItem = () => {
    resetForm();
    setDialogMode('upload');
    setShowDialog(true);
  };

  const handleUploadComplete = () => {
    loadGallery();
  };

  if (isLoading && gallery.length === 0) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-80 border border-amber-200"></div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Gallery Management</h1>
            <p className="text-amber-700 mt-1">Showcase your beautiful cake creations</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleNewItem}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg w-full sm:w-auto"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Add New Images
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-lg">
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === 'upload' ? 'Bulk Upload Images' : 'Edit Gallery Item'}
                </DialogTitle>
              </DialogHeader>
              <div className="p-1 md:p-6">
                {dialogMode === 'upload' ? (
                  <BulkUploader onUploadComplete={handleUploadComplete} closeDialog={() => setShowDialog(false)} />
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="title" className="text-amber-800 font-medium">Title *</Label>
                      <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required className="border-amber-300 focus:border-amber-500" />
                    </div>
                    <div>
                      <Label htmlFor="image_url" className="text-amber-800 font-medium">Image URL *</Label>
                      <Input id="image_url" value={formData.image_url} onChange={(e) => handleInputChange('image_url', e.target.value)} required readOnly className="border-amber-300 bg-gray-100" />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-amber-800 font-medium">Description</Label>
                      <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} className="border-amber-300" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="border-amber-300"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="birthday">Birthday</SelectItem>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="holiday">Holiday</SelectItem>
                          <SelectItem value="specialty">Specialty</SelectItem>
                          <SelectItem value="cupcakes">Cupcakes</SelectItem>
                          <SelectItem value="desserts">Desserts</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={formData.price_range} onValueChange={(value) => handleInputChange('price_range', value)}>
                         <SelectTrigger className="border-amber-300"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="$">$</SelectItem>
                            <SelectItem value="$$">$$</SelectItem>
                            <SelectItem value="$$$">$$$</SelectItem>
                            <SelectItem value="$$$$">$$$$</SelectItem>
                         </SelectContent>
                      </Select>
                      <Input id="serves_count" type="number" value={formData.serves_count} onChange={(e) => handleInputChange('serves_count', e.target.value)} className="border-amber-300" placeholder="Serves Count" />
                    </div>
                    <div>
                      <Label htmlFor="tags" className="text-amber-800 font-medium">Tags (comma separated)</Label>
                      <Input id="tags" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()))} className="border-amber-300" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="featured" checked={formData.featured} onCheckedChange={(checked) => handleInputChange('featured', !!checked)} />
                      <Label htmlFor="featured" className="text-amber-800 font-medium">Feature this item</Label>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-amber-200">
                      <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                      <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">Save Changes</Button>
                    </div>
                  </form>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {['all', 'wedding', 'birthday', 'corporate', 'holiday', 'specialty', 'cupcakes', 'desserts'].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              className={`text-xs md:text-sm ${selectedCategory === category 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg" 
                : "border-amber-300 text-amber-700 hover:bg-amber-50"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredGallery.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-amber-800/20 shadow-lg hover:shadow-amber-500/20 transition-all duration-700">
                <div className="aspect-square overflow-hidden">
                    <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    
                    <div className="absolute top-2 right-2 flex gap-2 transform translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                        <Button size="icon" variant="outline" className="h-8 w-8 bg-white/80 hover:bg-white text-gray-700" onClick={() => handleEdit(item)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8 bg-red-500/80 hover:bg-red-500 text-white" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="font-bold text-white mb-2 truncate">{item.title}</h3>
                            <div className="flex items-center justify-between">
                                <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/30 capitalize">
                                    {item.category}
                                </Badge>
                                {item.featured && (
                                    <div className="flex items-center text-amber-400">
                                        <Crown className="w-4 h-4 mr-1" />
                                        <span className="text-xs font-light">Featured</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
