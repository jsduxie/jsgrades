import { request } from '@/lib/client/http/request';
import type { APIResponse } from '@/types/api';
import type {
    NewQualification,
    Qualification,
    QualificationLevel,
} from '@/types/qualification';

export interface WithAuth {
    token: string;
    onUnauthorized?: () => void;
}

export async function fetchQualifications(
    userId: string,
    auth: WithAuth
): Promise<APIResponse<Qualification[]>> {
    const { token, onUnauthorized } = auth;
    return request<Qualification[]>(
        `/api/qualifications?userId=${encodeURIComponent(userId)}`,
        {
            token,
            onUnauthorized,
        }
    );
}

export async function fetchQualificationLevels(
    auth: WithAuth
): Promise<APIResponse<QualificationLevel[]>> {
    const { token, onUnauthorized } = auth;
    return request<QualificationLevel[]>(`/api/qualification-levels`, {
        token,
        onUnauthorized,
    });
}

export async function createQualification(
    input: NewQualification,
    auth: WithAuth
): Promise<APIResponse<Qualification>> {
    const { token, onUnauthorized } = auth;
    return request<Qualification>(`/api/qualifications`, {
        method: 'POST',
        token,
        body: input,
        onUnauthorized,
    });
}

export async function updateQualification(
    id: string,
    updates: Partial<Qualification>,
    auth: WithAuth
): Promise<APIResponse<Qualification>> {
    const { token, onUnauthorized } = auth;
    return request<Qualification>(
        `/api/qualifications/${encodeURIComponent(id)}`,
        {
            method: 'PUT',
            token,
            body: updates,
            onUnauthorized,
        }
    );
}

export async function deleteQualification(
    id: string,
    auth: WithAuth
): Promise<APIResponse<null>> {
    const { token, onUnauthorized } = auth;
    return request<null>(`/api/qualifications/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        token,
        onUnauthorized,
    });
}
