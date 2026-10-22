import {Link} from "react-router-dom";
import {compose} from "redux";
import {X} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle} from "@coreModule/components/ui/sheet.tsx";
import {useShopCart} from "./shopCartContext.tsx";
import {useShopConfig} from "./shopConfigContext.tsx";
import ShopCartLine from "./shopCartLine.tsx";
import {SHOP_BUTTON_CLASS, SHOP_BUTTON_SECONDARY_CLASS} from "./shopAuthChrome.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopMiniCart.tsx";

/** Slide-over cart, opened after adding a product; shows the server cart as it is. */
function ShopMiniCartInner({resolveLanguageKey}: WithLanguageType) {
    const {cart, itemCount, miniCartOpen, setMiniCartOpen} = useShopCart();
    const {formatMoney} = useShopConfig();
    const close = () => setMiniCartOpen(false);
    const items = cart?.items ?? [];

    return (
        <Sheet open={miniCartOpen} onOpenChange={setMiniCartOpen}>
            <SheetContent side="right" showCloseButton={false} className="w-full gap-0 bg-white p-0 text-shop-ink sm:max-w-md">
                <div className="flex items-center justify-between border-b border-shop-border px-6 py-4">
                    <SheetTitle className="font-shop-display text-lg font-semibold text-shop-ink">
                        {resolveLanguageKey("title").replace("{count}", String(itemCount))}
                    </SheetTitle>
                    <SheetClose className="-mr-2 flex h-10 w-10 items-center justify-center text-shop-ink-muted hover:text-shop-ink" aria-label={resolveLanguageKey("close")}>
                        <X className="h-5 w-5" />
                    </SheetClose>
                </div>
                <SheetDescription className="sr-only">{resolveLanguageKey("description")}</SheetDescription>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <p className="text-shop-ink-muted">{resolveLanguageKey("empty")}</p>
                        <Link to="/products" onClick={close} className={SHOP_BUTTON_SECONDARY_CLASS}>
                            {resolveLanguageKey("browse")}
                        </Link>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 divide-y divide-shop-border overflow-y-auto px-6">
                            {items.map(item => (
                                <ShopCartLine key={item._id} item={item} currency={cart?.currency} compact onNavigate={close} />
                            ))}
                        </ul>
                        <div className="flex flex-col gap-3 border-t border-shop-border px-6 py-5">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm text-shop-ink-muted">{resolveLanguageKey("subtotal")}</span>
                                <span className="font-shop-display text-lg font-semibold tabular-nums">{formatMoney(cart?.subtotal, cart?.currency)}</span>
                            </div>
                            <p className="text-xs text-shop-ink-faded">{resolveLanguageKey("taxNote")}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/cart" onClick={close} className={SHOP_BUTTON_SECONDARY_CLASS}>
                                    {resolveLanguageKey("viewCart")}
                                </Link>
                                <Link to="/checkout" onClick={close} className={SHOP_BUTTON_CLASS}>
                                    {resolveLanguageKey("checkout")}
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopMiniCartInner);
