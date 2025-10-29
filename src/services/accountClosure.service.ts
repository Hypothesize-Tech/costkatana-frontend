import { apiClient } from "../config/api";
import { AccountClosureStatus } from "../types/auth.types";

export class AccountClosureService {
  /**
   * Initiate account closure with password confirmation
   */
  static async initiateAccountClosure(password: string, reason?: string): Promise<{
    requiresEmailConfirmation: boolean;
  }> {
    const response = await apiClient.post("/user/account/closure/initiate", {
      password,
      reason,
    });
    return response.data.data;
  }

  /**
   * Confirm account closure via email token
   */
  static async confirmAccountClosure(token: string): Promise<{
    success: boolean;
    cooldownEndsAt: string;
  }> {
    const response = await apiClient.post(`/user/account/closure/confirm/${token}`);
    return response.data.data;
  }

  /**
   * Cancel account closure
   */
  static async cancelAccountClosure(): Promise<void> {
    await apiClient.post("/user/account/closure/cancel");
  }

  /**
   * Get current account closure status
   */
  static async getAccountClosureStatus(): Promise<AccountClosureStatus> {
    const response = await apiClient.get("/user/account/closure/status");
    return response.data.data;
  }

  /**
   * Reactivate account during grace period
   */
  static async reactivateAccount(): Promise<void> {
    await apiClient.post("/user/account/reactivate");
  }
}

export const accountClosureService = AccountClosureService;

