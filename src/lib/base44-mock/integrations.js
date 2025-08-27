// Mock integrations for Base44 SDK

// Mock LLM integration
export const InvokeLLM = async ({ prompt, file_urls, response_json_schema }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock responses based on common patterns
  if (prompt.toLowerCase().includes('title') && prompt.toLowerCase().includes('description')) {
    // For image analysis requests (like in BulkUploader)
    return {
      title: generateMockTitle(),
      description: generateMockDescription()
    };
  }
  
  // Generic response
  return {
    response: `Mock response for: ${prompt.substring(0, 50)}...`,
    metadata: {
      model: 'mock-llm',
      tokens: Math.floor(Math.random() * 100) + 50
    }
  };
};

// Mock email integration
export const SendEmail = async ({ to, subject, body, from }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('Mock email sent:', { to, subject, from });
  
  return {
    success: true,
    messageId: `msg_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
};

// Mock file upload integration
export const UploadFile = async ({ file, folder }) => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      // Convert to base64 data URL
      const dataUrl = reader.result;
      
      // Store in localStorage with a unique key
      const fileKey = `uploaded_file_${Date.now()}_${file.name}`;
      try {
        localStorage.setItem(fileKey, dataUrl);
        
        resolve({
          file_url: dataUrl,
          file_key: fileKey,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          uploaded_at: new Date().toISOString()
        });
      } catch (error) {
        // Handle localStorage quota exceeded
        console.error('Upload failed:', error);
        reject(new Error('Upload failed - storage quota exceeded'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Mock image generation integration
export const GenerateImage = async ({ prompt, size, style }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a placeholder image URL
  const width = size?.width || 512;
  const height = size?.height || 512;
  const text = encodeURIComponent(prompt.substring(0, 30));
  
  return {
    image_url: `https://via.placeholder.com/${width}x${height}/FFE4B5/8B4513?text=${text}`,
    prompt: prompt,
    style: style || 'default',
    generated_at: new Date().toISOString()
  };
};

// Mock data extraction integration
export const ExtractDataFromUploadedFile = async ({ file_url, extraction_schema }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock extracted data based on schema
  const mockData = {};
  
  if (extraction_schema?.properties) {
    Object.entries(extraction_schema.properties).forEach(([key, schema]) => {
      if (schema.type === 'string') {
        mockData[key] = `Mock ${key} data`;
      } else if (schema.type === 'number') {
        mockData[key] = Math.floor(Math.random() * 100);
      } else if (schema.type === 'boolean') {
        mockData[key] = Math.random() > 0.5;
      } else if (schema.type === 'array') {
        mockData[key] = [`Mock item 1`, `Mock item 2`];
      }
    });
  }
  
  return {
    extracted_data: mockData,
    confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
    file_url: file_url,
    extraction_timestamp: new Date().toISOString()
  };
};

// Helper functions for generating mock data
function generateMockTitle() {
  const titles = [
    'Chocolate Dream Cake',
    'Vanilla Berry Delight',
    'Red Velvet Masterpiece',
    'Caramel Swirl Creation',
    'Lemon Zest Sunshine',
    'Strawberry Fields Cake',
    'Mocha Madness',
    'Birthday Celebration Special',
    'Wedding Elegance',
    'Custom Design Cake'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateMockDescription() {
  const descriptions = [
    'A delightful three-layer cake with rich chocolate frosting and decorative swirls.',
    'Elegant vanilla sponge cake adorned with fresh berries and whipped cream.',
    'Classic red velvet cake with cream cheese frosting and artistic piping details.',
    'Decadent caramel cake featuring multiple layers and golden caramel drizzle.',
    'Light and refreshing lemon cake perfect for summer celebrations.',
    'Fresh strawberry cake with homemade jam filling and buttercream roses.',
    'Coffee-infused chocolate cake with mocha buttercream and chocolate shavings.',
    'Colorful birthday cake with fondant decorations and personalized message.',
    'Sophisticated wedding cake with intricate sugar flowers and pearl details.',
    'Unique custom design tailored to your special occasion and preferences.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Create Core namespace to match the original SDK structure
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile
};