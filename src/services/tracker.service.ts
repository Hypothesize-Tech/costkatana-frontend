import { apiClient } from "@/config/api";


class TrackerService {
  async syncHistoricalData(days: number = 30): Promise<{ message: string }> {
    const response = await apiClient.post("/tracker/sync", { days });
    return response.data;
  }
}

export const trackerService = new TrackerService();
