import {Link} from "react-router-dom";
import {compose} from "redux";
import {ShoppingBag} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@coreModule/components/ui/sheet.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {useShopCart} from "./shopCartContext.tsx";
import {useShopConfig} from "./shopConfigContext.tsx";
import ShopCartLine from "./shopCartLine.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/shared/shopMiniCart.tsx";

/** The navbar's cart: a button with the item count, opening the cart (also after adding a product). */
function ShopMiniCartInner({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const {cart, itemCount, miniCartOpen, setMiniCartOpen} = useShopCart();
    const {formatMoney} = useShopConfig();
    const close = () => setMiniCartOpen(false);
    const items = cart?.items ?? [];

    return (
        <Sheet open={miniCartOpen} onOpenChange={setMiniCartOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={resolveLanguageKey("title").replace("{count}", String(itemCount))}>
                    <ShoppingBag />
                    {itemCount > 0 ? (
                        <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-3xs tabular-nums">{itemCount}</Badge>
                    ) : null}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
                <SheetHeader className="border-b">
                    <SheetTitle className="font-display text-lg">{resolveLanguageKey("title").replace("{count}", String(itemCount))}</SheetTitle>
                    <SheetDescription className="sr-only">{resolveLanguageKey("description")}</SheetDescription>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                        <p className="text-muted-foreground">{resolveLanguageKey("empty")}</p>
                        <Button asChild variant="outline" size="lg">
                            <Link to={`${base}/products`} onClick={close}>{resolveLanguageKey("browse")}</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 divide-y overflow-y-auto px-6">
                            {items.map(item => (
                                <ShopCartLine key={item._id} item={item} currency={cart?.currency} compact onNavigate={close} />
                            ))}
                        </ul>
                        <SheetFooter className="border-t">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm text-muted-foreground">{resolveLanguageKey("subtotal")}</span>
                                <span className="font-display text-lg font-semibold tabular-nums">{formatMoney(cart?.subtotal, cart?.currency)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{resolveLanguageKey("taxNote")}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Button asChild variant="outline" size="lg">
                                    <Link to={`${base}/cart`} onClick={close}>{resolveLanguageKey("viewCart")}</Link>
                                </Button>
                                <Button asChild size="lg">
                                    <Link to={`${base}/checkout`} onClick={close}>{resolveLanguageKey("checkout")}</Link>
                                </Button>
                            </div>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default compose(withLanguage(LANGUAGE_PATH), withDebug(true, true))(ShopMiniCartInner);
