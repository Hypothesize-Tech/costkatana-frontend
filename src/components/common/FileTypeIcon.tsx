import React from 'react';
import {
    DocumentTextIcon,
    CodeBracketIcon,
    PhotoIcon,
    DocumentIcon,
    ChartBarIcon,
    GlobeAltIcon,
    PresentationChartBarIcon,
    DocumentDuplicateIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface FileTypeIconProps {
    fileName: string;
    className?: string;
}

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ fileName, className = 'h-5 w-5' }) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    // Code files
    const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'rb', 'php', 'swift', 'kt', 'scala', 'r', 'sql', 'sh', 'bash'];
    
    // Image files
    const imageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
    
    // Data files
    const dataExtensions = ['csv', 'xlsx', 'xls', 'json', 'xml'];
    
    // Web files
    const webExtensions = ['html', 'htm'];
    
    // Presentation files
    const presentationExtensions = ['pptx', 'ppt'];
    
    // Config files
    const configExtensions = ['yaml', 'yml', 'toml', 'ini', 'cfg', 'conf'];
    
    // Document files
    const documentExtensions = ['pdf', 'doc', 'docx', 'rtf'];
    
    // Text files
    const textExtensions = ['txt', 'md', 'log'];

    if (codeExtensions.includes(extension)) {
        return <CodeBracketIcon className={className} title="Code file" />;
    }
    
    if (imageExtensions.includes(extension)) {
        return <PhotoIcon className={className} title="Image file" />;
    }
    
    if (dataExtensions.includes(extension)) {
        return <ChartBarIcon className={className} title="Data file" />;
    }
    
    if (webExtensions.includes(extension)) {
        return <GlobeAltIcon className={className} title="Web file" />;
    }
    
    if (presentationExtensions.includes(extension)) {
        return <PresentationChartBarIcon className={className} title="Presentation file" />;
    }
    
    if (configExtensions.includes(extension)) {
        return <Cog6ToothIcon className={className} title="Configuration file" />;
    }
    
    if (documentExtensions.includes(extension)) {
        return <DocumentIcon className={className} title="Document file" />;
    }
    
    if (textExtensions.includes(extension)) {
        return <DocumentTextIcon className={className} title="Text file" />;
    }
    
    // Default icon
    return <DocumentDuplicateIcon className={className} title="File" />;
};

export default FileTypeIcon;