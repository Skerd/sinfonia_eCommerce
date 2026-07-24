/** Resolves a Media id (or preformed URL) for use in img src (Vite proxies /api to Maestro). */
export function resolveShopMediaUrl(value: string | undefined | null): string | undefined {
    if (!value) {
        return undefined;
    }
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/api/")) {
        return value;
    }
    if (value.startsWith("/")) {
        return value;
    }
    return `/api/auxiliary/media/${value}`;
}
