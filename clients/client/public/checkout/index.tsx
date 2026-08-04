import {useEffect, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "sonner";
import {loadStripe, type Stripe as StripeJs} from "@stripe/stripe-js";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {generateUUID} from "@coreModule/helpers/general";
import {useShopCart} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";

type CheckoutAddress = {
    firstName: string;
    lastName: string;
    phone?: string;
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    /** Country ObjectId — required for shipping-rate and tax zone matching. */
    country?: string;
};

type ShopCountry = {_id: string; name: string; code: string};

type CheckoutDTO = {
    _id: string;
    status: string;
    availableShippingRates: {name: string; carrier?: string; price: number; estimatedDeliveryDays?: number}[];
    selectedShippingRate?: {name: string; price: number};
    subtotal: number;
    discountTotal: number;
    shippingTotal: number;
    taxTotal: number;
    grandTotal: number;
    giftCard?: {code: string; amount: number};
    paymentMethod?: string;
    stripeClientSecret?: string;
};

type OrderDTO = {
    _id: string;
    orderNumber: string;
    grandTotal: number;
    paymentStatus: string;
};

const IDEMPOTENCY_STORAGE_KEY = "shop-checkout-idempotency-key";

function getOrCreateIdempotencyKey(): string {
    let key = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
    if (!key) {
        key = generateUUID();
        sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, key);
    }
    return key;
}

function clearIdempotencyKey(): void {
    sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
}

const EMPTY_ADDRESS: CheckoutAddress = {firstName: "", lastName: "", phone: "", street: "", city: "", state: "", postalCode: "", country: ""};

function AddressFields({value, onChange, countries}: {value: CheckoutAddress; onChange: (next: CheckoutAddress) => void; countries: ShopCountry[]}) {
    function set<K extends keyof CheckoutAddress>(key: K, fieldValue: string) {
        onChange({...value, [key]: fieldValue});
    }
    const inputClass = "h-9 w-full rounded-md border border-shop-border px-3 text-sm outline-none focus:border-shop-accent";
    return (
        <div className="grid grid-cols-2 gap-3">
            <input required placeholder="First name*" value={value.firstName} onChange={e => set("firstName", e.target.value)} className={inputClass} />
            <input required placeholder="Last name*" value={value.lastName} onChange={e => set("lastName", e.target.value)} className={inputClass} />
            <input required placeholder="Street*" value={value.street} onChange={e => set("street", e.target.value)} className={`${inputClass} col-span-2`} />
            <input required placeholder="City*" value={value.city} onChange={e => set("city", e.target.value)} className={inputClass} />
            <select
                required
                value={value.country ?? ""}
                onChange={e => set("country", e.target.value)}
                className={`${inputClass} bg-white ${value.country ? "" : "text-shop-ink-faded"}`}
            >
                <option value="">Country*</option>
                {countries.map(country => (
                    <option key={country._id} value={country._id}>{country.name}</option>
                ))}
            </select>
            <input placeholder="State / region" value={value.state} onChange={e => set("state", e.target.value)} className={inputClass} />
            <input placeholder="Postal code" value={value.postalCode} onChange={e => set("postalCode", e.target.value)} className={inputClass} />
            <input placeholder="Phone" value={value.phone} onChange={e => set("phone", e.target.value)} className={inputClass} />
        </div>
    );
}

