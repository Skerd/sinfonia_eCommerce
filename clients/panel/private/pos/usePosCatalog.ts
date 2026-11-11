import {useCallback, useEffect, useRef, useState, type RefObject} from "react";
import {toast} from "sonner";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {useInfiniteScroll} from "@coreModule/helpers/hooks/useInfiniteScroll.ts";
import type {
    CatalogCategory,
    CatalogProduct,
    CatalogVariant,
} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import {withServerReason} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

const CATEGORY_PAGE_SIZE = 40;
const PRODUCT_PAGE_SIZE = 60;
const CATEGORY_SELECT_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/category/select"};
const CATALOG_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/pos/catalog"};

type CategorySelectRow = {value?: string; label?: string; _id?: string; name?: string};
type CatalogResponse = {data: CatalogProduct[]; page: number; limit: number; total: number};
/** One page request: the body and its offset (a failed first page empties the list). */
type PageCall = {body: Record<string, unknown>; offset: number; count: number};
const EMPTY_CALL: PageCall = {body: {}, offset: 0, count: 0};

type Args = {
    configId: string | undefined;
    session: PosSession | null;
    config: PosConfig | null;
    barcodeRef: RefObject<HTMLInputElement | null>;
    resolveLanguageKey: ResolveLanguageKey;
    onAddCartLine: (product: CatalogProduct, qty: number, variant?: CatalogVariant) => void;
};

