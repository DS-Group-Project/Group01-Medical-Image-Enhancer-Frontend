import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { 
  UploadCloud, 
  X, 
  FileImage, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

// Mock Upload Service for demonstration
const mockUploadService = {
  uploadImages: async (files, onProgress) => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        onProgress(Math.round(progress));
        
        if (progress === 100) {
          clearInterval(interval);
          // Return mock job IDs
          resolve(files.map((_, index) => `job-${Date.now()}-${index}`));
        }
      }, 500);
    });
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUploadZone = ({ onDrop, isUploading }) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/dicom': ['.dcm']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full p-10 border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center min-h-[300px]
        ${isDragActive ? 'border-teal-500 bg-teal-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="p-4 bg-white rounded-full shadow-sm mb-4">
        <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-teal-600' : 'text-slate-400'}`} />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {isDragActive ? 'Drop your images here' : 'Drag & drop your medical images'}
      </h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
        Support for JPEG, PNG, and standard DICOM files up to 50MB per image.
      </p>
      <button 
        type="button"
        disabled={isUploading}
        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg shadow-sm hover:bg-slate-50 hover:text-teal-600 transition-colors disabled:opacity-50"
      >
        Browse Files
      </button>
    </div>
  );
};

const FilePreviewCard = ({ file, onRemove, isUploading, progress }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm group overflow-hidden"
    >
      {isUploading && (
        <div 
          className="absolute left-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      )}
      
      <div className="w-12 h-12 shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center mr-4">
        {preview ? (
          <img src={preview} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <FileImage className="w-6 h-6 text-slate-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-slate-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-slate-500">
          {formatFileSize(file.size)}
        </p>
      </div>

      <button
        onClick={() => onRemove(file)}
        disabled={isUploading}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Remove file"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isUploading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
          <span className="text-sm font-semibold text-teal-700 bg-white px-2 py-1 rounded-md shadow-sm">
            {progress}%
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [jobIds, setJobIds] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Some files were rejected. Please check file type and size.');
    }
    
    setFiles(prev => {
      const newFiles = [...prev];
      acceptedFiles.forEach(file => {
        if (!newFiles.some(f => f.name === file.name && f.size === file.size)) {
          newFiles.push(file);
        }
      });
      return newFiles;
    });
  }, []);

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const ids = await mockUploadService.uploadImages(files, (progress) => {
        setUploadProgress(progress);
      });

      setJobIds(ids);
      setUploadComplete(true);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <motion.div 
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-indigo-600">
              Upload X-Ray Images
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your medical images for AI-powered enhancement. Fast, secure, and accurate.
          </p>
        </div>

        {uploadComplete ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100"
          >
            <div className="mx-auto w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Complete!</h2>
            <p className="text-slate-600 mb-8">
              Your {files.length} image{files.length > 1 ? 's have' : ' has'} been queued for enhancement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(`/processing/${jobIds[0]}`)}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                View Progress
              </button>
              <button
                onClick={() => {
                  setFiles([]);
                  setUploadComplete(false);
                  setUploadProgress(0);
                }}
                className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Upload More
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Upload Zone */}
            <FileUploadZone onDrop={onDrop} isUploading={isUploading} />

            {/* Selected Files Section */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      Selected Files
                      <span className="bg-teal-100 text-teal-800 text-xs py-0.5 px-2 rounded-full">
                        {files.length}
                      </span>
                    </h2>
                    <button
                      onClick={clearAll}
                      disabled={isUploading}
                      className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {files.map((file, index) => (
                        <FilePreviewCard
                          key={`${file.name}-${index}`}
                          file={file}
                          onRemove={removeFile}
                          isUploading={isUploading}
                          progress={uploadProgress}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Upload Summary Bar */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="sticky bottom-4 mt-8 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 text-slate-600">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <FileImage className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{files.length} Files Ready</p>
                        <p className="text-sm">Total size: {formatFileSize(totalSize)}</p>
                      </div>
                    </div>

                    <div className="flex items-center w-full sm:w-auto gap-3">
                      <button
                        onClick={clearAll}
                        disabled={isUploading}
                        className="flex-1 sm:flex-none px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="flex-1 sm:flex-none relative overflow-hidden px-8 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed group"
                      >
                        <span className={`flex items-center justify-center gap-2 ${isUploading ? 'opacity-0' : 'opacity-100'}`}>
                          <UploadCloud className="w-5 h-5" />
                          Upload & Enhance
                        </span>
                        
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{uploadProgress}%</span>
                          </div>
                        )}
                        
                        {/* Overall Progress Bar Background */}
                        {isUploading && (
                          <div 
                            className="absolute left-0 bottom-0 h-full bg-black/10 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
