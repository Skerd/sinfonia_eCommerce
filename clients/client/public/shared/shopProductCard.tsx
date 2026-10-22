import {Link} from "react-router-dom";
import {compose} from "redux";
import {ImageOff, Star} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ShopProductCard as ShopProductCardType} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import {resolveShopMediaUrl} from "./shopMedia.ts";
import {useShopConfig, type ShopMoneyCurrency} from "./shopConfigContext.tsx";
import {shopProductHref} from "./shopProductHref.ts";
import ShopSellerCard from "./shopSellerCard.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopProductCard.tsx";

/** Whole-percent saving, only when the compare-at price is really higher. */
export function shopDiscountPercent(price: number | undefined, compareAtPrice: number | undefined): number | null {
    if (price == null || compareAtPrice == null || compareAtPrice <= price) return null;
    return Math.round((1 - price / compareAtPrice) * 100);
}

type ShopPriceProps = WithLanguageType & {
    price: number | undefined;
    compareAtPrice?: number;
    currency?: ShopMoneyCurrency;
    size?: "sm" | "lg";
};

/** Price with its struck compare-at price when on sale. */
function ShopPriceInner({resolveLanguageKey, price, compareAtPrice, currency, size = "sm"}: ShopPriceProps) {
    const {formatMoney} = useShopConfig();
    const onSale = shopDiscountPercent(price, compareAtPrice) != null;
    return (
        <span className="inline-flex flex-wrap items-baseline gap-x-2">
            <span className={cn("font-shop-display font-semibold tabular-nums", size === "lg" ? "text-3xl" : "text-[15px]", onSale && "text-shop-accent")}>
                {formatMoney(price, currency)}
            </span>
            {onSale && (
                <span className={cn("text-shop-ink-faded tabular-nums line-through", size === "lg" ? "text-base" : "text-sm")}>
                    <span className="sr-only">{resolveLanguageKey("wasPrice")} </span>
                    {formatMoney(compareAtPrice, currency)}
                </span>
            )}
        </span>
    );
}

export const ShopPrice = compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopPriceInner);

type ShopProductCardProps = WithLanguageType & {
    product: ShopProductCardType;
};

function ShopProductCardInner({resolveLanguageKey, product}: ShopProductCardProps) {
    const imageUrl = resolveShopMediaUrl(product.mainImage);
    const discount = shopDiscountPercent(product.price, product.compareAtPrice);
    // The computed saving already covers a merchant "sale" badge
    const badge = product.badges?.find(item => !(discount != null && item.toLowerCase() === "sale"));

    return (
        <Link to={shopProductHref(product)} className="group flex flex-col gap-3 rounded-2xl">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-shop-cream">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-shop-ink-faded">
                        <ImageOff className="h-6 w-6" aria-hidden />
                        <span className="text-xs">{resolveLanguageKey("noImage")}</span>
                    </div>
                )}
                <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                    {discount != null && (
                        <span className="rounded-full bg-shop-accent px-2.5 py-1 text-[11px] font-semibold text-white">
                            {resolveLanguageKey("discount").replace("{percent}", String(discount))}
                        </span>
                    )}
                    {badge && (
                        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold capitalize text-shop-ink shadow-sm">
                            {badge}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-1.5 px-0.5">
                <ShopSellerCard seller={product.seller} kind="product" size="compact" nestedInLink />
                <h3 className="line-clamp-2 text-[15px] font-medium leading-snug underline-offset-4 group-hover:underline">{product.title}</h3>
                <div className="flex items-center justify-between gap-2">
                    <ShopPrice price={product.price} compareAtPrice={product.compareAtPrice} currency={product.currency} />
                    {product.ratingCount ? (
                        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs text-shop-ink-muted">
                            <Star className="h-3.5 w-3.5 fill-shop-ink text-shop-ink" aria-hidden />
                            <span aria-hidden>{product.ratingAverage?.toFixed(1)} ({product.ratingCount})</span>
                            <span className="sr-only">
                                {resolveLanguageKey("rating")
                                    .replace("{average}", product.ratingAverage?.toFixed(1) ?? "")
                                    .replace("{count}", String(product.ratingCount))}
                            </span>
                        </span>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopProductCardInner);
