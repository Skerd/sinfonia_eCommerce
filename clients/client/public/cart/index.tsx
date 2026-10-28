import {useState, type FormEvent} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import {toast} from "sonner";
import {ArrowRight, ChevronDown} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {useShopCart} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import {useShopReasonMessage} from "@eCommerceModule/clients/client/public/shared/shopErrorMessages.ts";
import ShopCartLine from "@eCommerceModule/clients/client/public/shared/shopCartLine.tsx";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {ShopSignInPrompt} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";

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
            <Input
        value={code}
        onChange={event => setCode(event.target.value)}
        placeholder={label}
        aria-label={label}
        autoCapitalize="characters"
        className="min-w-0 flex-1"
      />
            <Button variant="outline" size="lg" type="submit" disabled={applying || !code.trim()} className="px-4">
                {applyLabel}
            </Button>
        </form>
    );
}

function CartPage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
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
        return <ShopSignInPrompt titleKey="cartTitle" next={`${base}/cart`} />;
    }

    if (loading && !cart) {
        return (
            <div className="grid gap-10 lg:grid-cols-[1fr_380px]" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                <div className="h-72 animate-pulse rounded-2xl bg-muted" />
                <div className="h-72 animate-pulse rounded-2xl bg-muted" />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
                <h1 className="font-display text-3xl font-semibold tracking-tight">{resolveLanguageKey("emptyTitle")}</h1>
                <p className="text-muted-foreground">{resolveLanguageKey("emptyMessage")}</p>
                <Button asChild size="lg" className="mt-2"><Link to={`${base}/products`}>{resolveLanguageKey("browse")}</Link></Button>
            </div>
        );
    }

    const discountCode = cart.appliedDiscounts?.[0]?.code;
    const giftCardAmount = cart.appliedGiftCard?.amount ?? 0;
    const estimate = Math.max(0, cart.subtotal - (cart.discountTotal ?? 0) - giftCardAmount);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{resolveLanguageKey("title")}</h1>
                <p className="text-muted-foreground">
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
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {resolveLanguageKey("soldBy").replace("{name}", items[0].seller.name)}
                                    </p>
                                )}
                                <ul className="divide-y divide-border border-y border-border">
                                    {items.map(item => (
                                        <ShopCartLine key={item._id} item={item} currency={cart.currency} />
                                    ))}
                                </ul>
                            </div>
                        ));
                    })()}
                    <Button asChild variant="link" className="h-auto p-0 self-start text-sm"><Link to={`${base}/products`}>{resolveLanguageKey("continueShopping")}</Link></Button>
                </div>

                <aside className="flex flex-col gap-5 rounded-2xl bg-muted p-6 lg:sticky lg:top-28" aria-labelledby="shop-cart-summary">
                    <h2 id="shop-cart-summary" className="font-display text-xl font-semibold">{resolveLanguageKey("summary")}</h2>
                    <dl className="flex flex-col gap-3 text-[15px]">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">{resolveLanguageKey("subtotal")}</dt>
                            <dd className="tabular-nums">{formatMoney(cart.subtotal, cart.currency)}</dd>
                        </div>
                        {(cart.discountTotal ?? 0) > 0 && (
                            <div className="flex justify-between gap-4 text-success">
                                <dt>
                                    {discountCode ? resolveLanguageKey("discountWithCode").replace("{code}", discountCode) : resolveLanguageKey("discount")}
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={() => void removeDiscount().catch(failed("removeDiscountError"))}
                                        className="ml-2 h-auto p-0 text-xs text-muted-foreground"
                                    >
                                        {resolveLanguageKey("remove")}
                                    </Button>
                                </dt>
                                <dd className="tabular-nums">−{formatMoney(cart.discountTotal, cart.currency)}</dd>
                            </div>
                        )}
                        {giftCardAmount > 0 && (
                            <div className="flex justify-between gap-4 text-success">
                                <dt>
                                    {resolveLanguageKey("giftCardWithCode").replace("{code}", cart.appliedGiftCard?.code ?? "")}
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={() => void removeGiftCard().catch(failed("removeGiftCardError"))}
                                        className="ml-2 h-auto p-0 text-xs text-muted-foreground"
                                    >
                                        {resolveLanguageKey("remove")}
                                    </Button>
                                </dt>
                                <dd className="tabular-nums">−{formatMoney(giftCardAmount, cart.currency)}</dd>
                            </div>
                        )}
                        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
                            <dt className="font-semibold">{resolveLanguageKey("estimatedTotal")}</dt>
                            <dd className="font-display text-2xl font-semibold tabular-nums">{formatMoney(estimate, cart.currency)}</dd>
                        </div>
                    </dl>
                    <p className="-mt-2 text-xs text-muted-foreground">{resolveLanguageKey("shippingNote")}</p>

                    <details className="group rounded-xl border border-border bg-card">
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

                    <Button asChild size="lg" className="w-full"><Link to={`${base}/checkout`}>
                        {resolveLanguageKey("checkout")}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link></Button>
                </aside>
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(CartPage);
