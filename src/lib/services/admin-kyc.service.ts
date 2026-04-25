import adminApiClient from "@/lib/api/admin-axios";
import { ADMIN_ENDPOINTS } from "@/lib/api/admin-constants";
import type {
    CursorPaginatedResponse,
    KycRequest,
    VerificationStatus,
} from "@/types/admin.types";

export interface KycListParams {
    status?: VerificationStatus;
    cursor?: string;
    limit?: number;
}

export interface ReviewDto {
    decision: "APPROVED" | "REJECTED" | "REVOKED";
    note?: string;
}

const adminKycService = {
    list: async (params?: KycListParams): Promise<CursorPaginatedResponse<KycRequest>> => {
        const { data } = await adminApiClient.get<CursorPaginatedResponse<KycRequest>>(
            ADMIN_ENDPOINTS.kyc.list,
            { params },
        );
        return data;
    },

    byId: async (id: string): Promise<KycRequest> => {
        const { data } = await adminApiClient.get<KycRequest>(ADMIN_ENDPOINTS.kyc.byId(id));
        return data;
    },

    review: async (id: string, dto: ReviewDto): Promise<void> => {
        await adminApiClient.patch(ADMIN_ENDPOINTS.kyc.review(id), dto);
    },

    toggleBadge: async (userId: string, grant: boolean): Promise<void> => {
        await adminApiClient.patch(ADMIN_ENDPOINTS.kyc.toggleBadge(userId), { grant });
    },
};

export default adminKycService;
