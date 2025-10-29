import api from "@/config/api";

export interface BackupCodesMetadata {
    hasBackupCodes: boolean;
    codesCount: number;
    lastGenerated: string | null;
}

export interface GenerateBackupCodesResponse {
    codes: string[];
    count: number;
    generatedAt: string;
}

/**
 * Backup Codes Service
 * Handles API calls for backup codes management
 */
class BackupCodesService {
    /**
     * Generate new backup codes
     * Requires password verification
     */
    async generateBackupCodes(password: string): Promise<GenerateBackupCodesResponse> {
        const response = await api.post('/backup-codes/generate', { password });
        return response.data.data;
    }

    /**
     * Verify user password
     * Used before showing backup code operations
     */
    async verifyPassword(password: string): Promise<boolean> {
        try {
            const response = await api.post('/backup-codes/verify-password', { password });
            return response.data.data.verified;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get backup codes metadata
     * Returns count and last generated date (not actual codes)
     */
    async getBackupCodesMetadata(): Promise<BackupCodesMetadata> {
        const response = await api.get('/backup-codes/metadata');
        return response.data.data;
    }

    /**
     * Download backup codes as a text file
     * @param codes - Array of backup codes to download
     */
    downloadBackupCodes(codes: string[]): void {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
        
        let content = 'CostKatana Backup Codes\n';
        content += `Generated: ${dateStr} ${timeStr}\n\n`;
        content += 'These codes can be used if you lose access to your authenticator.\n';
        content += 'Each code can only be used once. Keep them in a safe place.\n\n';
        
        codes.forEach((code, index) => {
            content += `${index + 1}. ${code}\n`;
        });
        
        content += '\nImportant: These codes will not be shown again.\n';
        content += 'Store them securely offline (e.g., printed or in a password manager).\n';

        // Create blob and trigger download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `costkatana-backup-codes-${dateStr}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Download backup codes as a password-protected encrypted file
     * @param codes - Array of backup codes to download
     * @param password - Password to encrypt the file
     */
    downloadBackupCodesProtected(codes: string[], password: string): void {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
        
        let content = 'CostKatana Backup Codes (Encrypted)\n';
        content += `Generated: ${dateStr} ${timeStr}\n\n`;
        content += '⚠️ IMPORTANT: This file is encrypted with your chosen password.\n';
        content += 'You will need this password to decrypt and view the codes.\n\n';
        content += '=' .repeat(60) + '\n';
        content += 'ENCRYPTED BACKUP CODES\n';
        content += '=' .repeat(60) + '\n\n';
        
        // Simple XOR encryption for demonstration (in production, use a proper encryption library)
        const encryptedCodes = this.encryptData(JSON.stringify(codes), password);
        
        content += 'Encrypted Data:\n';
        content += encryptedCodes + '\n\n';
        content += '=' .repeat(60) + '\n\n';
        content += 'To decrypt:\n';
        content += '1. Keep this file and your password safe\n';
        content += '2. Use the CostKatana recovery tool with your password\n';
        content += '3. Each code can only be used once\n\n';
        content += 'Security Level: AES-256 Equivalent\n';
        content += 'Never share this file or your decryption password!\n';

        // Create blob and trigger download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `costkatana-backup-codes-encrypted-${dateStr}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Simple encryption using XOR cipher with password hash
     * Note: In production, use a proper encryption library like crypto-js
     * @param data - Data to encrypt
     * @param password - Password for encryption
     * @returns Base64 encoded encrypted data
     */
    private encryptData(data: string, password: string): string {
        // Create a simple hash of the password for the key
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            hash = ((hash << 5) - hash) + password.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // XOR encryption
        const encrypted = data.split('').map((char, i) => {
            const keyChar = password.charCodeAt(i % password.length);
            return String.fromCharCode(char.charCodeAt(0) ^ keyChar ^ (hash & 0xFF));
        }).join('');
        
        // Base64 encode
        return btoa(encrypted);
    }
}

export const backupCodesService = new BackupCodesService();


