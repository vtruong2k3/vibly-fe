import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type { AdminKeywordListItem, ReportSeverity } from "@/types/admin.types";

const adminModerationService = {
    listKeywords: async (): Promise<AdminKeywordListItem[]> => {
        const { data } = await adminApiClient.get<{ success: boolean; data: AdminKeywordListItem[] }>(
            ADMIN_ENDPOINTS.moderation.keywords
        );
        return data.data;
    },

    addKeyword: async (keyword: string, severity: ReportSeverity): Promise<AdminKeywordListItem> => {
        const { data } = await adminApiClient.post<{ success: boolean; data: AdminKeywordListItem }>(
            ADMIN_ENDPOINTS.moderation.keywords,
            { keyword, severity }
        );
        return data.data;
    },

    removeKeyword: async (id: string): Promise<void> => {
        await adminApiClient.delete(ADMIN_ENDPOINTS.moderation.removeKeyword(id));
    },
};

export default adminModerationService;
