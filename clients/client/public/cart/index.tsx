import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {Minus, Plus, Trash2} from "lucide-react";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import {useShopCart} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";

function CartPage() {
    const navigate = useNavigate();
    const {cart, loading, signInRequired, updateItem, removeItem, applyDiscount, applyGiftCard, removeGiftCard} = useShopCart();
    const {formatMoney} = useShopConfig();
    const [couponInput, setCouponInput] = useState("");
    const [applying, setApplying] = useState(false);
    const [giftCardInput, setGiftCardInput] = useState("");
    const [applyingGiftCard, setApplyingGiftCard] = useState(false);

    async function handleApplyGiftCard() {
        if (!giftCardInput.trim()) return;
        setApplyingGiftCard(true);
        try {
            const result = await applyGiftCard(giftCardInput.trim());
            if (result.valid) {
                toast.success("Gift card applied");
                setGiftCardInput("");
            } else {
                toast.error(result.message ?? "Gift card not redeemable");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Could not apply gift card");
        } finally {
            setApplyingGiftCard(false);
        }
    }

    async function handleApplyCoupon() {
        if (!couponInput.trim()) return;
        setApplying(true);
        try {
            const result = await applyDiscount(couponInput.trim());
            if (result.valid) {
                toast.success("Discount applied");
                setCouponInput("");
            } else {
                toast.error(result.message ?? "Invalid discount code");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Could not apply discount");
        } finally {
            setApplying(false);
        }
    }

    if (signInRequired) {
        return (
            <div className="py-16 text-center">
                <h1 className="font-shop-display text-2xl font-semibold">Your cart</h1>
                <p className="mt-2 text-shop-ink-muted">Sign in from the main app to start shopping.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="h-48 animate-pulse rounded-xl bg-shop-cream" />;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="py-16 text-center">
                <h1 className="font-shop-display text-2xl font-semibold">Your cart is empty</h1>
                <Link to="/products" className="mt-3 inline-block rounded-full bg-shop-accent px-6 py-2 text-sm font-semibold text-white">
                    Browse products
                </Link>
            </div>
        );
    }

    const giftCardAmount = cart.appliedGiftCard?.amount ?? 0;
    const grandEstimate = Math.max(0, cart.subtotal - (cart.discountTotal ?? 0) - giftCardAmount);

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
                <h1 className="font-shop-display mb-6 text-3xl font-semibold">Your cart</h1>
                <ul className="divide-y divide-shop-border rounded-xl border border-shop-border">
                    {cart.items.map(item => {
                        const imageUrl = resolveShopMediaUrl(item.snapshot?.imageUrl);
                        return (
                            <li key={item._id} className="flex items-center gap-4 p-4">
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-shop-cream">
                                    {imageUrl && <img src={imageUrl} alt="" className="h-full w-full object-cover" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{item.snapshot?.title ?? item.product.title}</p>
                                    {item.snapshot?.sku && <p className="text-xs text-shop-ink-faded">SKU: {item.snapshot.sku}</p>}
                                    <p className="mt-0.5 text-xs text-shop-ink-muted">{formatMoney(item.unitPrice)} each</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => updateItem(item._id, item.quantity - 1).catch(() => toast.error("Could not update quantity"))}
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-shop-border hover:bg-shop-cream"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                    <button
                                        onClick={() => updateItem(item._id, item.quantity + 1).catch(err => toast.error(err?.response?.data?.message ?? "Could not update quantity"))}
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-shop-border hover:bg-shop-cream"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <p className="w-20 text-right text-sm font-semibold">{formatMoney(item.totalPrice)}</p>
                                <button
                                    onClick={() => removeItem(item._id).catch(() => toast.error("Could not remove item"))}
                                    className="text-shop-ink-faded transition-colors hover:text-red-500"
                                    aria-label="Remove item"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <aside className="flex flex-col h-fit gap-y-4 rounded-xl border border-shop-border p-5">
                <h2 className="font-shop-display text-lg font-semibold">Summary</h2>
                <div className="flex flex-col gap-y-1.5 text-sm">
                    <div className="flex justify-between">
                        <span className="text-shop-ink-muted">Subtotal</span>
                        <span>{formatMoney(cart.subtotal)}</span>
                    </div>
                    {cart.discountTotal > 0 && (
                        <div className="flex justify-between text-green-700">
                            <span>Discount{cart.appliedDiscounts[0]?.code ? ` (${cart.appliedDiscounts[0].code})` : ""}</span>
                            <span>-{formatMoney(cart.discountTotal)}</span>
                        </div>
                    )}
                    {giftCardAmount > 0 && (
                        <div className="flex items-center justify-between text-green-700">
                            <span>
                                Gift card ({cart.appliedGiftCard?.code})
                                <button
                                    onClick={() => removeGiftCard().catch(() => toast.error("Could not remove gift card"))}
                                    className="ml-2 text-xs text-shop-ink-faded underline"
                                >
                                    remove
                                </button>
                            </span>
                            <span>-{formatMoney(giftCardAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t border-shop-border pt-1.5 font-semibold">
                        <span>Estimated total</span>
                        <span>{formatMoney(grandEstimate)}</span>
                    </div>
                    <p className="text-xs text-shop-ink-faded">Shipping and tax calculated at checkout.</p>
                </div>

                <div className="flex gap-2">
                    <input
                        value={couponInput}
                        onChange={event => setCouponInput(event.target.value)}
                        placeholder="Discount code"
                        className="h-9 min-w-0 flex-1 rounded-md border border-shop-border px-3 text-sm outline-none focus:border-shop-accent"
                    />
                    <button
                        onClick={handleApplyCoupon}
                        disabled={applying || !couponInput.trim()}
                        className="h-9 rounded-md border border-shop-border px-3 text-sm font-medium hover:bg-shop-cream disabled:opacity-50"
                    >
                        Apply
                    </button>
                </div>

                {!cart.appliedGiftCard && (
                    <div className="flex gap-2">
                        <input
                            value={giftCardInput}
                            onChange={event => setGiftCardInput(event.target.value)}
                            placeholder="Gift card code"
                            className="h-9 min-w-0 flex-1 rounded-md border border-shop-border px-3 text-sm outline-none focus:border-shop-accent"
                        />
                        <button
                            onClick={handleApplyGiftCard}
                            disabled={applyingGiftCard || !giftCardInput.trim()}
                            className="h-9 rounded-md border border-shop-border px-3 text-sm font-medium hover:bg-shop-cream disabled:opacity-50"
                        >
                            Apply
                        </button>
                    </div>
                )}

                <button
                    onClick={() => navigate("/checkout")}
                    className="w-full rounded-full bg-shop-accent py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                    Proceed to checkout
                </button>
            </aside>
        </div>
    );
}

export default CartPage;
