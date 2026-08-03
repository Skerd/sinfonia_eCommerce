import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useMemo, useState} from "react";
import {Card, CardContent} from "@coreModule/components/ui/card.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconPhoto, IconStar} from "@tabler/icons-react";
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

function formatMoney(
    amount: number,
    product: Product,
    currencyRead?: {keys?: {symbol?: unknown; abbreviation?: unknown}},
): string {
    const c = product.currency;
    const symbol = currencyRead?.keys?.symbol ? c?.symbol?.trim() : undefined;
    const abbreviation = currencyRead?.keys?.abbreviation ? c?.abbreviation?.trim() : undefined;
    const prefix = symbol || abbreviation;
    const n = amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return prefix ? `${prefix} ${n}` : n;
}

type TimeLeft = {days: number; hours: number; minutes: number; seconds: number};

function getTimeLeft(endsAt: Date, now = new Date()): TimeLeft | null {
    const diff = endsAt.getTime() - now.getTime();
    if (diff <= 0) return null;
    const totalSeconds = Math.floor(diff / 1000);
    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
    };
}

function isWithinSaleWindow(product: Product, now = new Date()): boolean {
    if (product.saleStartsAt) {
        const start = new Date(product.saleStartsAt);
        if (!Number.isNaN(start.getTime()) && start > now) return false;
    }
    if (product.saleEndsAt) {
        const end = new Date(product.saleEndsAt);
        if (!Number.isNaN(end.getTime()) && end < now) return false;
    }
    return true;
}

