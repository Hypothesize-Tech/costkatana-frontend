import api from "@/config/api";

export interface PickerFile {
    fileId: string;
    fileName: string;
    mimeType: string;
    fileType: 'docs' | 'sheets' | 'drive';
    webViewLink?: string;
    metadata?: {
        size?: number;
        createdTime?: string;
        modifiedTime?: string;
        iconLink?: string;
    };
}

export interface PickerConfig {
    fileType: 'docs' | 'sheets' | 'drive';
    multiSelect?: boolean;
    connectionId: string;
    onSelect: (files: PickerFile[]) => void;
    onCancel?: () => void;
}

class GooglePickerService {
    private pickerApiLoaded = false;
    private oauthToken: string | null = null;
    private developerKey: string | null = null;

    /**
     * Initialize Google Picker API
     */
    async initialize(token: string, developerKey: string): Promise<void> {
        this.oauthToken = token;
        this.developerKey = developerKey;

        // Step 1: Load gapi if not loaded
        if (!window.gapi) {
            await new Promise<void>((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    if (window.gapi && window.gapi.load) {
                        resolve();
                    } else {
                        setTimeout(() => {
                            if (window.gapi && window.gapi.load) {
                                resolve();
                            } else {
                                reject(new Error('Google API failed to initialize'));
                            }
                        }, 500);
                    }
                };
                script.onerror = () => reject(new Error('Failed to load Google API'));
                document.head.appendChild(script);
            });
        }

        // Step 2: Load picker library if not already loaded
        if (!this.pickerApiLoaded) {
            await new Promise<void>((resolve, reject) => {
                if (window.gapi && window.gapi.load) {
                    window.gapi.load('picker', {
                        callback: () => {
                            this.pickerApiLoaded = true;
                            resolve();
                        },
                        onerror: () => {
                            reject(new Error('Failed to load Google Picker API'));
                        }
                    });
                } else {
                    reject(new Error('Google API not loaded'));
                }
            });
        }
    }

    /**
     * Open Google Picker with specified configuration
     */
    openPicker(config: PickerConfig): void {
        if (!this.pickerApiLoaded) {
            console.error('Google Picker API not loaded');
            return;
        }

        if (!this.oauthToken) {
            console.error('OAuth token not set');
            return;
        }

        if (!window.google || !window.google.picker) {
            console.error('Google Picker not available');
            return;
        }

        try {
            // Create picker builder
            const picker = new window.google.picker.PickerBuilder();

            // Configure view based on file type
            let view;
            switch (config.fileType) {
                case 'docs':
                    view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
                    view.setMimeTypes('application/vnd.google-apps.document');
                    break;
                case 'sheets':
                    view = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS);
                    view.setMimeTypes('application/vnd.google-apps.spreadsheet');
                    break;
                case 'drive':
                default:
                    // Use DOCS view for drive to show all files
                    view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
                    break;
            }

            // Build and show picker
            picker
                .setOAuthToken(this.oauthToken)
                .addView(view)
                .setCallback((data: any) => {
                    this.handlePickerCallback(data, config);
                })
                .setTitle(`Select ${config.fileType === 'docs' ? 'Document' : config.fileType === 'sheets' ? 'Spreadsheet' : 'File'}`)
                .enableFeature(window.google.picker.Feature.NAV_HIDDEN);

            if (config.multiSelect) {
                picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
            }

            if (this.developerKey) {
                picker.setDeveloperKey(this.developerKey);
            }

            // Build and show the picker
            const pickerInstance = picker.build();
            pickerInstance.setVisible(true);
        } catch (error) {
            console.error('Error opening Google Picker:', error);
            throw error;
        }
    }

    /**
     * Handle picker callback
     */
    private handlePickerCallback(data: any, config: PickerConfig): void {
        console.log('Picker callback received:', data);
        
        if (!data || !data.action) {
            console.error('Invalid picker callback data:', data);
            return;
        }

        if (data.action === window.google.picker.Action.PICKED) {
            if (!data.docs || !Array.isArray(data.docs) || data.docs.length === 0) {
                console.error('No files selected in picker callback');
                return;
            }

            const selectedFiles: PickerFile[] = data.docs.map((doc: any) => ({
                fileId: doc.id,
                fileName: doc.name || 'Untitled',
                mimeType: doc.mimeType || 'application/vnd.google-apps.file',
                fileType: this.determineFileType(doc.mimeType || ''),
                webViewLink: doc.url || doc.alternateLink,
                metadata: {
                    size: doc.sizeBytes,
                    createdTime: doc.lastEditedUtc ? new Date(doc.lastEditedUtc).toISOString() : undefined,
                    iconLink: doc.iconUrl
                }
            }));

            console.log('Selected files:', selectedFiles);

            // Cache selected files
            this.cacheSelectedFiles(config.connectionId, selectedFiles)
                .then(() => {
                    console.log('Files cached successfully');
                    config.onSelect(selectedFiles);
                })
                .catch((error) => {
                    console.error('Failed to cache selected files:', error);
                    // Still proceed with selection even if caching fails
                    config.onSelect(selectedFiles);
                });
        } else if (data.action === window.google.picker.Action.CANCEL) {
            console.log('Picker cancelled by user');
            config.onCancel?.();
        } else {
            console.warn('Unknown picker action:', data.action);
        }
    }

    /**
     * Determine file type from MIME type
     */
    private determineFileType(mimeType: string): 'docs' | 'sheets' | 'drive' {
        if (mimeType.includes('document')) return 'docs';
        if (mimeType.includes('spreadsheet')) return 'sheets';
        return 'drive';
    }

    /**
     * Cache selected files on backend
     */
    async cacheSelectedFiles(connectionId: string, files: PickerFile[]): Promise<void> {
        try {
            await api.post('/google/file-access/cache', {
                connectionId,
                files
            });
        } catch (error) {
            console.error('Failed to cache files:', error);
            throw error;
        }
    }

    /**
     * Get accessible files from cache
     */
    async getAccessibleFiles(
        connectionId: string,
        fileType?: 'docs' | 'sheets' | 'drive'
    ): Promise<PickerFile[]> {
        try {
            const params = new URLSearchParams({ connectionId });
            if (fileType) params.append('fileType', fileType);

            const response = await api.get(`/google/file-access?${params.toString()}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to get accessible files:', error);
            return [];
        }
    }

    /**
     * Check if user has access to a file
     */
    async checkFileAccess(fileId: string): Promise<boolean> {
        try {
            const response = await api.get(`/google/file-access/check/${fileId}`);
            return response.data.data?.hasAccess || false;
        } catch (error) {
            console.error('Failed to check file access:', error);
            return false;
        }
    }

    /**
     * Load Google Picker API script (static method)
     */
    static async loadPickerApi(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.gapi && window.gapi.load) {
                resolve();
                return;
            }

            // Load gapi script
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                // Wait for gapi to be fully initialized
                if (window.gapi && window.gapi.load) {
                    resolve();
                } else {
                    // Retry after a short delay
                    setTimeout(() => {
                        if (window.gapi && window.gapi.load) {
                            resolve();
                        } else {
                            reject(new Error('Google API failed to initialize'));
                        }
                    }, 500);
                }
            };
            script.onerror = () => reject(new Error('Failed to load Google Picker API'));
            document.head.appendChild(script);
        });
    }
}

// Extend Window interface for TypeScript
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

export const googlePickerService = new GooglePickerService();
export { GooglePickerService };
export default googlePickerService;

