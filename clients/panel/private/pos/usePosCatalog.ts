import {useCallback, useEffect, useRef, useState, type RefObject} from "react";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {useInfiniteScroll} from "@coreModule/helpers/hooks/useInfiniteScroll.ts";
import type {
    CatalogCategory,
    CatalogProduct,
    CatalogVariant,
} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

const CATEGORY_PAGE_SIZE = 40;

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

    const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [categoryQuery, setCategoryQuery] = useState("");
    const [debouncedCategoryQuery, setDebouncedCategoryQuery] = useState("");
    const [categoryPage, setCategoryPage] = useState<{data: CatalogCategory[]; total: number} | null>(null);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const categoryNameRef = useRef("");
    const categoryRequestRef = useRef(0);
    categoryNameRef.current = debouncedCategoryQuery;
    const [search, setSearch] = useState("");
    const [barcode, setBarcode] = useState("");
    const [variantProduct, setVariantProduct] = useState<CatalogProduct | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onCategoryFilterChange = useCallback(
        (filter: {offset: number; limit: number}) => {
            const requestId = ++categoryRequestRef.current;
            const name = categoryNameRef.current.trim();
            const page = Math.floor(filter.offset / filter.limit) + 1;
            setCategoriesLoading(true);
            void apiClient
                .post<{data?: {value?: string; label?: string; _id?: string; name?: string}[]; total?: number}>(
                    "/api/eCommerce/category/select",
                    {page, limit: filter.limit, ...(name ? {name} : {})},
                )
                .then((res) => {
                    if (requestId !== categoryRequestRef.current) return;
                    const rows = (res.data.data ?? [])
                        .map((row) => ({
                            _id: String(row.value ?? row._id ?? ""),
                            name: String(row.label ?? row.name ?? ""),
                        }))
                        .filter((row) => row._id && row.name);
                    setCategoryPage({data: rows, total: res.data.total ?? rows.length});
                })
                .catch(() => {
                    if (requestId !== categoryRequestRef.current) return;
                    toast.error(String(resolveLanguageKey("errors.categoriesFailed") ?? "errors.categoriesFailed"));
                    if (filter.offset === 0) setCategoryPage({data: [], total: 0});
                })
                .finally(() => {
                    if (requestId === categoryRequestRef.current) setCategoriesLoading(false);
                });
        },
        [resolveLanguageKey],
    );

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

    const loadCatalog = useCallback(
        async (opts?: {search?: string; barcode?: string; categoryId?: string | null}) => {
            setCatalogLoading(true);
            try {
                const res = await apiClient.post<{data: CatalogProduct[]; page: number; limit: number; total: number}>(
                    "/api/eCommerce/pos/catalog",
                    {
                        search: opts?.search || undefined,
                        barcode: opts?.barcode || undefined,
                        categoryId: opts?.categoryId || undefined,
                        configId: configId || undefined,
                        page: 1,
                        limit: 60,
                    },
                );
                setCatalog(res.data.data ?? []);
            } catch {
                toast.error(String(resolveLanguageKey("errors.catalogFailed") ?? "errors.catalogFailed"));
                setCatalog([]);
            } finally {
                setCatalogLoading(false);
            }
        },
        [resolveLanguageKey, configId],
    );

    useEffect(() => {
        if (!session?._id) return;
        void loadCatalog({});
    }, [session?._id, loadCatalog]);

    useEffect(() => {
        if (!session) return;
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            void loadCatalog({
                search: search.trim() || undefined,
                categoryId,
            });
        }, 250);
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
    }, [search, categoryId, session?._id, loadCatalog]);

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

    const handleBarcodeEnter = async () => {
        const code = barcode.trim();
        if (!code) return;
        try {
            const res = await apiClient.post<{data: CatalogProduct[]}>("/api/eCommerce/pos/catalog", {
                barcode: code,
                configId: configId || undefined,
                page: 1,
                limit: 5,
            });
            const rows = res.data.data ?? [];
            if (!rows.length) {
                toast.error(rk("errors.barcodeNotFound"));
            } else {
                pickProduct(rows[0], 1);
            }
        } catch {
            toast.error(rk("errors.barcodeNotFound"));
        } finally {
            setBarcode("");
            barcodeRef.current?.focus();
        }
    };

    const focusBarcode = () => barcodeRef.current?.focus();

    return {
        catalog,
        catalogLoading,
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