export function usePosCatalog({
    configId,
    session,
    config,
    barcodeRef,
    resolveLanguageKey,
    onAddCartLine,
}: Args) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);

    const [catalogPage, setCatalogPage] = useState<{data: CatalogProduct[]; total: number} | null>(null);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [categoryQuery, setCategoryQuery] = useState("");
    const [debouncedCategoryQuery, setDebouncedCategoryQuery] = useState("");
    const [categoryPage, setCategoryPage] = useState<{data: CatalogCategory[]; total: number} | null>(null);
    const categoryNameRef = useRef("");
    categoryNameRef.current = debouncedCategoryQuery;
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [barcode, setBarcode] = useState("");
    const [variantProduct, setVariantProduct] = useState<CatalogProduct | null>(null);

    const catalogSearchRef = useRef("");
    const catalogCategoryRef = useRef<string | null>(null);
    catalogSearchRef.current = debouncedSearch;
    catalogCategoryRef.current = categoryId;

    // A newer page request aborts the one still running (useHttpRequest), so only the latest lands.
    const [categoryCall, setCategoryCall] = useState<PageCall>(EMPTY_CALL);
    const {loading: categoriesLoading} = useHttpRequest<{data?: CategorySelectRow[]; total?: number}>(
        CATEGORY_SELECT_REQUEST,
        categoryCall.body,
        categoryCall.count,
        true,
        {
            success: (response) => {
                const rows = (response.data ?? [])
                    .map((row) => ({
                        _id: String(row.value ?? row._id ?? ""),
                        name: String(row.label ?? row.name ?? ""),
                    }))
                    .filter((row) => row._id && row.name);
                setCategoryPage({data: rows, total: response.total ?? rows.length});
            },
            error: (requestError) => {
                toast.error(withServerReason(String(resolveLanguageKey("errors.categoriesFailed") ?? "errors.categoriesFailed"), requestError));
                if (categoryCall.offset === 0) setCategoryPage({data: [], total: 0});
            },
        },
    );
    const onCategoryFilterChange = useCallback((filter: {offset: number; limit: number}) => {
        const name = categoryNameRef.current.trim();
        const page = Math.floor(filter.offset / filter.limit) + 1;
        setCategoryCall((current) => ({
            body: {page, limit: filter.limit, ...(name ? {name} : {})},
            offset: filter.offset,
            count: current.count + 1,
        }));
    }, []);

    const {
        accumulatedItems: categories,
        hasMoreData: categoriesHasMore,
        canLoadMore: categoriesCanLoadMore,
        loadMore: loadMoreCategories,
        handleReset: resetCategories,
    } = useInfiniteScroll({
        data: categoryPage,
        loading: categoriesLoading,
        onFilterChange: onCategoryFilterChange,
        limit: CATEGORY_PAGE_SIZE,
        enabled: !!session?._id,
        getId: (category) => category._id,
    });

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedCategoryQuery(categoryQuery.trim()), 250);
        return () => window.clearTimeout(timer);
    }, [categoryQuery]);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
        return () => window.clearTimeout(timer);
    }, [search]);

    const categoryLoadKeyRef = useRef<string | null>(null);
    useEffect(() => {
        if (!session?._id) return;
        const key = `${session._id}|${debouncedCategoryQuery}`;
        if (categoryLoadKeyRef.current === null) {
            categoryLoadKeyRef.current = key;
            return;
        }
        if (categoryLoadKeyRef.current === key) return;
        categoryLoadKeyRef.current = key;
        resetCategories();
    }, [session?._id, debouncedCategoryQuery, resetCategories]);

    const [catalogCall, setCatalogCall] = useState<PageCall>(EMPTY_CALL);
    const {loading: catalogLoading} = useHttpRequest<CatalogResponse>(CATALOG_REQUEST, catalogCall.body, catalogCall.count, true, {
        success: (response) => setCatalogPage({data: response.data ?? [], total: response.total ?? 0}),
        error: (requestError) => {
            toast.error(withServerReason(String(resolveLanguageKey("errors.catalogFailed") ?? "errors.catalogFailed"), requestError));
            if (catalogCall.offset === 0) setCatalogPage({data: [], total: 0});
        },
    });
    const onCatalogFilterChange = useCallback(
        (filter: {offset: number; limit: number}) => {
            const page = Math.floor(filter.offset / filter.limit) + 1;
            const searchValue = catalogSearchRef.current.trim();
            const category = catalogCategoryRef.current;
            setCatalogCall((current) => ({
                body: {
                    search: searchValue || undefined,
                    categoryId: category || undefined,
                    configId: configId || undefined,
                    page,
                    limit: filter.limit,
                },
                offset: filter.offset,
                count: current.count + 1,
            }));
        },
        [configId],
    );

    const {
        accumulatedItems: catalog,
        hasMoreData: catalogHasMore,
        canLoadMore: catalogCanLoadMore,
        loadMore: loadMoreCatalog,
        handleReset: resetCatalog,
    } = useInfiniteScroll({
        data: catalogPage,
        loading: catalogLoading,
        onFilterChange: onCatalogFilterChange,
        limit: PRODUCT_PAGE_SIZE,
        enabled: !!session?._id,
        getId: (product) => product._id,
    });

    const catalogLoadKeyRef = useRef<string | null>(null);
    useEffect(() => {
        if (!session?._id) return;
        const key = `${session._id}|${debouncedSearch}|${categoryId ?? ""}|${configId ?? ""}`;
        if (catalogLoadKeyRef.current === null) {
            catalogLoadKeyRef.current = key;
            return;
        }
        if (catalogLoadKeyRef.current === key) return;
        catalogLoadKeyRef.current = key;
        resetCatalog();
    }, [session?._id, debouncedSearch, categoryId, configId, resetCatalog]);

    useEffect(() => {
        if (!session) return;
        const t = window.setTimeout(() => barcodeRef.current?.focus(), 120);
        return () => window.clearTimeout(t);
    }, [session?._id]);

    const pickProduct = (product: CatalogProduct, qty = 1) => {
        const variants = product.variants ?? [];
        if (product.matchedVariantId) {
            const matched = variants.find((v) => v._id === product.matchedVariantId);
            if (matched) {
                onAddCartLine(product, qty, matched);
                return;
            }
        }
        if (product.hasVariants && variants.length > 1) {
            setVariantProduct(product);
            return;
        }
        if (product.hasVariants && variants.length === 1) {
            onAddCartLine(product, qty, variants[0]);
            return;
        }
        const allowOversell = !!config?.allowOversell;
        if (product.trackInventory && product.stockQty != null && !allowOversell && product.stockQty <= 0) {
            toast.error(rk("errors.outOfStock"));
            return;
        }
        onAddCartLine(product, qty);
    };

    // A scan looks the code up and adds the first match; the field clears for the next scan either way.
    const [barcodeCall, setBarcodeCall] = useState<{body: Record<string, unknown>; count: number}>({body: {}, count: 0});
    useHttpRequest<{data: CatalogProduct[]}>(CATALOG_REQUEST, barcodeCall.body, barcodeCall.count, true, {
        success: (response) => {
            const rows = response.data ?? [];
            if (!rows.length) toast.error(rk("errors.barcodeNotFound"));
            else pickProduct(rows[0], 1);
            barcodeRef.current?.focus();
        },
        error: (requestError) => {
            toast.error(withServerReason(rk("errors.barcodeNotFound"), requestError));
            barcodeRef.current?.focus();
        },
    });
    const handleBarcodeEnter = () => {
        const code = barcode.trim();
        if (!code) return;
        setBarcodeCall((current) => ({body: {barcode: code, configId: configId || undefined, page: 1, limit: 5}, count: current.count + 1}));
        setBarcode("");
    };

    const focusBarcode = () => barcodeRef.current?.focus();

    return {
        catalog,
        catalogLoading,
        catalogHasMore,
        catalogCanLoadMore,
        loadMoreCatalog,
        categories,
        categoriesLoading,
        categoriesHasMore,
        categoriesCanLoadMore,
        loadMoreCategories,
        categoryQuery,
        setCategoryQuery,
        categoryId,
        setCategoryId,
        search,
        setSearch,
        barcode,
        setBarcode,
        barcodeRef,
        variantProduct,
        setVariantProduct,
        pickProduct,
        handleBarcodeEnter,
        focusBarcode,
    };
}
