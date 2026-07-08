import {useCallback, useEffect, useState} from "react";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";

type UseCmsBlocksResult = {
    blocks: CmsBlock[];
    loading: boolean;
    error: unknown;
    refetch: () => Promise<void>;
};

export function useCmsBlocks(): UseCmsBlocksResult {
    const [blocks, setBlocks] = useState<CmsBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get<{data: CmsBlock[]}>("/api/eCommerce/cmsBlock/public");
            setBlocks(res.data.data ?? []);
        } catch (err) {
            setError(err);
            setBlocks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refetch();
    }, [refetch]);

    return {blocks, loading, error, refetch};
}
