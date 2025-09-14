import { request } from '@/lib/client/http/request';
import type { APIResponse } from '@/types/api';

function mockFetchResponse<T>(res: {
    ok: boolean;
    status: number;
    statusText?: string;
    data?: T;
    message?: string;
}) {
    const body: APIResponse<T> = {
        status: res.ok ? 'success' : 'error',
        message: res.message ?? (res.ok ? 'ok' : 'error'),
        ...(res.data !== undefined ? { data: res.data } : {}),
    };

    return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText ?? '',
        json: async () => body,
    } as unknown as Response;
}

describe('request helper', () => {
    const fetchSpy = global.fetch as unknown as jest.Mock;

    beforeEach(() => {
        fetchSpy.mockReset();
    });

    it('returns parsed APIResponse on success', async () => {
        fetchSpy.mockResolvedValue(
            mockFetchResponse<{ foo: string }>({
                ok: true,
                status: 200,
                data: { foo: 'bar' },
            })
        );

        const res = await request<{ foo: string }>('/api/example', {
            method: 'GET',
            token: 'tkn',
        });

        expect(res.status).toBe('success');
        expect(res.data).toEqual({ foo: 'bar' });
        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/example',
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    Authorization: 'Bearer tkn',
                }),
            })
        );
    });

    it('throws HttpError with status and message on non-OK', async () => {
        fetchSpy.mockResolvedValue(
            mockFetchResponse<null>({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                message: 'boom',
            })
        );

        await expect(request<null>('/api/error')).rejects.toMatchObject({
            message: 'boom',
            status: 500,
        });
    });

    it('invokes onUnauthorized callback when 401/403', async () => {
        fetchSpy.mockResolvedValue(
            mockFetchResponse<null>({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                message: 'auth',
            })
        );
        const cb = jest.fn();
        await expect(
            request<null>('/api/secure', { onUnauthorized: cb })
        ).rejects.toMatchObject({ status: 401 });
        expect(cb).toHaveBeenCalledTimes(1);
    });

    it('redirects to /home on unauthorized when no callback and window exists', async () => {
        const winLike = {
            location: { assign: jest.fn() },
        } as unknown as Window & typeof globalThis;
        (
            globalThis as unknown as { window?: Window & typeof globalThis }
        ).window = winLike;

        fetchSpy.mockResolvedValue(
            mockFetchResponse<null>({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                message: 'nope',
            })
        );

        await expect(request<null>('/api/secure')).rejects.toMatchObject({
            status: 403,
        });
        expect(winLike.location.assign).toHaveBeenCalledWith('/home');

        // cleanup
        delete (globalThis as unknown as { window?: unknown }).window;
    });

    it('returns default success response when ok but JSON is invalid', async () => {
        const fakeRes = {
            ok: true,
            status: 204,
            statusText: 'No Content',
            json: async () => {
                throw new Error('invalid json');
            },
        } as unknown as Response;
        fetchSpy.mockResolvedValue(fakeRes);

        const res = await request<null>('/api/no-content');
        expect(res.status).toBe('success');
        expect(res.message).toBe('ok');
        expect(res.data).toBeUndefined();
    });

    it('uses statusText when error and no JSON body is available', async () => {
        const fakeRes = {
            ok: false,
            status: 502,
            statusText: 'Bad Gateway',
            json: async () => {
                throw new Error('invalid json');
            },
        } as unknown as Response;
        fetchSpy.mockResolvedValue(fakeRes);

        await expect(request<null>('/api/bad')).rejects.toMatchObject({
            message: 'Bad Gateway',
            status: 502,
        });
    });

    it('sets Content-Type only when body is provided and omits Authorization when token undefined', async () => {
        fetchSpy.mockResolvedValue(
            mockFetchResponse<{ ok: boolean }>({
                ok: true,
                status: 200,
                data: { ok: true },
            })
        );

        await request<{ ok: boolean }>('/api/nobody', { method: 'POST' });

        const firstCall = fetchSpy.mock.calls[0][1] as RequestInit;
        const headers1 = (firstCall.headers ?? {}) as Record<string, string>;
        expect(Object.keys(headers1)).not.toContain('Authorization');
        expect(Object.keys(headers1)).not.toContain('Content-Type');

        await request<{ ok: boolean }>('/api/withbody', {
            method: 'POST',
            token: 'tkn',
            body: { a: 1 },
        });
        const secondCall = fetchSpy.mock.calls[1][1] as RequestInit;
        const headers2 = (secondCall.headers ?? {}) as Record<string, string>;
        expect(headers2['Authorization']).toBe('Bearer tkn');
        expect(headers2['Content-Type']).toBe('application/json');
        expect(secondCall.body).toBe(JSON.stringify({ a: 1 }));
    });

    it('propagates APIResponse body into HttpError for non-OK with JSON', async () => {
        const body: APIResponse<{ reason: string }> = {
            status: 'error',
            message: 'Not allowed',
            data: { reason: 'policy' },
        };
        const res = {
            ok: false,
            status: 403,
            statusText: 'Forbidden',
            json: async () => body,
        } as unknown as Response;
        fetchSpy.mockResolvedValue(res);

        try {
            await request<null>('/api/forbidden');
            throw new Error('expected to throw');
        } catch (err) {
            const e = err as {
                status?: number;
                body?: unknown;
                message: string;
            };
            expect(e.status).toBe(403);
            expect(e.message).toBe('Not allowed');
            expect(e.body).toEqual(body);
        }
    });

    it('continues throwing HttpError even if onUnauthorized callback throws', async () => {
        const cb = jest.fn(() => {
            throw new Error('cb failed');
        });
        fetchSpy.mockResolvedValue(
            mockFetchResponse<null>({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                message: 'nope',
            })
        );
        await expect(
            request<null>('/api/secure', { onUnauthorized: cb })
        ).rejects.toMatchObject({ status: 401 });
        expect(cb).toHaveBeenCalledTimes(1);
    });
});
