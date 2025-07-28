export interface APIResponse<T = undefined> {
    status: string;
    message: string;
    data?: T;
}
