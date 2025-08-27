
import React, { useState, useRef } from 'react';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, X, Plus, Image as ImageIcon, Star, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingStep3({ data, onChange }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [generatingAI, setGeneratingAI] = useState(new Set()); // Track which images are getting AI suggestions
    const fileInputRef = useRef(null);

    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        category: 'specialty',
        featured: false,
        tags: ''
    });

    const generateAISuggestions = async (imageUrl, imageIndex) => {
        // Prevent re-generation if already generating for this image
        if (generatingAI.has(imageIndex)) {
            return;
        }

        try {
            setGeneratingAI(prev => new Set(prev).add(imageIndex));
            
            const result = await InvokeLLM({
                prompt: `You are a creative bakery marketing expert. Look at this cake/dessert image and generate:
1. A creative, appealing title (2-5 words max)
2. A mouth-watering description (1-2 sentences, focus on visual appeal, flavors, and occasion)

Make it sound professional yet warm, like a skilled baker would describe their creation. Be specific about visual elements you can see.`,
                file_urls: [imageUrl],
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            description: "Creative, appealing cake title"
                        },
                        description: {
                            type: "string", 
                            description: "Mouth-watering description"
                        }
                    },
                    required: ["title", "description"]
                }
            });

            if (result?.title && result?.description) {
                // Update the specific image with AI suggestions
                const updatedImages = [...data.galleryImages];
                updatedImages[imageIndex] = {
                    ...updatedImages[imageIndex],
                    title: result.title,
                    description: result.description
                };
                onChange({ galleryImages: updatedImages });
                
                toast.success('✨ AI suggestions added!', {
                    duration: 2000
                });
            } else {
                toast.error('AI could not generate suggestions. Please try again or add details manually.');
            }
        } catch (error) {
            console.error('Error generating AI suggestions:', error);
            toast.error('Could not generate suggestions. Please add title manually.');
        } finally {
            setGeneratingAI(prev => {
                const newSet = new Set(prev);
                newSet.delete(imageIndex);
                return newSet;
            });
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
            e.dataTransfer.clearData();
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
            e.target.value = '';
        }
    };

    const handleFiles = async (files) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            toast.error('Please upload image files only.');
            return;
        }

        setIsUploading(true);
        const newImages = [];

        for (const file of imageFiles) {
            try {
                const result = await UploadFile({ file });
                if (result?.file_url) {
                    const imageData = {
                        url: result.file_url,
                        title: '', // Will be filled by AI
                        description: '', // Will be filled by AI
                        category: 'specialty',
                        featured: false,
                        tags: [],
                        preview: URL.createObjectURL(file)
                    };
                    newImages.push(imageData);
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        if (newImages.length > 0) {
            const currentImagesCount = data.galleryImages.length;
            const updatedImages = [...data.galleryImages, ...newImages];
            onChange({ galleryImages: updatedImages });
            toast.success(`${newImages.length} image(s) uploaded successfully!`);
            
            // Generate AI suggestions for each new image
            for (let i = 0; i < newImages.length; i++) {
                const imageIndex = currentImagesCount + i;
                generateAISuggestions(newImages[i].url, imageIndex);
            }
        }

        setIsUploading(false);
    };

    const removeImage = (index) => {
        const updatedImages = data.galleryImages.filter((_, i) => i !== index);
        onChange({ galleryImages: updatedImages });
        
        if (editingIndex === index) {
            setEditingIndex(null);
        }
        // Also remove from generatingAI set if it was in there
        setGeneratingAI(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            // Adjust indices for any subsequent images that were generating
            const newAdjustedSet = new Set();
            newSet.forEach(itemIndex => {
                if (itemIndex > index) {
                    newAdjustedSet.add(itemIndex - 1);
                } else {
                    newAdjustedSet.add(itemIndex);
                }
            });
            return newAdjustedSet;
        });
    };

    const editImage = (index) => {
        const image = data.galleryImages[index];
        setEditForm({
            title: image.title || '',
            description: image.description || '',
            category: image.category || 'specialty',
            featured: image.featured || false,
            tags: Array.isArray(image.tags) ? image.tags.join(', ') : ''
        });
        setEditingIndex(index);
    };

    const saveImageEdit = () => {
        if (editingIndex === null) return;

        const updatedImages = [...data.galleryImages];
        updatedImages[editingIndex] = {
            ...updatedImages[editingIndex],
            title: editForm.title,
            description: editForm.description,
            category: editForm.category,
            featured: editForm.featured,
            tags: editForm.tags.split(',').map(t => t.trim()).filter(t => t)
        };

        onChange({ galleryImages: updatedImages });
        setEditingIndex(null);
        toast.success('Image details updated!');
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <p className="text-amber-600">
                    Upload some of your best work to give customers a taste of your amazing creations! 
                    <span className="inline-flex items-center ml-2 text-amber-700 font-medium">
                        <Sparkles className="w-4 h-4 mr-1" />
                        AI will suggest titles & descriptions automatically!
                    </span>
                </p>
            </div>

            {/* Upload Area */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                    isDragging 
                        ? 'border-amber-400 bg-amber-400/5' 
                        : 'border-amber-300 hover:border-amber-400 hover:bg-amber-50/50'
                } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-2xl flex items-center justify-center">
                        <UploadCloud className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <h4 className="text-amber-800 font-medium mb-2">
                            {isUploading ? 'Uploading your masterpieces...' : 'Upload Your Best Creations'}
                        </h4>
                        <p className="text-amber-600 text-sm mb-2">
                            Drag & drop images here, or click to browse
                        </p>
                        <p className="text-amber-500 text-xs flex items-center justify-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            JPG, PNG, GIF supported • AI will generate titles & descriptions automatically
                        </p>
                    </div>
                </div>
                
                {isUploading && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                )}
            </div>

            {/* Gallery Preview */}
            {data.galleryImages.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-amber-800">
                            Your Gallery ({data.galleryImages.length} images)
                        </h3>
                        <Badge className="bg-amber-100 text-amber-800">
                            Ready for showcase!
                        </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.galleryImages.map((image, index) => (
                            <div key={index} className="border border-amber-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                <div className="relative aspect-video">
                                    <img
                                        src={image.preview || image.url}
                                        alt={image.title}
                                        className="w-full h-full object-cover"
                                        onLoad={() => image.preview && URL.revokeObjectURL(image.preview)}
                                    />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {image.featured && (
                                            <Badge className="bg-amber-500 text-white text-xs">
                                                <Star className="w-3 h-3 mr-1" />
                                                Featured
                                            </Badge>
                                        )}
                                        {generatingAI.has(index) && (
                                            <Badge className="bg-blue-500 text-white text-xs flex items-center">
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                AI Writing...
                                            </Badge>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-6 w-6"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="p-3">
                                    {editingIndex === index ? (
                                        <div className="space-y-3">
                                            <Input
                                                placeholder="Image title"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="text-sm"
                                            />
                                            <Textarea
                                                placeholder="Description (optional)"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                rows={2}
                                                className="text-sm"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Select
                                                    value={editForm.category}
                                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
                                                >
                                                    <SelectTrigger className="text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
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
                                                <Input
                                                    placeholder="Tags (comma separated)"
                                                    value={editForm.tags}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`featured-${index}`}
                                                        checked={editForm.featured}
                                                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, featured: !!checked }))}
                                                    />
                                                    <Label htmlFor={`featured-${index}`} className="text-xs">Featured</Label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                                                        Cancel
                                                    </Button>
                                                    <Button size="sm" onClick={saveImageEdit}>
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-amber-800 text-sm truncate flex items-center">
                                                    {generatingAI.has(index) ? (
                                                        <div className="flex items-center text-blue-600">
                                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            <span className="text-xs">Generating title...</span>
                                                        </div>
                                                    ) : image.title || 'Untitled Creation'}
                                                </h4>
                                                <div className="flex items-center gap-1">
                                                    {!generatingAI.has(index) && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => generateAISuggestions(image.url, index)}
                                                            className="text-xs p-1 h-6 text-blue-600 hover:bg-blue-50"
                                                            title="Regenerate AI suggestions"
                                                            disabled={!image.url} // Disable if image URL isn't available yet
                                                        >
                                                            <Sparkles className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => editImage(index)}
                                                        className="text-xs"
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            </div>
                                            {generatingAI.has(index) ? (
                                                <div className="text-xs text-blue-600 mb-2 flex items-center">
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                    Creating description...
                                                </div>
                                            ) : (
                                                image.description && (
                                                    <p className="text-xs text-amber-600 mb-2 line-clamp-2">{image.description}</p>
                                                )
                                            )}
                                            <div className="flex items-center justify-between text-xs">
                                                <Badge variant="outline" className="capitalize">
                                                    {image.category}
                                                </Badge>
                                                {image.tags && image.tags.length > 0 && (
                                                    <span className="text-amber-600">
                                                        {image.tags.slice(0, 2).join(', ')}
                                                        {image.tags.length > 2 && '...'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.galleryImages.length === 0 && (
                <div className="text-center py-8 text-amber-600">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No images uploaded yet</p>
                    <p className="text-sm">Upload some photos to showcase your amazing work!</p>
                    <p className="text-xs mt-2 opacity-75 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Don't worry about titles - our AI will suggest them for you!
                    </p>
                </div>
            )}
        </div>
    );
}
