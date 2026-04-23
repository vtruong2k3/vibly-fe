import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type { SystemSetting } from "@/types/admin.types";

export interface UpdateSettingDto {
    key: string;
    value: string;
    type?: string;
    description?: string;
}

export class AdminSettingsService {
    static async getSettings(): Promise<SystemSetting[]> {
        const { data } = await adminApiClient.get<{ success: boolean; data: SystemSetting[] }>(ADMIN_ENDPOINTS.settings.base);
        return data.data;
    }

    static async updateSettings(settings: UpdateSettingDto[]): Promise<SystemSetting[]> {
        const { data } = await adminApiClient.patch<{ success: boolean; data: SystemSetting[] }>(ADMIN_ENDPOINTS.settings.base, { settings });
        return data.data;
    }
}
