import {Link} from "react-router-dom";
import {compose} from "redux";
import {X} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {CartItem} from "armonia/src/modules/eCommerce/api/eCommerce/private/cart/cart.dto.ts";
import {resolveShopMediaUrl} from "./shopMedia.ts";
import {useShopCart} from "./shopCartContext.tsx";
import {useShopConfig, type ShopMoneyCurrency} from "./shopConfigContext.tsx";
import {shopProductHref} from "./shopProductHref.ts";
import ShopQuantityStepper from "./shopQuantityStepper.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopCartLine.tsx";

type ShopCartLineProps = WithLanguageType & {
    item: CartItem;
    /** The cart's currency. */
    currency?: ShopMoneyCurrency;
    /** Tighter layout for the slide-over cart. */
    compact?: boolean;
    /** Called when the buyer follows the product link (closes the slide-over). */
    onNavigate?: () => void;
};

/** One cart line: image, linked title, quantity stepper, line total and remove. */
function ShopCartLineInner({resolveLanguageKey, item, currency, compact = false, onNavigate}: ShopCartLineProps) {
    const {pendingItemIds, updateItem, removeItem} = useShopCart();
    const {formatMoney} = useShopConfig();
    const itemId = item._id ?? "";
    const pending = pendingItemIds.has(itemId);
    const title = item.snapshot?.title ?? item.product.title ?? "";
    const imageUrl = resolveShopMediaUrl(item.snapshot?.imageUrl);
    const rules = item.quantityRules ?? {min: 1, step: 1};
    const productHref = item.product._id
        ? shopProductHref({_id: item.product._id, slug: item.product.slug, seller: item.seller})
        : undefined;

    const failed = (fallbackKey: string) => (err: unknown) =>
        handleError(err, {context: "Cart", showToast: true, fallbackMessage: resolveLanguageKey(fallbackKey)});

    const image = (
        <div className={cn("shrink-0 overflow-hidden rounded-xl bg-shop-cream", compact ? "h-20 w-16" : "h-28 w-24 sm:h-32 sm:w-28")}>
            {imageUrl && <img src={imageUrl} alt="" className="h-full w-full object-cover" />}
        </div>
    );

    return (
        <li className={cn("flex gap-4", compact ? "py-4" : "py-6", pending && "opacity-60")} aria-busy={pending}>
            {productHref ? <Link to={productHref} onClick={onNavigate} tabIndex={-1} aria-hidden>{image}</Link> : image}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        {productHref ? (
                            <Link to={productHref} onClick={onNavigate} className="line-clamp-2 text-[15px] font-medium leading-snug underline-offset-4 hover:underline">
                                {title}
                            </Link>
                        ) : (
                            <p className="line-clamp-2 text-[15px] font-medium leading-snug">{title}</p>
                        )}
                        {item.snapshot?.sku && !compact && (
                            <p className="mt-0.5 text-xs text-shop-ink-faded">{resolveLanguageKey("sku").replace("{sku}", item.snapshot.sku)}</p>
                        )}
                        <p className="mt-0.5 text-sm text-shop-ink-muted tabular-nums">
                            {resolveLanguageKey("each").replace("{price}", formatMoney(item.unitPrice, currency))}
                        </p>
                    </div>
                    <p className="shrink-0 font-shop-display text-[15px] font-semibold tabular-nums">{formatMoney(item.totalPrice, currency)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <ShopQuantityStepper
                        value={item.quantity}
                        min={rules.min}
                        max={rules.max}
                        step={rules.step}
                        itemLabel={title}
                        removeBelowMin
                        disabled={pending}
                        size="sm"
                        onChange={(next: number) => {
                            void updateItem(itemId, next).catch(failed("updateError"));
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => void removeItem(itemId).catch(failed("removeError"))}
                        disabled={pending}
                        className="inline-flex items-center gap-1 text-sm text-shop-ink-muted underline-offset-4 transition-colors hover:text-shop-danger hover:underline disabled:opacity-50"
                        aria-label={resolveLanguageKey("removeLabel").replace("{item}", title)}
                    >
                        <X className="h-4 w-4" aria-hidden />
                        <span className={compact ? "sr-only" : undefined}>{resolveLanguageKey("remove")}</span>
                    </button>
                </div>
            </div>
        </li>
    );
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopCartLineInner);
