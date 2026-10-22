import {useState, type FormEvent} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import {toast} from "sonner";
import {ArrowRight, ChevronDown} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {useShopCart} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import {useShopReasonMessage} from "@eCommerceModule/clients/client/public/shared/shopErrorMessages.ts";
import ShopCartLine from "@eCommerceModule/clients/client/public/shared/shopCartLine.tsx";
import {
    ShopSignInPrompt,
    SHOP_BUTTON_CLASS,
    SHOP_BUTTON_SECONDARY_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_LINK_CLASS,
    SHOP_SUBMIT_CLASS,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/cart/index.tsx";

type CodeFormProps = {
    label: string;
    applyLabel: string;
    onApply: (code: string) => Promise<void>;
};

/** One code field (discount or gift card) that submits on Enter or the button. */
function CodeForm({label, applyLabel, onApply}: CodeFormProps) {
    const [code, setCode] = useState("");
    const [applying, setApplying] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        const value = code.trim();
        if (!value) return;
        setApplying(true);
        try {
            await onApply(value);
            setCode("");
        } finally {
            setApplying(false);
        }
    }

    return (
        <form onSubmit={submit} className="flex gap-2">
            <input
                value={code}
                onChange={event => setCode(event.target.value)}
                placeholder={label}
                aria-label={label}
                autoCapitalize="characters"
                className={cn(SHOP_FIELD_INPUT_CLASS, "min-w-0 flex-1")}
            />
            <button type="submit" disabled={applying || !code.trim()} className={cn(SHOP_BUTTON_SECONDARY_CLASS, "px-4")}>
                {applyLabel}
            </button>
        </form>
    );
}

