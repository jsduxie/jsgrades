import type { APIResponse } from '@/types';

export interface RequestOptions {
    method?: string;
    token?: string;
    body?: unknown;
    headers?: Record<string, string>;
    onUnauthorized?: () => void;
}

export interface HttpError extends Error {
    status?: number;
    body?: unknown;
}

function createHttpError(
    message: string,
    status?: number,
    body?: unknown
): HttpError {
    const error: HttpError = new Error(message);
    if (status !== undefined) error.status = status;
    if (body !== undefined) error.body = body;
    return error;
}

export async function request<T>(
    path: string,
    {
        method = 'GET',
        token,
        body,
        headers = {},
        onUnauthorized,
    }: RequestOptions = {}
): Promise<APIResponse<T>> {
    const init: RequestInit = {
        method,
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const res = await fetch(path, init);
    let json: APIResponse<T> | undefined;
    try {
        json = (await res.json()) as APIResponse<T>;
    } catch {
        json = undefined;
    }

    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            if (onUnauthorized) {
                try {
                    onUnauthorized();
                } catch {
                    // ignore callback errors
                }
            } else if (typeof window !== 'undefined' && window?.location) {
                try {
                    window.location.assign('/home');
                } catch {
                    // ignore redirect errors
                }
            }
        }

        const message = json?.message || res.statusText || 'Request failed';
        throw createHttpError(message, res.status, json);
    }

    if (!json) {
        return { status: 'success', message: 'ok' } as APIResponse<T>;
    }

    return json;
}
