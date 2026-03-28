export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: string | FormData | Blob;
}
export declare function request<T>(url: string, options?: RequestOptions): Promise<T | undefined>;