function SaleCountdown({
    endsAt,
    resolveLanguageKey,
}: {
    endsAt: string;
    resolveLanguageKey: (key: string) => string;
}) {
    const endDate = useMemo(() => new Date(endsAt), [endsAt]);
    const [time, setTime] = useState<TimeLeft | null>(() => getTimeLeft(endDate));

    useEffect(() => {
        if (Number.isNaN(endDate.getTime())) {
            setTime(null);
            return;
        }
        setTime(getTimeLeft(endDate));
        const timer = setInterval(() => setTime(getTimeLeft(endDate)), 1000);
        return () => clearInterval(timer);
    }, [endDate]);

    if (!time) return null;

    const cells: {value: number; labelKey: string}[] = [
        {value: time.days, labelKey: "timerDays"},
        {value: time.hours, labelKey: "timerHours"},
        {value: time.minutes, labelKey: "timerMins"},
        {value: time.seconds, labelKey: "timerSecs"},
    ];

    return (
        <div className="pointer-events-none w-full rounded-md bg-warning/95 px-1.5 py-1.5 shadow-sm backdrop-blur-[2px]">
            <div className="grid grid-cols-4 gap-0.5 text-center">
                {cells.map(({value, labelKey}) => (
                    <div key={labelKey} className="min-w-0 px-0.5">
                        <div className="text-xs font-bold tabular-nums leading-none text-warning">
                            {String(value).padStart(2, "0")}
                        </div>
                        <div className="mt-0.5 text-[8px] font-medium uppercase leading-none tracking-wide text-warning/70">
                            {resolveLanguageKey(labelKey)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
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

    const description = product.shortDescription || product.description;
    const canReadDescription = !!(read?.shortDescription || read?.description);
    const rating = product.ratingAverage;
    const typeLabel = product.type ? resolveLanguageKey("productType." + product.type) : undefined;
    const isActive = product.status === "active";

    const {price, compareAtPrice, saleEndsAt} = product;
    const onSale = price != null && compareAtPrice != null && compareAtPrice > price;
    const savingsPercent = onSale ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
    const priceStr = price != null ? formatMoney(price, product, read?.currency) : undefined;
    const compareStr = compareAtPrice != null ? formatMoney(compareAtPrice, product, read?.currency) : undefined;
    const showTimer = !!saleEndsAt && isWithinSaleWindow(product) && getTimeLeft(new Date(saleEndsAt)) != null;

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group h-full w-full gap-0 overflow-hidden py-0 shadow-none hover:cursor-pointer",
                    )}
                    onClick={() => setAction("view")}
                >
                    <figure className="relative mb-3 aspect-4/3 w-full overflow-hidden bg-muted">
                        <HiddenElement randomLength={read?.mainImage ? 0 : 12}>
                            {!!read?.mainImage && (
                                product.mainImage? (
                                    <img
                                        src={`/api/auxiliary/media/${product.mainImage._id}`}
                                        alt={read?.title ? product.title : ""}
                                        className="absolute inset-0 size-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                        <IconPhoto className="size-10 text-muted-foreground/15" />
                                    </div>
                                )
                            )}
                        </HiddenElement>

                        {/* Top-left: type + % off */}
                        <div className="pointer-events-none absolute top-2 left-2 z-20 flex flex-row flex-wrap items-center gap-1">
                            <HiddenElement randomLength={read?.type ? 0 : 6}>
                                {!!read?.type && typeLabel ? (
                                    <Badge variant="secondary" className="pointer-events-auto text-[10px] px-1.5 py-0">
                                        {typeLabel}
                                    </Badge>
                                ) : null}
                            </HiddenElement>
                            {(onSale && savingsPercent > 0) || !(read?.compareAtPrice && read?.price) ? (
                                <HiddenElement
                                    randomLength={read?.compareAtPrice && read?.price ? 0 : 4}
                                >
                                    {!!(read?.compareAtPrice && read?.price) && onSale && savingsPercent > 0 ? (
                                        <Badge variant="destructive" className="pointer-events-auto text-[10px] px-1.5 py-0">
                                            {resolveLanguageKey("salePercentOff").replace(
                                                "{{percent}}",
                                                String(savingsPercent),
                                            )}
                                        </Badge>
                                    ) : null}
                                </HiddenElement>
                            ) : null}
                        </div>

                        {!hideActions && (
                            <div
                                className="absolute top-2 right-2 z-20"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ActionMenu
                                    accessModel={"products"}
                                    deletedData={product}
                                    onAction={(a: string) => setAction(a)}
                                    editPath={productEditPath(product)}
                                />
                            </div>
                        )}

                        {/* Bottom of image/gallery: sale countdown */}
                        {(showTimer && !!saleEndsAt) || !read?.saleEndsAt ? (
                            <div className="absolute inset-x-2 bottom-2 z-20">
                                <HiddenElement randomLength={read?.saleEndsAt ? 0 : 10}>
                                    {!!read?.saleEndsAt && showTimer && saleEndsAt ? (
                                        <SaleCountdown
                                            endsAt={saleEndsAt}
                                            resolveLanguageKey={resolveLanguageKey}
                                        />
                                    ) : null}
                                </HiddenElement>
                            </div>
                        ) : null}
                    </figure>

                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={product.deletedAt} deletedBy={product.deletedBy} />
                    )}

                    <CardContent className="space-y-2.5 px-4 pb-3">
                        <div>
                            <HiddenElement randomLength={10}>
                                {read?.title ? (
                                    <div className="line-clamp-2 text-base font-bold leading-snug">
                                        {product.title || <ValueNotSet />}
                                    </div>
                                ) : null}
                            </HiddenElement>

                            {(rating != null || !read?.ratingAverage) && (
                                <div className="mt-1.5">
                                    <HiddenElement randomLength={read?.ratingAverage ? 0 : 6}>
                                        {!!read?.ratingAverage && rating != null ? (
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <IconStar
                                                        key={i}
                                                        className={cn(
                                                            "size-3",
                                                            i < Math.floor(rating)
                                                                ? "fill-current text-warning"
                                                                : "text-muted-foreground/40",
                                                        )}
                                                    />
                                                ))}
                                                <span className="text-muted-foreground ml-1.5 text-[10px]">
                                                    ({rating.toFixed(1)})
                                                </span>
                                            </div>
                                        ) : null}
                                    </HiddenElement>
                                </div>
                            )}
                        </div>

                        {(!!description || !canReadDescription) && (
                            <HiddenElement randomLength={canReadDescription ? 0 : 16}>
                                {canReadDescription && description ? (
                                    <p className="text-muted-foreground line-clamp-2 text-xs">
                                        {description}
                                    </p>
                                ) : null}
                            </HiddenElement>
                        )}

                        <div className="flex items-center justify-between gap-2">
                            <HiddenElement randomLength={read?.price ? 0 : 8}>
                                {!!read?.price && priceStr !== undefined ? (
                                    <div className="flex min-w-0 items-end gap-1.5">
                                        <span className="text-base font-semibold leading-none">
                                            {priceStr}
                                        </span>
                                        {(onSale && !!compareStr) || !read?.compareAtPrice ? (
                                            <HiddenElement
                                                randomLength={read?.compareAtPrice ? 0 : 6}
                                            >
                                                {!!read?.compareAtPrice && onSale && compareStr ? (
                                                    <span className="text-muted-foreground mb-px truncate text-xs line-through">
                                                        {compareStr}
                                                    </span>
                                                ) : null}
                                            </HiddenElement>
                                        ) : null}
                                    </div>
                                ) : null}
                            </HiddenElement>
                            <HiddenElement randomLength={read?.status ? 0 : 6}>
                                {!!read?.status && product.status ? (
                                    <Badge
                                        variant={isActive ? "outline" : "destructive"}
                                        className="shrink-0 px-1.5 py-0 text-[10px]"
                                    >
                                        {resolveLanguageKey("productStatus." + product.status)}
                                    </Badge>
                                ) : null}
                            </HiddenElement>
                        </div>
                    </CardContent>
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
