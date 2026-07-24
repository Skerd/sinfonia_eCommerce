import {Link} from "react-router-dom";
import {Star} from "lucide-react";
import type {ShopProductCard as ShopProductCardType} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import {resolveShopMediaUrl} from "./shopMedia.ts";
import {useShopConfig} from "./shopConfigContext.tsx";

type ShopProductCardProps = {
    product: ShopProductCardType;
};

function ShopProductCard({product}: ShopProductCardProps) {
    const {formatMoney} = useShopConfig();
    const imageUrl = resolveShopMediaUrl(product.mainImage);
    const onSale = product.compareAtPrice != null && product.price != null && product.compareAtPrice > product.price;

    return (
        <Link
            to={`/product?slug=${encodeURIComponent(product.slug)}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-shop-border bg-white transition-shadow hover:shadow-md"
        >
            <div className="relative aspect-square w-full overflow-hidden bg-shop-cream">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-shop-ink-faded">No image</div>
                )}
                {onSale && (
                    <span className="absolute left-2 top-2 rounded-full bg-shop-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                        Sale
                    </span>
                )}
                {product.badges?.slice(0, 1).map(badge => (
                    <span key={badge} className="absolute right-2 top-2 rounded-full bg-shop-ink px-2 py-0.5 text-[11px] font-semibold text-white">
                        {badge}
                    </span>
                ))}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold">{formatMoney(product.price)}</span>
                        {onSale && (
                            <span className="text-xs text-shop-ink-faded line-through">{formatMoney(product.compareAtPrice)}</span>
                        )}
                    </div>
                    {product.ratingCount ? (
                        <span className="inline-flex items-center gap-0.5 text-xs text-shop-ink-muted">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {product.ratingAverage?.toFixed(1)} ({product.ratingCount})
                        </span>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}

export default ShopProductCard;
