import { MessageAttachment, GoogleFileAttachment, GOOGLE_FILE_TYPES } from '../types/attachment.types';
import { GoogleConnection, GoogleDriveFile } from './google.service';
// Google Workspace logos
import googleDocsLogo from '../assets/google-docs-logo.webp';
import googleSheetsLogo from '../assets/google-sheets-logo.webp';
import googleSlidesLogo from '../assets/google-slides-logo.webp';
import googleFormsLogo from '../assets/google-forms-logo.webp';
import googleDriveLogo from '../assets/google-drive-logo.webp';

export class GoogleFileAttachmentService {
    /**
     * Convert Google Drive file to MessageAttachment format
     */
    static convertToMessageAttachment(
        googleFile: GoogleDriveFile | GoogleFileAttachment,
        connection: GoogleConnection
    ): MessageAttachment {
        // Handle both GoogleDriveFile and GoogleFileAttachment formats
        const fileId = googleFile.id;
        const fileName = googleFile.name;
        const mimeType = googleFile.mimeType;
        const webViewLink = googleFile.webViewLink;
        const modifiedTime = googleFile.modifiedTime;
        const createdTime = googleFile.createdTime;
        
        // Estimate file size if not provided (Google files don't always have size)
        const fileSize = ('size' in googleFile && googleFile.size) ? 
            Number(googleFile.size) : this.estimateFileSize(mimeType);

        return {
            type: 'google',
            fileId: fileId,
            fileName: fileName,
            fileSize: fileSize,
            mimeType: mimeType,
            fileType: this.getDisplayFileType(mimeType),
            url: webViewLink || '',
            googleFileId: fileId,
            connectionId: connection._id,
            webViewLink: webViewLink,
            modifiedTime: modifiedTime,
            createdTime: createdTime,
        };
    }

    /**
     * Get human-readable file type from MIME type
     */
    static getDisplayFileType(mimeType: string): string {
        switch (mimeType) {
            case GOOGLE_FILE_TYPES.DOCUMENT:
                return 'Google Docs';
            case GOOGLE_FILE_TYPES.SPREADSHEET:
                return 'Google Sheets';
            case GOOGLE_FILE_TYPES.PRESENTATION:
                return 'Google Slides';
            case GOOGLE_FILE_TYPES.FORM:
                return 'Google Forms';
            case GOOGLE_FILE_TYPES.FOLDER:
                return 'Google Drive Folder';
            default:
                if (mimeType.includes('pdf')) return 'PDF';
                if (mimeType.includes('word')) return 'Word Document';
                if (mimeType.includes('excel')) return 'Excel Spreadsheet';
                if (mimeType.includes('powerpoint')) return 'PowerPoint';
                if (mimeType.includes('text')) return 'Text File';
                if (mimeType.includes('image')) return 'Image';
                return 'File';
        }
    }

    /**
     * Estimate file size for Google files (they don't always provide size)
     */
    static estimateFileSize(mimeType: string): number {
        // Return estimated sizes in bytes for different Google file types
        switch (mimeType) {
            case GOOGLE_FILE_TYPES.DOCUMENT:
                return 50000; // ~50KB estimated for average Google Doc
            case GOOGLE_FILE_TYPES.SPREADSHEET:
                return 100000; // ~100KB estimated for average Google Sheet
            case GOOGLE_FILE_TYPES.PRESENTATION:
                return 500000; // ~500KB estimated for average Google Slides
            case GOOGLE_FILE_TYPES.FORM:
                return 25000; // ~25KB estimated for Google Form
            default:
                return 100000; // Default 100KB for unknown types
        }
    }

    /**
     * Navigate to chat with pre-attached Google file
     */
    static navigateToChatWithFile(
        googleFile: GoogleDriveFile | GoogleFileAttachment,
        connection: GoogleConnection
    ): void {
        try {
            const attachment = this.convertToMessageAttachment(googleFile, connection);
            const attachmentParam = encodeURIComponent(JSON.stringify(attachment));
            
            // Navigate to dashboard with file pre-attached via URL params
            // Chat functionality is embedded in the Dashboard component
            const dashboardUrl = `/dashboard?googleFile=${attachmentParam}`;
            window.location.href = dashboardUrl;
        } catch (error) {
            console.error('Failed to navigate to dashboard with Google file:', error);
            // Fallback to basic navigation
            window.location.href = '/dashboard';
        }
    }

    /**
     * Parse Google file attachment from URL parameters
     */
    static parseFromURLParams(): MessageAttachment | null {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const googleFileParam = urlParams.get('googleFile');
            
            if (!googleFileParam) return null;
            
            const attachment: MessageAttachment = JSON.parse(decodeURIComponent(googleFileParam));
            
            // Validate the attachment has required fields
            if (attachment.type === 'google' && 
                attachment.fileId && 
                attachment.fileName && 
                attachment.googleFileId &&
                attachment.connectionId) {
                return attachment;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to parse Google file from URL params:', error);
            return null;
        }
    }

    /**
     * Get file icon based on MIME type with authentic Google Workspace logos
     */
    static getFileIcon(mimeType: string): string {
        switch (mimeType) {
            case GOOGLE_FILE_TYPES.DOCUMENT:
                return googleDocsLogo; // Google Docs logo
            case GOOGLE_FILE_TYPES.SPREADSHEET:
                return googleSheetsLogo; // Google Sheets logo  
            case GOOGLE_FILE_TYPES.PRESENTATION:
                return googleSlidesLogo; // Google Slides logo
            case GOOGLE_FILE_TYPES.FORM:
                return googleFormsLogo; // Google Forms logo
            case GOOGLE_FILE_TYPES.FOLDER:
                return googleDriveLogo; // Google Drive logo
            default:
                if (mimeType.includes('pdf')) return googleDriveLogo;
                if (mimeType.includes('word')) return googleDocsLogo;
                if (mimeType.includes('excel')) return googleSheetsLogo;
                if (mimeType.includes('powerpoint')) return googleSlidesLogo;
                if (mimeType.includes('text')) return googleDocsLogo;
                if (mimeType.includes('image')) return googleDriveLogo;
                return googleDriveLogo; // Default to Google Drive logo
        }
    }

    /**
     * Format file size for display
     */
    static formatFileSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    /**
     * Get file metadata for display
     */
    static getFileMetadata(attachment: MessageAttachment): {
        icon: string;
        displayType: string;
        formattedSize: string;
        lastModified?: string;
    } {
        return {
            icon: this.getFileIcon(attachment.mimeType),
            displayType: this.getDisplayFileType(attachment.mimeType),
            formattedSize: this.formatFileSize(attachment.fileSize),
            lastModified: attachment.modifiedTime ? 
                new Date(attachment.modifiedTime).toLocaleDateString() : undefined,
        };
    }

    /**
     * Clean URL parameters after processing
     */
    static cleanURLParams(): void {
        const url = new URL(window.location.href);
        url.searchParams.delete('googleFile');
        
        // Update URL without triggering navigation
        window.history.replaceState({}, '', url.toString());
    }
}

export default GoogleFileAttachmentService;
