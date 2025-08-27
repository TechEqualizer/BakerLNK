import React, { useState, useRef } from 'react';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function DesignUploader({ onImagesChange }) {
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const processFiles = async (files) => {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            toast.error("Please upload image files only.");
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
                        name: file.name,
                        preview: URL.createObjectURL(file)
                    };
                    newImages.push(imageData);
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        const updatedImages = [...uploadedImages, ...newImages];
        setUploadedImages(updatedImages);
        onImagesChange(updatedImages.map(img => img.url));
        setIsUploading(false);
        
        if (newImages.length > 0) {
            toast.success(`${newImages.length} inspiration image(s) uploaded successfully!`);
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
            processFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                files.push(items[i].getAsFile());
            }
        }
        
        if (files.length > 0) {
            processFiles(files);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = '';
        }
    };

    const removeImage = (index) => {
        const newImages = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(newImages);
        onImagesChange(newImages.map(img => img.url));
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onPaste={handlePaste}
                onClick={() => fileInputRef.current?.click()}
                className={`relative p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                    isDragging 
                        ? 'border-amber-400 bg-amber-400/5' 
                        : 'border-white/30 hover:border-amber-400/50 hover:bg-white/5'
                } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                tabIndex={0}
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
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-yellow-600/20 rounded-2xl flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-2">Share Your Design Inspiration</h4>
                        <p className="text-gray-400 text-sm mb-2">
                            {isUploading ? 'Uploading images...' : 'Drag & drop, paste, or click to upload inspiration images'}
                        </p>
                        <p className="text-gray-500 text-xs">
                            Pinterest screenshots, sketches, photos - anything that inspires you!
                        </p>
                    </div>
                </div>
                
                {isUploading && (
                    <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                    </div>
                )}
            </div>

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
                <div className="space-y-3">
                    <h5 className="text-white font-medium text-sm">Inspiration Images ({uploadedImages.length})</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {uploadedImages.map((image, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={image.preview}
                                    alt={image.name}
                                    className="w-full aspect-square object-cover rounded-lg border border-white/20"
                                    onLoad={() => URL.revokeObjectURL(image.preview)}
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-medium truncate px-2">
                                        {image.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}