function CartPage({resolveLanguageKey}: WithLanguageType) {
    const {cart, loading, signInRequired, itemCount, applyDiscount, removeDiscount, applyGiftCard, removeGiftCard} = useShopCart();
    const {formatMoney} = useShopConfig();
    const {reasonMessage} = useShopReasonMessage();

    const failed = (fallbackKey: string) => (err: unknown) =>
        handleError(err, {context: "Cart", showToast: true, fallbackMessage: resolveLanguageKey(fallbackKey)});

    async function handleApplyDiscount(code: string) {
        try {
            const result = await applyDiscount(code);
            if (result.valid) toast.success(resolveLanguageKey("discountApplied"));
            else toast.error(reasonMessage(result.message, "discount"));
        } catch (err) {
            failed("discountError")(err);
        }
    }

    async function handleApplyGiftCard(code: string) {
        try {
            const result = await applyGiftCard(code);
            if (result.valid) toast.success(resolveLanguageKey("giftCardApplied"));
            else toast.error(reasonMessage(result.message, "giftCard"));
        } catch (err) {
            failed("giftCardError")(err);
        }
    }

    if (signInRequired) {
        return <ShopSignInPrompt titleKey="cartTitle" next="/cart" />;
    }

    if (loading && !cart) {
        return (
            <div className="grid gap-10 lg:grid-cols-[1fr_380px]" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                <div className="h-72 animate-pulse rounded-2xl bg-shop-cream" />
                <div className="h-72 animate-pulse rounded-2xl bg-shop-cream" />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
                <h1 className="font-shop-display text-3xl font-semibold tracking-tight">{resolveLanguageKey("emptyTitle")}</h1>
                <p className="text-shop-ink-muted">{resolveLanguageKey("emptyMessage")}</p>
                <Link to="/products" className={cn(SHOP_BUTTON_CLASS, "mt-2")}>{resolveLanguageKey("browse")}</Link>
            </div>
        );
    }

    const discountCode = cart.appliedDiscounts?.[0]?.code;
    const giftCardAmount = cart.appliedGiftCard?.amount ?? 0;
    const estimate = Math.max(0, cart.subtotal - (cart.discountTotal ?? 0) - giftCardAmount);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="font-shop-display text-4xl font-bold tracking-tight sm:text-5xl">{resolveLanguageKey("title")}</h1>
                <p className="text-shop-ink-muted">
                    {resolveLanguageKey(itemCount === 1 ? "itemCountOne" : "itemCount").replace("{count}", String(itemCount))}
                </p>
            </div>

            <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
                <div className="flex flex-col gap-8">
                    {(() => {
                        const groups = new Map<string, typeof cart.items>();
                        for (const item of cart.items) {
                            const key = item.sellerCompanyId ?? item.seller?._id ?? "_";
                            const list = groups.get(key) ?? [];
                            list.push(item);
                            groups.set(key, list);
                        }
                        return [...groups.entries()].map(([key, items]) => (
                            <div key={key} className="flex flex-col gap-2">
                                {items[0]?.seller?.name && (
                                    <p className="text-sm font-medium text-shop-ink-muted">
                                        {resolveLanguageKey("soldBy").replace("{name}", items[0].seller.name)}
                                    </p>
                                )}
                                <ul className="divide-y divide-shop-border border-y border-shop-border">
                                    {items.map(item => (
                                        <ShopCartLine key={item._id} item={item} currency={cart.currency} />
                                    ))}
                                </ul>
                            </div>
                        ));
                    })()}
                    <Link to="/products" className={cn(SHOP_LINK_CLASS, "self-start text-sm")}>{resolveLanguageKey("continueShopping")}</Link>
                </div>

                <aside className="flex flex-col gap-5 rounded-2xl bg-shop-cream p-6 lg:sticky lg:top-28" aria-labelledby="shop-cart-summary">
                    <h2 id="shop-cart-summary" className="font-shop-display text-xl font-semibold">{resolveLanguageKey("summary")}</h2>
                    <dl className="flex flex-col gap-3 text-[15px]">
                        <div className="flex justify-between gap-4">
                            <dt className="text-shop-ink-muted">{resolveLanguageKey("subtotal")}</dt>
                            <dd className="tabular-nums">{formatMoney(cart.subtotal, cart.currency)}</dd>
                        </div>
                        {(cart.discountTotal ?? 0) > 0 && (
                            <div className="flex justify-between gap-4 text-shop-success">
                                <dt>
                                    {discountCode ? resolveLanguageKey("discountWithCode").replace("{code}", discountCode) : resolveLanguageKey("discount")}
                                    <button
                                        type="button"
                                        onClick={() => void removeDiscount().catch(failed("removeDiscountError"))}
                                        className="ml-2 text-xs text-shop-ink-muted underline underline-offset-2 hover:text-shop-ink"
                                    >
                                        {resolveLanguageKey("remove")}
                                    </button>
                                </dt>
                                <dd className="tabular-nums">−{formatMoney(cart.discountTotal, cart.currency)}</dd>
                            </div>
                        )}
                        {giftCardAmount > 0 && (
                            <div className="flex justify-between gap-4 text-shop-success">
                                <dt>
                                    {resolveLanguageKey("giftCardWithCode").replace("{code}", cart.appliedGiftCard?.code ?? "")}
                                    <button
                                        type="button"
                                        onClick={() => void removeGiftCard().catch(failed("removeGiftCardError"))}
                                        className="ml-2 text-xs text-shop-ink-muted underline underline-offset-2 hover:text-shop-ink"
                                    >
                                        {resolveLanguageKey("remove")}
                                    </button>
                                </dt>
                                <dd className="tabular-nums">−{formatMoney(giftCardAmount, cart.currency)}</dd>
                            </div>
                        )}
                        <div className="flex items-baseline justify-between gap-4 border-t border-shop-border pt-3">
                            <dt className="font-semibold">{resolveLanguageKey("estimatedTotal")}</dt>
                            <dd className="font-shop-display text-2xl font-semibold tabular-nums">{formatMoney(estimate, cart.currency)}</dd>
                        </div>
                    </dl>
                    <p className="-mt-2 text-xs text-shop-ink-muted">{resolveLanguageKey("shippingNote")}</p>

                    <details className="group rounded-xl border border-shop-border bg-white">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                            {resolveLanguageKey("codesToggle")}
                            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
                        </summary>
                        <div className="flex flex-col gap-3 px-4 pb-4">
                            <CodeForm label={resolveLanguageKey("discountCode")} applyLabel={resolveLanguageKey("apply")} onApply={handleApplyDiscount} />
                            {!cart.appliedGiftCard && (
                                <CodeForm label={resolveLanguageKey("giftCardCode")} applyLabel={resolveLanguageKey("apply")} onApply={handleApplyGiftCard} />
                            )}
                        </div>
                    </details>

                    <Link to="/checkout" className={SHOP_SUBMIT_CLASS}>
                        {resolveLanguageKey("checkout")}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                </aside>
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(CartPage);
