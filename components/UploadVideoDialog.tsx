import React, { useState } from 'react';
import { getApiUrl } from '../config/api';

interface UploadVideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (file: File) => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

export default function UploadVideoDialog({ isOpen, onClose, onUploadSuccess }: UploadVideoDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    // Clear any previous errors
    setError('');

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than 100MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }

    // Check file type (optional - add video formats as needed)
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, WebM, OGG, or MOV)');
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    // This function should NOT throw errors directly
    // Instead, it should handle them gracefully
    
    // Validate file size again before upload
    if (file.size > MAX_FILE_SIZE) {
      // Don't throw an error, set it in state instead
      setError(`File size must be less than 100MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    // Your actual upload logic here
    const formData = new FormData();
    formData.append('video', file);
    formData.append('filename', file.name);
    formData.append('filesize', file.size.toString());

    try {
      // Get the upload API URL from configuration
      const apiUrl = getApiUrl('UPLOAD');
      
      console.log('Attempting upload to:', apiUrl);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // Include credentials if your API requires authentication
        credentials: 'include',
        // Note: Don't set Content-Type header when sending FormData
        // The browser will set it automatically with the correct boundary
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch {
          // If response isn't JSON, use the status text
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(file);
      }
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Provide more specific error messages
      let errorMessage = 'Upload failed. Please try again.';
      
      if (uploadError instanceof TypeError && uploadError.message === 'Failed to fetch') {
        errorMessage = 'Network error: Unable to connect to the server. Please check your connection and try again.';
      } else if (uploadError instanceof Error) {
        errorMessage = uploadError.message;
      }
      
      setError(errorMessage);
      throw uploadError; // Re-throw if you need to handle it in handleSubmit
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    // Clear any previous errors
    setError('');
    setIsUploading(true);

    try {
      // Validate file before uploading
      if (!validateFile(selectedFile)) {
        // validateFile sets the error message
        setIsUploading(false);
        return;
      }

      await uploadFile(selectedFile);
      
      // Reset form and close dialog on success
      setSelectedFile(null);
      onClose();
    } catch (error) {
      // Error is already handled in uploadFile
      console.error('Submit error:', error);
      // The error message should already be set by uploadFile
      if (!error) {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="video-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Select Video File (Max 100MB)
            </label>
            <input
              type="file"
              id="video-upload"
              accept="video/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {selectedFile && (
            <div className="mb-4 p-3 bg-gray-100 rounded">
              <p className="text-sm">
                <strong>Selected:</strong> {selectedFile.name}
              </p>
              <p className="text-sm">
                <strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}