import {useCallback, useEffect, useRef, useState, type RefObject} from "react";
import {toast} from "sonner";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type {
    CatalogCategory,
    CatalogProduct,
    CatalogVariant,
} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";

type Args = {
    configId: string | undefined;
    session: PosSession | null;
    config: PosConfig | null;
    barcodeRef: RefObject<HTMLInputElement | null>;
    resolveLanguageKey: (key: string) => unknown;
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
    const [categories, setCategories] = useState<CatalogCategory[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [barcode, setBarcode] = useState("");
    const [variantProduct, setVariantProduct] = useState<CatalogProduct | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadCategories = useCallback(async () => {
        try {
            const res = await apiClient.post<{data?: {_id?: string; value?: string; label?: string; name?: string}[]}>(
                "/api/eCommerce/category/select",
                {page: 1, limit: 200},
            );
            const rows = res.data.data ?? [];
            setCategories(
                rows
                    .map((r) => ({
                        _id: String(r.value ?? r._id ?? ""),
                        name: String(r.label ?? r.name ?? ""),
                    }))
                    .filter((c) => c._id && c.name),
            );
        } catch {
            setCategories([]);
        }
    }, []);

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
        void loadCategories();
        void loadCatalog({});
    }, [session?._id, loadCategories, loadCatalog]);

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
