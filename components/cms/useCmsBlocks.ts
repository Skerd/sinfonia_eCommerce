import {useCallback, useState} from "react";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import useHttpRequest, {type HttpError, type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";

const PUBLIC_BLOCKS_REQUEST: HttpRequest = {method: "GET", url: "/api/eCommerce/cmsBlock/public"};

type UseCmsBlocksResult = {
    blocks: CmsBlock[];
    loading: boolean;
    error: HttpError | null;
    refetch: () => void;
};

export function useCmsBlocks(): UseCmsBlocksResult {
    const [fetchCount, setFetchCount] = useState(1);
    const {data, loading, error} = useHttpRequest<{data: CmsBlock[]}>(PUBLIC_BLOCKS_REQUEST, {}, fetchCount);
    const refetch = useCallback(() => setFetchCount((count) => count + 1), []);

    return {blocks: error ? [] : data?.data ?? [], loading, error, refetch};
}
