import { apiClient } from "@/config/api";
import type {
  DecisionContext,
  DecisionListFilters,
  SavingsSummary,
} from "@/types/decision.types";

class DecisionsService {
  async getTop(): Promise<{ decision: DecisionContext | null }> {
    const response = await apiClient.get("/decisions/top");
    return response.data;
  }

  async list(filters: DecisionListFilters = {}): Promise<DecisionContext[]> {
    const response = await apiClient.get("/decisions", { params: filters });
    const raw = response.data;
    if (Array.isArray(raw?.decisions)) return raw.decisions;
    if (Array.isArray(raw)) return raw;
    return [];
  }

  async apply(
    id: string,
  ): Promise<{ success: boolean; appliedAt: string }> {
    const response = await apiClient.post(`/decisions/${id}/apply`);
    return response.data;
  }

  async dismiss(
    id: string,
    reason?: string,
  ): Promise<{ success: boolean }> {
    const response = await apiClient.post(`/decisions/${id}/dismiss`, {
      reason,
    });
    return response.data;
  }

  async snooze(
    id: string,
    durationMs = 7 * 24 * 60 * 60 * 1000,
  ): Promise<{ success: boolean; expiresAt: string }> {
    const response = await apiClient.post(`/decisions/${id}/snooze`, {
      durationMs,
    });
    return response.data;
  }

  async savingsSummary(sinceDays = 30): Promise<SavingsSummary> {
    const response = await apiClient.get("/decisions/savings-summary", {
      params: { sinceDays },
    });
    return response.data;
  }
}

export const decisionsService = new DecisionsService();
