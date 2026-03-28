import keys from "./keys";

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: string | FormData | Blob;
}

export function request<T>(url: string, options?: RequestOptions): Promise<T | undefined> {
    return new Promise<T | undefined>(function (resolve: (value: T | undefined) => void): void {
        let method: string = 'GET';
        let headers: Record<string, string> = {};
        let body: string | FormData | Blob | undefined = undefined;

        if (typeof options !== 'undefined') {
            if (typeof options.method !== 'undefined') method = options.method;
            if (typeof options.headers !== 'undefined') headers = options.headers;
            if (typeof options.body !== 'undefined') body = options.body;
        }

        if (typeof globalThis.fetch !== 'undefined') {
            fetch(url, {
                method: method,
                headers: headers,
                body: body
            })
                .then(function (response: Response): Promise<void> {
                    if (!response.ok) {
                        resolve(undefined);
                        return Promise.resolve();
                    }

                    return response
                        .json()
                        .then(function (data: T): void {
                            resolve(data);
                        })
                        .catch(function (): void {
                            resolve(undefined);
                        });
                })
                .catch(function (): void {
                    resolve(undefined);
                });

            return;
        }

        if (typeof XMLHttpRequest !== "undefined") {
            const xhr: XMLHttpRequest = new XMLHttpRequest();

            xhr.open(method, url, true);

            const headerKeys: string[] = keys(headers);

            for (let i: number = 0; i < headerKeys.length; i++) {
                const headerKey: string = headerKeys[i];

                xhr.setRequestHeader(headerKey, headers[headerKey]);
            }

            xhr.onreadystatechange = function (): void {
                if (xhr.readyState !== 4) return;

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (_: unknown) {
                        resolve(undefined);
                    }
                } else {
                    resolve(undefined);
                }
            };

            xhr.onerror = function (): void {
                resolve(undefined);
            };

            xhr.send(body);

            return;
        }

        resolve(undefined);
    });
}
