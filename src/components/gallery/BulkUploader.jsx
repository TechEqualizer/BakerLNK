
import React, { useState, useRef } from 'react';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import { Gallery as GalleryEntity } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, X, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function BulkUploader({ onUploadComplete, closeDialog }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(new Set()); // Track which files are getting AI suggestions
  const fileInputRef = useRef(null);

  /**
   * Generates AI-powered title and description suggestions for a given image.
   * @param {File} file - The original File object.
   * @param {string} imageUrl - The URL of the uploaded image.
   * @returns {Promise<{aiTitle: string, aiDescription: string}>} - The generated title and description.
   */
  const generateAISuggestions = async (file, imageUrl) => {
    let aiTitle = '';
    let aiDescription = '';
    try {
      setGeneratingAI(prev => new Set(prev).add(file.name)); // Add file name to tracking set
      
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
          }
        }
      });

      if (result?.title && result?.description) {
        aiTitle = result.title;
        aiDescription = result.description;
        toast.success(`✨ AI suggestions ready for "${file.name}"!`, {
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast.error(`Could not generate suggestions for "${file.name}"`);
    } finally {
      setGeneratingAI(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.name); // Remove file name from tracking set
        return newSet;
      });
    }
    return { aiTitle, aiDescription };
  };

  const processFiles = (incomingFiles) => {
    const newFiles = Array.from(incomingFiles)
      .filter(file => file.type.startsWith('image/'))
      .map(file => Object.assign(file, {
        preview: URL.createObjectURL(file),
        status: 'pending', // pending, uploading, success, error
        progress: 0,
        error: null,
        aiTitle: '', // Initialize AI title field
        aiDescription: '', // Initialize AI description field
      }));
      
    if (newFiles.length === 0 && incomingFiles.length > 0) {
        toast.error("Only image files are allowed.");
        return;
    }

    setFiles(prev => [...prev, ...newFiles]);
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

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset file input
    }
  };

  const onAreaClick = () => {
    // Prevent clicking to select files if an upload or AI generation is in progress
    if (!isUploading && generatingAI.size === 0) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (fileName) => {
    // Filter files by name property
    setFiles(files.filter(file => file.name !== fileName));
  };

  const handleUpload = async () => {
    const filesToUpload = files.filter(f => f.status === 'pending');
    if (filesToUpload.length === 0) {
      toast.info("No new files to upload.");
      return;
    }

    setIsUploading(true);
    // Mark pending files as 'uploading'
    setFiles(prev => prev.map(f => filesToUpload.some(ftu => ftu.name === f.name) ? { ...f, status: 'uploading' } : f));

    const uploadPromises = filesToUpload.map(async (file) => {
      let finalTitle = file.name.split('.').slice(0, -1).join('.').replace(/[-_]/g, ' ');
      let finalDescription = '';

      try {
        // Step 1: Upload the file
        const result = await UploadFile({ file });
        if (result && result.file_url) {
          // Step 2: Generate AI suggestions after successful upload
          const { aiTitle, aiDescription } = await generateAISuggestions(file, result.file_url);
          
          if (aiTitle) finalTitle = aiTitle;
          if (aiDescription) finalDescription = aiDescription;

          // Update the file's status and AI data in the state
          setFiles(prev => prev.map(f => f.name === file.name ? { 
            ...f, 
            status: 'success', 
            progress: 100,
            aiTitle: aiTitle, 
            aiDescription: aiDescription,
          } : f));
          
          return {
            title: finalTitle,
            image_url: result.file_url,
            category: 'specialty',
            description: finalDescription,
          };
        }
        throw new Error("Upload failed to return a URL.");
      } catch (error) {
        console.error('Upload error:', error);
        // Mark the file as 'error' in state
        setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error', error: error.message || "Unknown error" } : f));
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(r => r !== null);

    if (successfulUploads.length > 0) {
      try {
        await GalleryEntity.bulkCreate(successfulUploads);
        toast.success(`${successfulUploads.length} image(s) uploaded and saved to gallery!`);
        onUploadComplete();
      } catch (dbError) {
        toast.error("Failed to save images to gallery.");
      }
    }
    
    // Check if any files failed
    if (successfulUploads.length < filesToUpload.length) {
      toast.error("Some images failed to upload or generate AI suggestions.");
    }
    setIsUploading(false);
  };

  const pendingFileCount = files.filter(f => f.status === 'pending').length;
  // All processes are done if no files are pending, no upload is in progress, and no AI generation is in progress.
  const allDone = files.length > 0 && pendingFileCount === 0 && !isUploading && generatingAI.size === 0;

  return (
    <div className="space-y-6">
      {!allDone && (
        <div 
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={onAreaClick}
          className={`relative p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-amber-300 hover:border-amber-400 hover:bg-amber-50/50'}`}
        >
          <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="image/*"
              className="hidden" 
              onChange={handleFileSelect}
              disabled={isUploading || generatingAI.size > 0} // Disable if uploading or generating AI
          />
          <div className="flex flex-col items-center justify-center gap-2 text-amber-700">
            <UploadCloud className="w-12 h-12" />
            <p className="font-semibold">Drag & drop images here, or click to select</p>
            <p className="text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {/* AI Sparkle icon */}
              PNG, JPG, GIF supported • AI will generate titles & descriptions
            </p>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 -mr-2">
          <h4 className="font-semibold text-amber-800">
            {allDone ? 'Upload Results' : 'Files to Upload'}
          </h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-4 p-2 border rounded-lg bg-white/80">
              <img src={file.preview} alt={file.name} className="w-16 h-16 object-cover rounded-md" onLoad={() => URL.revokeObjectURL(file.preview)} />
              <div className="flex-1">
                <p className="font-medium text-sm truncate text-amber-900">{file.name}</p>
                <p className="text-xs text-amber-600">{(file.size / 1024).toFixed(2)} KB</p>
                
                {/* AI Suggestions Display */}
                {generatingAI.has(file.name) && ( // Show loading indicator if AI is generating for this file
                  <div className="text-xs text-blue-600 flex items-center mt-1">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating suggestions...
                  </div>
                )}
                
                {file.aiTitle && ( // Display AI-generated title and description if available
                  <div className="text-xs text-green-700 mt-1">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span className="font-medium">"{file.aiTitle}"</span>
                    </div>
                    {file.aiDescription && (
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{file.aiDescription}</p>
                    )}
                  </div>
                )}
                
                {file.status === 'uploading' && <Progress value={file.progress} className="h-2 mt-1" />}
                {file.status === 'success' && <div className="text-green-600 flex items-center text-sm mt-1 font-semibold"><CheckCircle className="w-4 h-4 mr-1"/> Uploaded</div>}
                {file.status === 'error' && <p className="text-red-600 text-xs mt-1">Error: {file.error}</p>}
              </div>
              {file.status !== 'uploading' && file.status !== 'success' && (
                <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-600" onClick={() => removeFile(file.name)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-amber-200">
        {allDone ? (
            <Button type="button" variant="outline" onClick={closeDialog}>
                Close
            </Button>
        ) : (
            <>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeDialog} 
                  disabled={isUploading || generatingAI.size > 0} // Disable cancel if uploading or generating AI
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleUpload}
                  disabled={pendingFileCount === 0 || isUploading || generatingAI.size > 0} // Disable if no files, uploading, or generating AI
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : `Upload ${pendingFileCount} File(s) with AI`} {/* Updated button text */}
                </Button>
            </>
        )}
      </div>
    </div>
  );
}
