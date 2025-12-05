import React, { useState, useRef, useCallback } from 'react';
import { FiUpload, FiLink, FiX, FiImage } from 'react-icons/fi';

interface ImageVariableInputProps {
    variableName: string;
    imageRole: 'reference' | 'evidence';
    description?: string;
    required: boolean;
    value?: string; // S3 URL or base64
    onChange: (value: string) => void;
    accept?: string;
}

export const ImageVariableInput: React.FC<ImageVariableInputProps> = ({
    variableName,
    imageRole,
    description,
    required,
    value,
    onChange,
    accept = 'image/*'
}) => {
    const [inputMethod, setInputMethod] = useState<'upload' | 's3url'>('upload');
    const [s3UrlInput, setS3UrlInput] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(async (file: File) => {
        if (!file) return;

        // Validate file type
        const validTypes = accept.split(',').map(t => t.trim());
        if (!validTypes.some(type => file.type === type || file.name.endsWith(type.replace('image/', '.')))) {
            alert(`Invalid file type. Please upload: ${accept}`);
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPreview(base64);
            onChange(base64);
        };
        reader.readAsDataURL(file);
    }, [accept, onChange]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    }, [handleFileChange]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
        }
    }, [handleFileChange]);

    const handleS3UrlSubmit = useCallback(() => {
        if (!s3UrlInput.trim()) return;

        // Basic URL validation
        try {
            new URL(s3UrlInput);
            setPreview(s3UrlInput);
            onChange(s3UrlInput);
        } catch {
            alert('Invalid URL format');
        }
    }, [s3UrlInput, onChange]);

    const handleClear = useCallback(() => {
        setPreview(null);
        setS3UrlInput('');
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onChange]);

    return (
        <div className="space-y-4">
            {/* Variable Header */}
            <div className="flex justify-between items-start">
                <div>
                    <label className="block text-sm font-semibold text-secondary-900 dark:text-white">
                        {variableName}
                        {required && <span className="ml-1 text-lg text-danger-500">*</span>}
                    </label>
                    {description && (
                        <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                            {description}
                        </p>
                    )}
                    <span className="inline-block px-2 py-1 mt-1 text-xs font-medium rounded-full bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300">
                        {imageRole === 'reference' ? 'Reference Image' : 'Evidence Image'}
                    </span>
                </div>
            </div>

            {/* Input Method Toggle */}
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    type="button"
                    onClick={() => setInputMethod('upload')}
                    className={`flex gap-2 items-center justify-center px-4 py-2 text-sm rounded-lg font-medium transition-all ${inputMethod === 'upload'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'bg-secondary-200 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300'
                        }`}
                >
                    <FiUpload className="w-4 h-4" />
                    Upload File
                </button>
                <button
                    type="button"
                    onClick={() => setInputMethod('s3url')}
                    className={`flex gap-2 items-center justify-center px-4 py-2 text-sm rounded-lg font-medium transition-all ${inputMethod === 's3url'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'bg-secondary-200 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300'
                        }`}
                >
                    <FiLink className="w-4 h-4" />
                    S3 URL
                </button>
            </div>

            {/* Upload Method */}
            {inputMethod === 'upload' && !preview && (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative p-8 text-center border-2 border-dashed rounded-xl transition-all ${dragActive
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-300 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-800/50'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center">
                        <div className="p-3 mb-4 bg-gradient-to-br rounded-full from-primary-500 to-primary-600">
                            <FiUpload className="w-6 h-6 text-white" />
                        </div>
                        <p className="mb-2 text-sm font-semibold text-secondary-900 dark:text-white">
                            Drop your {imageRole} image here
                        </p>
                        <p className="mb-4 text-xs text-secondary-600 dark:text-secondary-400">
                            or click to browse (max 10MB)
                        </p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 text-sm font-medium text-white transition-all bg-gradient-to-r rounded-lg from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                        >
                            Choose File
                        </button>
                        <p className="mt-3 text-xs text-secondary-500 dark:text-secondary-500">
                            Supported: {accept.split(',').join(', ')}
                        </p>
                    </div>
                </div>
            )}

            {/* S3 URL Method */}
            {inputMethod === 's3url' && !preview && (
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="url"
                            value={s3UrlInput}
                            onChange={(e) => setS3UrlInput(e.target.value)}
                            placeholder="https://s3.amazonaws.com/bucket/image.jpg"
                            className="flex-1 input"
                        />
                        <button
                            type="button"
                            onClick={handleS3UrlSubmit}
                            disabled={!s3UrlInput.trim()}
                            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white transition-all bg-gradient-to-r rounded-lg from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Load Image
                        </button>
                    </div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-500">
                        Enter the S3 URL of your {imageRole} image
                    </p>
                </div>
            )}

            {/* Preview */}
            {preview && (
                <div className="relative p-4 bg-gradient-to-br rounded-xl border from-secondary-50 to-secondary-100 dark:from-secondary-800 dark:to-secondary-700 border-secondary-200 dark:border-secondary-600">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2 items-center">
                            <FiImage className="w-4 h-4 text-success-500" />
                            <span className="text-sm font-semibold text-success-600 dark:text-success-400">
                                Image Loaded
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-danger-500 transition-colors rounded hover:bg-danger-100 dark:hover:bg-danger-900/30"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="overflow-hidden rounded-lg">
                        <img
                            src={preview}
                            alt={`${imageRole} preview`}
                            className="object-contain w-full h-48"
                            onError={() => {
                                // If image fails to load, show placeholder
                                setPreview(null);
                                alert('Failed to load image. Please check the URL or file.');
                            }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-3 text-xs text-secondary-600 dark:text-secondary-400">
                        <span>{imageRole === 'reference' ? 'Reference' : 'Evidence'} Image</span>
                        <span className="px-2 py-1 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300">
                            Ready
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};


