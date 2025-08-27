import React, { useState, useRef } from 'react';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import { Customer } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, X, CheckCircle, Users, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";

export default function ContactImporter({ onImportComplete, closeDialog }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = (incomingFile) => {
    const supportedTypes = ['.csv', '.vcf', 'text/csv', 'text/vcard', 'text/x-vcard'];
    const fileType = incomingFile.type.toLowerCase();
    const fileName = incomingFile.name.toLowerCase();
    
    if (!supportedTypes.some(type => fileType.includes(type.replace('.', '')) || fileName.endsWith(type))) {
      toast.error("Only CSV and VCF files are supported.");
      return;
    }

    setFile(Object.assign(incomingFile, {
      preview: fileName,
      status: 'pending'
    }));
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
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const onAreaClick = () => {
    if (!isProcessing) {
      fileInputRef.current.click();
    }
  };

  const removeFile = () => {
    setFile(null);
    setImportResults(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Upload file first
      const uploadResult = await UploadFile({ file });
      if (!uploadResult?.file_url) {
        throw new Error("Failed to upload file");
      }

      // Define schema for contact extraction
      const contactSchema = {
        type: "object",
        properties: {
          contacts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                notes: { type: "string" }
              }
            }
          }
        }
      };

      // Extract contact data from file
      const extractResult = await ExtractDataFromUploadedFile({
        file_url: uploadResult.file_url,
        json_schema: contactSchema
      });

      if (extractResult.status !== 'success' || !extractResult.output?.contacts) {
        throw new Error(extractResult.details || "Failed to extract contact data");
      }

      const contacts = extractResult.output.contacts;
      let created = 0;
      let updated = 0;
      let skipped = 0;
      let errors = [];

      // Process each contact
      for (const contact of contacts) {
        try {
          // Skip if no name or email
          if (!contact.name && !contact.email) {
            skipped++;
            continue;
          }

          // Check if customer already exists by email
          let existingCustomer = null;
          if (contact.email) {
            const existing = await Customer.filter({ email: contact.email });
            existingCustomer = existing[0] || null;
          }

          const customerData = {
            name: contact.name || 'Imported Contact',
            email: contact.email || '',
            phone: contact.phone || '',
            notes: contact.notes || ''
          };

          if (existingCustomer) {
            // Update existing customer
            await Customer.update(existingCustomer.id, customerData);
            updated++;
          } else {
            // Create new customer
            await Customer.create(customerData);
            created++;
          }
        } catch (error) {
          console.error('Error processing contact:', error);
          errors.push(`${contact.name || contact.email}: ${error.message}`);
        }
      }

      setImportResults({ created, updated, skipped, errors, total: contacts.length });
      toast.success(`Import complete! ${created} created, ${updated} updated.`);
      
      if (onImportComplete) {
        onImportComplete();
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Failed to import contacts: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!importResults && (
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
              accept=".csv,.vcf"
              className="hidden" 
              onChange={handleFileSelect}
              disabled={isProcessing}
          />
          <div className="flex flex-col items-center justify-center gap-2 text-amber-700">
            <UploadCloud className="w-12 h-12" />
            <p className="font-semibold">Drop your contact file here, or click to select</p>
            <p className="text-xs">CSV and VCF files supported</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">CSV</Badge>
              <Badge variant="outline" className="text-xs">VCF</Badge>
            </div>
          </div>
        </div>
      )}

      {file && !importResults && (
        <div className="space-y-4">
          <h4 className="font-semibold text-amber-800">File Ready for Import</h4>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-white/80">
            <Users className="w-8 h-8 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-sm text-amber-900">{file.name}</p>
              <p className="text-xs text-amber-600">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            {!isProcessing && (
              <Button size="icon" variant="ghost" className="text-gray-500 hover:text-red-600" onClick={removeFile}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {importResults && (
        <div className="space-y-4">
          <h4 className="font-semibold text-amber-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Import Complete
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{importResults.created}</div>
              <div className="text-sm text-green-600">Created</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{importResults.updated}</div>
              <div className="text-sm text-blue-600">Updated</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{importResults.skipped}</div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-700">{importResults.total}</div>
              <div className="text-sm text-amber-600">Total</div>
            </div>
          </div>
          
          {importResults.errors.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Some contacts had issues:</span>
              </div>
              <div className="text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {importResults.errors.map((error, idx) => (
                  <div key={idx}>• {error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-amber-200">
        {importResults ? (
          <Button type="button" variant="outline" onClick={closeDialog}>
            Close
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Import Contacts
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}