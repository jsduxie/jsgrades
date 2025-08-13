export interface APIResponse<T = undefined> {
    status: string;
    message: string;
    data?: T;
}

export type Issue = {
    code: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    meta?: Record<string, unknown>;
};