function StripePaymentStep({onPaid, submitting, setSubmitting}: {onPaid: () => Promise<void>; submitting: boolean; setSubmitting: (v: boolean) => void}) {
    const stripe = useStripe();
    const elements = useElements();

    async function handlePay() {
        if (!stripe || !elements) return;
        setSubmitting(true);
        try {
            const result = await stripe.confirmPayment({elements, redirect: "if_required"});
            if (result.error) {
                toast.error(result.error.message ?? "Payment failed");
                return;
            }
            await onPaid();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-y-4">
            <PaymentElement />
            <button
                onClick={handlePay}
                disabled={!stripe || submitting}
                className="w-full rounded-full bg-shop-accent py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
                {submitting ? "Processing…" : "Pay now"}
            </button>
        </div>
    );
}

function CheckoutPage() {
    const navigate = useNavigate();
    const {cart, signInRequired, refresh: refreshCart} = useShopCart();
    const {config, formatMoney} = useShopConfig();

    const [checkout, setCheckout] = useState<CheckoutDTO | null>(null);
    const [step, setStep] = useState<"address" | "shipping" | "payment" | "done">("address");
    const [countries, setCountries] = useState<ShopCountry[]>([]);
    const [shippingAddress, setShippingAddress] = useState<CheckoutAddress>(EMPTY_ADDRESS);
    const [email, setEmail] = useState("");
    const [rateIndex, setRateIndex] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod" | "bank_transfer">("stripe");
    const [submitting, setSubmitting] = useState(false);
    const [order, setOrder] = useState<OrderDTO | null>(null);

    const stripePromise = useMemo<Promise<StripeJs | null> | null>(
        () => (config?.stripePublishableKey ? loadStripe(config.stripePublishableKey) : null),
        [config?.stripePublishableKey],
    );

    useEffect(() => {
        if (signInRequired) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<{data: CheckoutDTO}>("/api/eCommerce/checkout/init", {
                    idempotencyKey: getOrCreateIdempotencyKey(),
                });
                if (!cancelled) setCheckout(res.data.data);
            } catch (err: any) {
                if (!cancelled) toast.error(err?.response?.data?.message ?? "Could not start checkout");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [signInRequired]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.get<{data: ShopCountry[]}>("/api/eCommerce/shopCountries");
                if (!cancelled) setCountries(res.data.data ?? []);
            } catch {
                if (!cancelled) setCountries([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    async function submitAddress() {
        if (!checkout) return;
        if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country) {
            toast.error("Please fill the required address fields");
            return;
        }
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: CheckoutDTO}>("/api/eCommerce/checkout/address", {
                checkoutId: checkout._id,
                shippingAddress,
            });
            setCheckout(res.data.data);
            setRateIndex(0);
            setStep("shipping");
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Could not save address");
        } finally {
            setSubmitting(false);
        }
    }

    async function submitShipping() {
        if (!checkout) return;
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: CheckoutDTO}>("/api/eCommerce/checkout/shipping", {
                checkoutId: checkout._id,
                rateIndex,
            });
            setCheckout(res.data.data);
            setStep("payment");
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Could not select shipping rate");
        } finally {
            setSubmitting(false);
        }
    }

    async function selectPaymentMethod(method: "stripe" | "cod" | "bank_transfer") {
        if (!checkout) return;
        setPaymentMethod(method);
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: CheckoutDTO}>("/api/eCommerce/checkout/payment", {
                checkoutId: checkout._id,
                paymentMethod: method,
            });
            setCheckout(res.data.data);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Payment method not available");
        } finally {
            setSubmitting(false);
        }
    }

    async function confirmOrder() {
        if (!checkout) return;
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: OrderDTO}>("/api/eCommerce/checkout/confirm", {
                checkoutId: checkout._id,
                email: email || undefined,
            });
            setOrder(res.data.data);
            setStep("done");
            clearIdempotencyKey();
            await refreshCart();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Could not confirm order");
        } finally {
            setSubmitting(false);
        }
    }

    if (signInRequired) {
        return (
            <div className="py-16 text-center">
                <h1 className="font-shop-display text-2xl font-semibold">Checkout</h1>
                <p className="mt-2 text-shop-ink-muted">Sign in from the main app to check out.</p>
            </div>
        );
    }

    if (step !== "done" && (!cart || cart.items.length === 0)) {
        return (
            <div className="py-16 text-center">
                <h1 className="font-shop-display text-2xl font-semibold">Nothing to check out</h1>
                <Link to="/products" className="mt-3 inline-block text-sm text-shop-accent hover:underline">Browse products</Link>
            </div>
        );
    }

    if (step === "done" && order) {
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <h1 className="font-shop-display text-3xl font-semibold">Thank you!</h1>
                <p className="mt-3 text-shop-ink-muted">
                    Your order <span className="font-semibold text-shop-ink">{order.orderNumber}</span> has been placed.
                </p>
                <p className="mt-1 text-sm text-shop-ink-muted">
                    Total {formatMoney(order.grandTotal)} · Payment: {order.paymentStatus}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    <button onClick={() => navigate("/account/orders")} className="rounded-full bg-shop-accent px-5 py-2 text-sm font-semibold text-white">
                        View my orders
                    </button>
                    <Link to="/products" className="rounded-full border border-shop-border px-5 py-2 text-sm font-medium">
                        Continue shopping
                    </Link>
                </div>
            </div>
        );
    }

    const steps: {id: typeof step; label: string}[] = [
        {id: "address", label: "1. Address"},
        {id: "shipping", label: "2. Shipping"},
        {id: "payment", label: "3. Payment"},
    ];

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="flex flex-col gap-y-6">
                <h1 className="font-shop-display text-3xl font-semibold">Checkout</h1>
                <div className="flex gap-4 text-sm">
                    {steps.map(s => (
                        <span key={s.id} className={s.id === step ? "font-semibold text-shop-accent" : "text-shop-ink-faded"}>
                            {s.label}
                        </span>
                    ))}
                </div>

                {step === "address" && (
                    <div className="flex flex-col gap-y-4">
                        <input
                            type="email"
                            placeholder="Email for order updates"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="h-9 w-full rounded-md border border-shop-border px-3 text-sm outline-none focus:border-shop-accent"
                        />
                        <AddressFields value={shippingAddress} onChange={setShippingAddress} countries={countries} />
                        <button
                            onClick={submitAddress}
                            disabled={submitting || !checkout}
                            className="rounded-full bg-shop-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            Continue to shipping
                        </button>
                    </div>
                )}

                {step === "shipping" && checkout && (
                    <div className="flex flex-col gap-y-4">
                        {checkout.availableShippingRates.length === 0 ? (
                            <p className="text-shop-ink-muted">No shipping options available for this address.</p>
                        ) : (
                            <ul className="flex flex-col gap-y-2">
                                {checkout.availableShippingRates.map((rate, index) => (
                                    <li key={`${rate.name}-${index}`}>
                                        <label className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm ${rateIndex === index ? "border-shop-accent" : "border-shop-border"}`}>
                                            <span className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="shippingRate"
                                                    checked={rateIndex === index}
                                                    onChange={() => setRateIndex(index)}
                                                />
                                                <span>
                                                    <span className="font-medium">{rate.name || "Shipping"}</span>
                                                    {rate.carrier && <span className="text-shop-ink-faded"> · {rate.carrier}</span>}
                                                    {rate.estimatedDeliveryDays != null && (
                                                        <span className="block text-xs text-shop-ink-faded">~{rate.estimatedDeliveryDays} days</span>
                                                    )}
                                                </span>
                                            </span>
                                            <span className="font-semibold">{rate.price === 0 ? "Free" : formatMoney(rate.price)}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setStep("address")} className="rounded-full border border-shop-border px-5 py-2 text-sm">
                                Back
                            </button>
                            <button
                                onClick={submitShipping}
                                disabled={submitting || checkout.availableShippingRates.length === 0}
                                className="rounded-full bg-shop-accent px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                Continue to payment
                            </button>
                        </div>
                    </div>
                )}

                {step === "payment" && checkout && checkout.grandTotal <= 0 && (checkout.giftCard?.amount ?? 0) > 0 && (
                    <div className="flex flex-col gap-y-4">
                        <p className="text-sm text-green-700">
                            Fully covered by gift card {checkout.giftCard?.code} — no payment needed.
                        </p>
                        <button
                            onClick={confirmOrder}
                            disabled={submitting}
                            className="w-full rounded-full bg-shop-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {submitting ? "Placing order…" : "Place order"}
                        </button>
                        <button onClick={() => setStep("shipping")} className="rounded-full border border-shop-border px-5 py-2 text-sm">
                            Back
                        </button>
                    </div>
                )}

                {step === "payment" && checkout && checkout.grandTotal > 0 && (
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-wrap gap-2">
                            {([
                                {id: "stripe", label: "Card (Stripe)", disabled: !config?.stripePublishableKey},
                                {id: "cod", label: "Cash on delivery", disabled: false},
                                {id: "bank_transfer", label: "Bank transfer", disabled: false},
                            ] as const).map(method => (
                                <button
                                    key={method.id}
                                    disabled={method.disabled || submitting}
                                    onClick={() => selectPaymentMethod(method.id)}
                                    className={`rounded-full border px-4 py-1.5 text-sm ${paymentMethod === method.id && checkout.paymentMethod === method.id ? "border-shop-accent bg-shop-accent/5 font-semibold" : "border-shop-border"} disabled:opacity-40`}
                                >
                                    {method.label}
                                </button>
                            ))}
                        </div>

                        {checkout.paymentMethod === "stripe" && checkout.stripeClientSecret && stripePromise && (
                            <Elements stripe={stripePromise} options={{clientSecret: checkout.stripeClientSecret}}>
                                <StripePaymentStep onPaid={confirmOrder} submitting={submitting} setSubmitting={setSubmitting} />
                            </Elements>
                        )}

                        {(checkout.paymentMethod === "cod" || checkout.paymentMethod === "bank_transfer") && (
                            <button
                                onClick={confirmOrder}
                                disabled={submitting}
                                className="w-full rounded-full bg-shop-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {submitting ? "Placing order…" : "Place order"}
                            </button>
                        )}

                        <button onClick={() => setStep("shipping")} className="rounded-full border border-shop-border px-5 py-2 text-sm">
                            Back
                        </button>
                    </div>
                )}
            </div>

            <aside className="flex flex-col h-fit gap-y-2 rounded-xl border border-shop-border p-5 text-sm">
                <h2 className="font-shop-display text-lg font-semibold">Order summary</h2>
                {(cart?.items ?? []).map(item => (
                    <div key={item._id} className="flex justify-between gap-2">
                        <span className="truncate text-shop-ink-muted">{item.quantity}× {item.snapshot?.title ?? item.product.title}</span>
                        <span>{formatMoney(item.totalPrice)}</span>
                    </div>
                ))}
                <div className="flex flex-col gap-y-1 border-t border-shop-border pt-2">
                    <div className="flex justify-between"><span className="text-shop-ink-muted">Subtotal</span><span>{formatMoney(checkout?.subtotal ?? cart?.subtotal)}</span></div>
                    {(checkout?.discountTotal ?? 0) > 0 && (
                        <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatMoney(checkout?.discountTotal)}</span></div>
                    )}
                    {step !== "address" && (
                        <>
                            <div className="flex justify-between"><span className="text-shop-ink-muted">Shipping</span><span>{formatMoney(checkout?.shippingTotal)}</span></div>
                            <div className="flex justify-between"><span className="text-shop-ink-muted">Tax</span><span>{formatMoney(checkout?.taxTotal)}</span></div>
                        </>
                    )}
                    {(checkout?.giftCard?.amount ?? 0) > 0 && (
                        <div className="flex justify-between text-green-700">
                            <span>Gift card ({checkout?.giftCard?.code})</span>
                            <span>-{formatMoney(checkout?.giftCard?.amount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t border-shop-border pt-1 font-semibold">
                        <span>Total</span>
                        <span>{formatMoney(checkout?.grandTotal ?? cart?.subtotal)}</span>
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default CheckoutPage;
