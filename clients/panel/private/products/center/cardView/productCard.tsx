import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useMemo, useState} from "react";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";
import {IconPhoto, IconStar} from "@tabler/icons-react";
import ProductSheetView from "@eCommerceModule/clients/panel/private/products/center/sheetView/productSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/eCommerce/products";

function productEditPath(product: Product) {
    const params = new URLSearchParams();
    params.set("productId", product._id);
    if (product.title) params.set("productTitle", encodeURIComponent(product.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
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
                        <div className="mt-0.5 text-3xs font-medium uppercase leading-none tracking-wide text-warning/70">
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
    fetchId?: string;
    onDelete?: (deleted?: Product, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Product> | null>;
};

function ProductCard({
    product,
    resolveLanguageKey,
    fetchId,
    onDelete,
    onRestore,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: ProductCardProps) {
    return (
        <EntityCard
            resource="products"
            entity={product}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/product/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={productEditPath}
            Sheet={ProductSheetView}
            sheetEntityProp="product"
            deleteUrl="/api/eCommerce/product"
            restoreUrl="/api/eCommerce/product/restore"
            failedTitle=""
            failedDescription=""
            titlePath="title"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity: row}) => {
                const description = row.shortDescription || row.description;
                const rating = row.ratingAverage;
                const {price, compareAtPrice, saleEndsAt} = row;
                const onSale = price != null && compareAtPrice != null && compareAtPrice > price;
                const savingsPercent = onSale ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
                const showTimer = !!saleEndsAt && isWithinSaleWindow(row) && getTimeLeft(new Date(saleEndsAt)) != null;
                return (
                    <>
                        <figure className="relative mb-1 aspect-4/3 w-full overflow-hidden bg-muted">
                            {row.mainImage ? (
                                <img
                                    src={`/api/auxiliary/media/${row.mainImage._id}`}
                                    alt={row.title ?? ""}
                                    className="absolute inset-0 size-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                    <IconPhoto className="size-10 text-muted-foreground/15" />
                                </div>
                            )}
                            <div className="pointer-events-none absolute top-2 left-2 z-20 flex flex-row flex-wrap items-center gap-1">
                                <DisplayValue path="type" type="enum" languageKeyCategory="productType" value={row.type}>
                                    {(label) =>
                                        label ? (
                                            <Badge variant="secondary" className="pointer-events-auto px-1.5 py-0 text-3xs">
                                                {label}
                                            </Badge>
                                        ) : null
                                    }
                                </DisplayValue>
                                {onSale && savingsPercent > 0 ? (
                                    <DisplayValue path="compareAtPrice" value={compareAtPrice} show={!!row.compareAtPrice}>
                                        {() => (
                                            <Badge variant="destructive" className="pointer-events-auto px-1.5 py-0 text-3xs">
                                                {resolveLanguageKey("salePercentOff").replace(
                                                    "{{percent}}",
                                                    String(savingsPercent),
                                                )}
                                            </Badge>
                                        )}
                                    </DisplayValue>
                                ) : null}
                            </div>
                            {showTimer && saleEndsAt ? (
                                <div className="absolute inset-x-2 bottom-2 z-20">
                                    <DisplayValue path="saleEndsAt" value={saleEndsAt}>
                                        {() => (
                                            <SaleCountdown
                                                endsAt={saleEndsAt}
                                                resolveLanguageKey={resolveLanguageKey}
                                            />
                                        )}
                                    </DisplayValue>
                                </div>
                            ) : null}
                        </figure>
                        <EntityCard.Header titlePath="title" title={row.title} />
                        <div className="flex flex-col gap-2">
                            {rating != null ? (
                                <DisplayValue path="ratingAverage" value={rating}>
                                    {() => (
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
                                            <span className="ml-1.5 text-3xs text-muted-foreground">
                                                ({rating.toFixed(1)})
                                            </span>
                                        </div>
                                    )}
                                </DisplayValue>
                            ) : null}
                            {description ? (
                                <DisplayValue path="shortDescription" value={description}>
                                    {(text) => (
                                        <p className="line-clamp-2 text-xs text-muted-foreground">{text}</p>
                                    )}
                                </DisplayValue>
                            ) : null}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-end gap-1.5">
                                    <span className="text-base font-semibold leading-none">
                                        <DisplayValue
                                            path="price"
                                            type="currency"
                                            value={{amount: row.price, currency: row.currency}}
                                        />
                                    </span>
                                    {onSale ? (
                                        <span className="mb-px truncate text-xs text-muted-foreground line-through">
                                            <DisplayValue
                                                path="compareAtPrice"
                                                type="currency"
                                                value={{amount: row.compareAtPrice, currency: row.currency}}
                                            />
                                        </span>
                                    ) : null}
                                </div>
                                <DisplayValue
                                    path="status"
                                    type="enum"
                                    languageKeyCategory="productStatus"
                                    value={row.status}
                                >
                                    {(label) =>
                                        label ? (
                                            <Badge
                                                variant={row.status === "active" ? "outline" : "destructive"}
                                                className="shrink-0 px-1.5 py-0 text-3xs"
                                            >
                                                {label}
                                            </Badge>
                                        ) : null
                                    }
                                </DisplayValue>
                            </div>
                        </div>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/products/center/cardView/productCard.tsx"),
    withDebug(true, true, "products"),
)(ProductCard);
