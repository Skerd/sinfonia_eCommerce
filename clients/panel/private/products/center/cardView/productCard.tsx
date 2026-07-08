import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconBarcode, IconPhoto} from "@tabler/icons-react";
import ProductSheetView from "@eCommerceModule/clients/panel/private/products/center/sheetView/productSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

const LIST_BASE = "/eCommerce/products";

function productEditPath(product: Product) {
    const params = new URLSearchParams();
    params.set("productId", product._id);
    if (product.title) params.set("productTitle", encodeURIComponent(product.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function formatPrice(product: Product): string | undefined {
    if (product.price == null) return undefined;
    const c = product.currency;
    const prefix = c?.symbol?.trim() || c?.abbreviation?.trim();
    const n = product.price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return prefix ? `${prefix} ${n}` : n;
}

type ProductCardProps = WithLanguageType & {
    product: Product;
    onDelete?: (deleted?: Product, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ProductCard({
    product: productProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ProductCardProps) {
    const [action, setAction] = useState<string>("");
    const [product, setProduct] = useState<Product>(productProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(product, data);
        } else {
            setProduct({...product, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setProduct({
                ...product,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("products");

    useEffect(() => {
        setProduct(productProp);
    }, [productProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && product.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const priceStr = formatPrice(product);

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group p-0 h-full relative overflow-hidden transition-all duration-300",
                        "hover:shadow-xl hover:cursor-pointer",
                        "border border-border/60 shadow-sm gap-2 pb-2",
                    )}
                    onClick={() => setAction("view")}
                >
                    {/* ── Image ─────────────────────────────────────────── */}
                    <div className="relative h-40 overflow-hidden bg-muted">
                        {product.mainImage ? (
                            <img
                                src={`/api/auxiliary/media/${product.mainImage._id}`}
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                <IconPhoto className="w-14 h-14 text-muted-foreground/15" />
                            </div>
                        )}

                        <div className="absolute inset-0 transform-gpu bg-linear-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

                        {!hideActions && (
                            <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    accessModel={"products"}
                                    deletedData={product}
                                    onAction={(a: string) => setAction(a)}
                                    editPath={productEditPath(product)}
                                />
                            </div>
                        )}

                        {/* status badge */}
                        {read?.status && product.status && (
                            <div className="absolute bottom-2 left-2">
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20 shadow-sm",
                                        product.status === "active"
                                            ? "bg-emerald-500/85 text-white"
                                            : product.status === "draft"
                                              ? "bg-amber-400/85 text-amber-950"
                                              : "bg-muted-foreground/70 text-white",
                                    )}
                                >
                                    {resolveLanguageKey("productStatus." + product.status)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── Deleted banner ────────────────────────────────── */}
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={product.deletedAt} deletedBy={product.deletedBy} />
                    )}

                    {/* ── Content ───────────────────────────────────────── */}
                    <div className="px-3 py-1 flex flex-col gap-2">
                        <HiddenElement showLock randomLength={0}>
                            {read?.title && (
                                <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-h-6">
                                    {product.title || <ValueNotSet />}
                                </h3>
                            )}
                        </HiddenElement>

                        {read?.sku && product.sku && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                <IconBarcode className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{product.sku}</span>
                            </span>
                        )}

                        <div className="h-px bg-border" />

                        <div className="flex items-end justify-between gap-2">
                            {read?.type && product.type && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 font-medium">
                                    {resolveLanguageKey("productType." + product.type)}
                                </span>
                            )}
                            {read?.price && priceStr !== undefined && (
                                <span className="ml-auto font-bold text-base text-foreground leading-none">
                                    {priceStr}
                                </span>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <ProductSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            product={product}
                            fetchId={product._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"products"}
                            deleteId={product._id}
                            openAlert={action === "delete"}
                            name={read?.title && product.title}
                            confirmName={read?.title && product.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/product"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"products"}
                            deleteId={product._id}
                            openAlert={action === "restore"}
                            name={read?.title && product.title}
                            confirmName={read?.title && product.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/product/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/products/center/cardView/productCard.tsx"),
    withDebug(true, true),
)(ProductCard);
