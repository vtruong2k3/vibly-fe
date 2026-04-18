import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type {
  BeAnalyticsOverview,
  AnalyticsOverview,
  AnalyticsTrend,
  AnalyticsContentTrend,
  AnalyticsReportBreakdown,
} from "@/types/admin.types";
import { mapAnalyticsOverview } from "@/types/admin.types";

// All admin API responses are wrapped in: { success: boolean, data: T }
type ApiEnvelope<T> = { success: boolean; data: T };

const adminAnalyticsService = {
  /** Dashboard KPIs — mapped to normalised AnalyticsOverview shape */
  getOverview: async (from?: string, to?: string): Promise<AnalyticsOverview> => {
    const { data } = await adminApiClient.get<ApiEnvelope<BeAnalyticsOverview>>(
      ADMIN_ENDPOINTS.analytics.overview,
      { params: { from, to } }
    );
    return mapAnalyticsOverview(data.data); // unwrap envelope
  },

  /** Daily registration trend — date range */
  getRegistrationTrend: async (from?: string, to?: string): Promise<AnalyticsTrend[]> => {
    const { data } = await adminApiClient.get<ApiEnvelope<AnalyticsTrend[]>>(
      ADMIN_ENDPOINTS.analytics.registrations,
      { params: { from, to } }
    );
    return data.data; // unwrap envelope
  },

  /** Daily posts + comments trend — date range */
  getContentTrend: async (from?: string, to?: string): Promise<AnalyticsContentTrend> => {
    const { data } = await adminApiClient.get<ApiEnvelope<AnalyticsContentTrend>>(
      ADMIN_ENDPOINTS.analytics.content,
      { params: { from, to } }
    );
    return data.data; // unwrap envelope
  },

  /** Report breakdown by reason code + status */
  getReportsBreakdown: async (from?: string, to?: string): Promise<AnalyticsReportBreakdown[]> => {
    const { data } = await adminApiClient.get<ApiEnvelope<AnalyticsReportBreakdown[]>>(
      ADMIN_ENDPOINTS.analytics.reportsBreakdown,
      { params: { from, to } }
    );
    return data.data; // unwrap envelope
  },
};

export default adminAnalyticsService;
