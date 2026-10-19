import {Link} from "react-router-dom";
import {compose} from "redux";
import {Clock, ImageOff, MapPin, Star} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {resolveShopMediaUrl} from "./shopMedia.ts";
import {listingLocationLabel, ShopProviderAvatar, useMarketplaceMoney} from "./shopMarketplace.tsx";
import ShopSellerCard from "./shopSellerCard.tsx";
import type {ShopListingCard as ShopListingCardType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopListingCard.tsx";

type ShopListingCardProps = WithLanguageType & {
    listing: ShopListingCardType;
};

/** "From €40" when packages change the price, "€40/hr" for hourly work, else the plain price. */
export function listingPriceLabel(
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"],
    formatted: string,
    listing: Pick<ShopListingCardType, "pricingType" | "packageCount" | "fromPrice" | "price">,
): string {
    if (listing.pricingType === "hourly") return resolveLanguageKey("perHour").replace("{price}", formatted);
    if (listing.packageCount && listing.fromPrice !== listing.price) return resolveLanguageKey("fromPrice").replace("{price}", formatted);
    return formatted;
}

function ShopListingCardInner({resolveLanguageKey, listing}: ShopListingCardProps) {
    const formatMoney = useMarketplaceMoney();
    const imageUrl = resolveShopMediaUrl(listing.mainImage);
    const location = listingLocationLabel(listing.location);
    const price = listing.fromPrice ?? listing.price;

    return (
        <Link to={`/service?id=${encodeURIComponent(listing._id)}`} className="group flex flex-col gap-3 rounded-2xl">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-shop-cream">
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
                <div className="absolute left-3 top-3 flex flex-wrap items-start gap-1.5">
                    {listing.promotion && (
                        <span className="rounded-full bg-shop-accent px-2.5 py-1 text-[11px] font-semibold text-white">
                            {resolveLanguageKey(`promotion.${listing.promotion}`)}
                        </span>
                    )}
                    {listing.category && (
                        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-shop-ink shadow-sm">
                            {listing.category.name}
                        </span>
                    )}
                </div>
                {listing.deliveryDays ? (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-shop-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        <Clock className="h-3 w-3" aria-hidden />
                        {resolveLanguageKey(listing.deliveryDays === 1 ? "deliveryDay" : "deliveryDays").replace("{days}", String(listing.deliveryDays))}
                    </span>
                ) : null}
            </div>
            <div className="flex flex-col gap-1.5 px-0.5">
                <ShopSellerCard seller={listing.seller} kind="service" size="compact" nestedInLink />
                {listing.provider && (
                    <span className="flex items-center gap-2 text-xs font-medium text-shop-ink-muted">
                        <ShopProviderAvatar name={listing.provider.name} size="sm" />
                        <span className="truncate">{listing.provider.name}</span>
                    </span>
                )}
                <h3 className="line-clamp-2 text-[15px] font-medium leading-snug underline-offset-4 group-hover:underline">{listing.title}</h3>
                {location && (
                    <span className="flex items-center gap-1 text-xs text-shop-ink-muted">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{location}</span>
                    </span>
                )}
                <div className="flex items-center justify-between gap-2">
                    <span className="font-shop-display text-[15px] font-semibold tabular-nums">
                        {price != null
                            ? listingPriceLabel(resolveLanguageKey, formatMoney(price, listing.currency), listing)
                            : resolveLanguageKey("priceOnRequest")}
                    </span>
                    {listing.reviewCount ? (
                        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs text-shop-ink-muted">
                            <Star className="h-3.5 w-3.5 fill-shop-ink text-shop-ink" aria-hidden />
                            <span aria-hidden>{listing.avgRating?.toFixed(1)} ({listing.reviewCount})</span>
                            <span className="sr-only">
                                {resolveLanguageKey("rating")
                                    .replace("{average}", listing.avgRating?.toFixed(1) ?? "")
                                    .replace("{count}", String(listing.reviewCount))}
                            </span>
                        </span>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopListingCardInner);
