import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";
import type { VerificationStatus } from "@/types/admin.types";

export interface MyVerificationStatus {
    id: string;
    status: VerificationStatus;
    legalName: string;
    idType: string;
    submittedAt: string;
    reviewNote?: string | null;
}

export interface SubmitKycDto {
    legalName: string;
    idType: string;
    /** Publicly accessible URL from media upload */
    frontDocUrl: string;
    backDocUrl?: string;
    selfieUrl: string;
}

const verificationService = {
    /** Fetch the current user's latest verification request */
    getMyStatus: async (): Promise<MyVerificationStatus | null> => {
        const { data } = await apiClient.get<MyVerificationStatus | null>(
            ENDPOINTS.verification.myStatus,
        );
        return data;
    },

    /** Submit a new KYC request */
    submit: async (dto: SubmitKycDto): Promise<MyVerificationStatus> => {
        const { data } = await apiClient.post<MyVerificationStatus>(
            ENDPOINTS.verification.submit,
            dto,
        );
        return data;
    },
};

export default verificationService;
