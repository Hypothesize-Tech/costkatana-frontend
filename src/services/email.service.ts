import { apiClient } from "../config/api";

export interface EmailData {
  email: string;
  isPrimary: boolean;
  verified: boolean;
  addedAt: string;
}

export class EmailManagementService {
  /**
   * Get all user emails (primary + secondary)
   */
  static async getEmails(): Promise<EmailData[]> {
    try {
      const response = await apiClient.get("/user/emails");
      return response.data.data.emails;
    } catch (error) {
      console.error("Error fetching emails:", error);
      throw error;
    }
  }

  /**
   * Add a secondary email
   */
  static async addSecondaryEmail(email: string): Promise<{ email: string; verified: boolean }> {
    try {
      const response = await apiClient.post("/user/emails/secondary", { email });
      return response.data.data;
    } catch (error: any) {
      console.error("Error adding secondary email:", error);
      throw new Error(error.response?.data?.message || "Failed to add email");
    }
  }

  /**
   * Remove a secondary email
   */
  static async removeSecondaryEmail(email: string): Promise<void> {
    try {
      await apiClient.delete(`/user/emails/secondary/${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error("Error removing secondary email:", error);
      throw new Error(error.response?.data?.message || "Failed to remove email");
    }
  }

  /**
   * Set a verified secondary email as primary (swaps with current primary)
   */
  static async setPrimaryEmail(email: string): Promise<{ primaryEmail: string }> {
    try {
      const response = await apiClient.put("/user/emails/primary", { email });
      return response.data.data;
    } catch (error: any) {
      console.error("Error setting primary email:", error);
      throw new Error(error.response?.data?.message || "Failed to set primary email");
    }
  }

  /**
   * Resend verification email for a specific email address
   */
  static async resendVerification(email: string): Promise<void> {
    try {
      await apiClient.post(`/user/emails/${encodeURIComponent(email)}/resend-verification`);
    } catch (error: any) {
      console.error("Error resending verification:", error);
      throw new Error(error.response?.data?.message || "Failed to resend verification email");
    }
  }
}

export const emailService = EmailManagementService;

