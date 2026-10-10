import {useCallback, useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import {loadStripe, type Stripe as StripeJs} from "@stripe/stripe-js";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {generateUUID} from "@coreModule/helpers/general/uuid.ts";
import {
    CHECKOUT_IDEMPOTENCY_STORAGE_KEY,
    clearCheckoutIdempotencyKey,
    useShopCart,
} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import {shopErrorCode} from "@eCommerceModule/clients/client/public/shared/shopErrorMessages.ts";

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
    items: {product: string; quantity: number; totalPrice: number; snapshot?: {title?: string}}[];
    shippingAddress?: CheckoutAddress;
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

type Step = "address" | "shipping" | "payment" | "done";
type PaymentChoice = "stripe" | "cod" | "bank_transfer";

/** Errors after which the stored checkout can't be resumed — start a fresh one. */
const RESTART_CODES = new Set(["checkout_cart_changed", "checkout_expired", "idempotency_key_conflict", "checkout_not_found"]);

function getOrCreateIdempotencyKey(): string {
    let key: string | null = null;
    try {
        key = sessionStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
        if (!key) {
            key = generateUUID();
            sessionStorage.setItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY, key);
        }
    } catch {
        key = key ?? generateUUID();
    }
    return key;
}

/** The step a resumed checkout belongs on. */
function stepFor(checkout: CheckoutDTO): Step {
    if (checkout.paymentMethod || (checkout.selectedShippingRate && checkout.status === "pending")) return "payment";
    if (checkout.availableShippingRates?.length && checkout.shippingAddress) return "shipping";
    return "address";
}

const EMPTY_ADDRESS: CheckoutAddress = {firstName: "", lastName: "", phone: "", street: "", city: "", state: "", postalCode: "", country: ""};

const inputClass = "h-9 w-full rounded-md border border-shop-border px-3 text-sm outline-none focus:border-shop-accent";

function Field({label, className = "", children}: {label: string; className?: string; children: ReactNode}) {
    return (
        <label className={`flex flex-col gap-1 text-xs font-medium text-shop-ink-muted ${className}`}>
            {label}
            {children}
        </label>
    );
}

function AddressFields({value, onChange, countries}: {value: CheckoutAddress; onChange: (next: CheckoutAddress) => void; countries: ShopCountry[]}) {
    function set<K extends keyof CheckoutAddress>(key: K, fieldValue: string) {
        onChange({...value, [key]: fieldValue});
    }
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="First name *">
                <input required autoComplete="given-name" value={value.firstName} onChange={e => set("firstName", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Last name *">
                <input required autoComplete="family-name" value={value.lastName} onChange={e => set("lastName", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Street *" className="sm:col-span-2">
                <input required autoComplete="street-address" value={value.street} onChange={e => set("street", e.target.value)} className={inputClass} />
            </Field>
            <Field label="City *">
                <input required autoComplete="address-level2" value={value.city} onChange={e => set("city", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Country *">
                <select
                    required
                    autoComplete="country"
                    value={value.country ?? ""}
                    onChange={e => set("country", e.target.value)}
                    className={`${inputClass} bg-white ${value.country ? "" : "text-shop-ink-faded"}`}
                >
                    <option value="">Select a country</option>
                    {countries.map(country => (
                        <option key={country._id} value={country._id}>{country.name}</option>
                    ))}
                </select>
            </Field>
            <Field label="State">
                <input autoComplete="address-level1" value={value.state} onChange={e => set("state", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Postal code">
                <input autoComplete="postal-code" value={value.postalCode} onChange={e => set("postalCode", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Phone">
                <input type="tel" autoComplete="tel" value={value.phone} onChange={e => set("phone", e.target.value)} className={inputClass} />
            </Field>
        </div>
    );
}

function StripePaymentStep({clientSecret, onPaid, submitting, setSubmitting}: {
    clientSecret: string;
    onPaid: () => Promise<void>;
    submitting: boolean;
    setSubmitting: (v: boolean) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();

    async function handlePay() {
        if (!stripe || !elements) return;
        setSubmitting(true);
        try {
            // A previous attempt may already have been charged (e.g. placing the order failed
            // afterwards) — never charge again, just place the order.
            const {paymentIntent} = await stripe.retrievePaymentIntent(clientSecret);
            if (paymentIntent?.status === "succeeded") {
                await onPaid();
                return;
            }

            const result = await stripe.confirmPayment({
                elements,
                // Redirect-based methods come back here; the page then places the order
                confirmParams: {return_url: `${window.location.origin}/checkout`},
                redirect: "if_required",
            });
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
    const [searchParams, setSearchParams] = useSearchParams();
    const {cart, signInRequired, refresh: refreshCart} = useShopCart();
    const {config, formatMoney} = useShopConfig();

    const [checkout, setCheckout] = useState<CheckoutDTO | null>(null);
    const [step, setStep] = useState<Step>("address");
    const [countries, setCountries] = useState<ShopCountry[]>([]);
    const [shippingAddress, setShippingAddress] = useState<CheckoutAddress>(EMPTY_ADDRESS);
    const [email, setEmail] = useState("");
    const [rateIndex, setRateIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [order, setOrder] = useState<OrderDTO | null>(null);
    const returnHandled = useRef(false);

    const stripePromise = useMemo<Promise<StripeJs | null> | null>(
        () => (config?.stripePublishableKey ? loadStripe(config.stripePublishableKey) : null),
        [config?.stripePublishableKey],
    );

    const confirmOrder = useCallback(async (checkoutId: string) => {
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: OrderDTO}>("/api/eCommerce/checkout/confirm", {
                checkoutId,
                email: email || undefined,
                phone: shippingAddress.phone || undefined,
            });
            setOrder(res.data.data);
            setStep("done");
            clearCheckoutIdempotencyKey();
            await refreshCart();
        } catch (err) {
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: "Could not place your order"});
        } finally {
            setSubmitting(false);
        }
    }, [email, shippingAddress.phone, refreshCart]);

    /** Starts or resumes the checkout for the current cart; restarts once if the stored one is stale. */
    const initCheckout = useCallback(async (allowRestart = true): Promise<CheckoutDTO | null> => {
        try {
            const res = await apiClient.post<{data: CheckoutDTO}>("/api/eCommerce/checkout/init", {
                idempotencyKey: getOrCreateIdempotencyKey(),
            });
            const next = res.data.data;
            setCheckout(next);
            setStep(stepFor(next));
            if (next.shippingAddress) setShippingAddress({...EMPTY_ADDRESS, ...next.shippingAddress});
            return next;
        } catch (err) {
            if (allowRestart && RESTART_CODES.has(shopErrorCode(err) ?? "")) {
                clearCheckoutIdempotencyKey();
                return initCheckout(false);
            }
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: "Could not start checkout"});
            return null;
        }
    }, []);

    useEffect(() => {
        if (signInRequired) return;
        void (async () => {
            const started = await initCheckout();
            // Back from a redirect-based payment (3-D Secure, bank redirect): place the order
            if (started && !returnHandled.current && searchParams.get("payment_intent_client_secret")) {
                returnHandled.current = true;
                const failed = searchParams.get("redirect_status") === "failed";
                setSearchParams({}, {replace: true});
                if (failed) toast.error("The payment was not completed. Please try again.");
                else await confirmOrder(started._id);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            toast.error("Please fill in the required address fields");
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
        } catch (err) {
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: "Could not save the address"});
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
        } catch (err) {
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: "Could not select the shipping option"});
        } finally {
            setSubmitting(false);
        }
    }

    async function selectPaymentMethod(method: PaymentChoice) {
        if (!checkout) return;
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: CheckoutDTO}>("/api/eCommerce/checkout/payment", {
                checkoutId: checkout._id,
                paymentMethod: method,
            });
            setCheckout(res.data.data);
        } catch (err) {
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: "That payment method isn't available"});
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

    if (step === "done" && order) {
        const paid = order.paymentStatus === "paid";
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <h1 className="font-shop-display text-3xl font-semibold">Thank you!</h1>
                <p className="mt-3 text-shop-ink-muted">
                    Your order <span className="font-semibold text-shop-ink">{order.orderNumber}</span> has been placed.
                </p>
                <p className="mt-1 text-sm text-shop-ink-muted">
                    Total {formatMoney(order.grandTotal)} · {paid ? "Paid" : "Payment due on delivery or by bank transfer"}
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

    if (!checkout && (!cart || cart.items.length === 0)) {
        return (
            <div className="py-16 text-center">
                <h1 className="font-shop-display text-2xl font-semibold">Nothing to check out</h1>
                <Link to="/products" className="mt-3 inline-block text-sm text-shop-accent hover:underline">Browse products</Link>
            </div>
        );
    }

    const steps: {id: Step; label: string}[] = [
        {id: "address", label: "1. Address"},
        {id: "shipping", label: "2. Shipping"},
        {id: "payment", label: "3. Payment"},
    ];
    const summaryLines = checkout?.items ?? [];

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="flex min-w-0 flex-col gap-y-6">
                <h1 className="font-shop-display text-3xl font-semibold">Checkout</h1>
                <ol className="flex flex-wrap gap-4 text-sm" aria-label="Checkout steps">
                    {steps.map(s => (
                        <li
                            key={s.id}
                            aria-current={s.id === step ? "step" : undefined}
                            className={s.id === step ? "font-semibold text-shop-accent" : "text-shop-ink-faded"}
                        >
                            {s.label}
                        </li>
                    ))}
                </ol>

                {step === "address" && (
                    <div className="flex flex-col gap-y-4">
                        <Field label="Email for order updates">
                            <input
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={inputClass}
                            />
                        </Field>
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
                            <p className="text-shop-ink-muted">No shipping options are available for this address. Please check the country and postal code.</p>
                        ) : (
                            <fieldset className="flex flex-col gap-y-2">
                                <legend className="sr-only">Shipping option</legend>
                                {checkout.availableShippingRates.map((rate, index) => (
                                    <label
                                        key={`${rate.name}-${index}`}
                                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm ${rateIndex === index ? "border-shop-accent" : "border-shop-border"}`}
                                    >
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
                                ))}
                            </fieldset>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setStep("address")} disabled={submitting} className="rounded-full border border-shop-border px-5 py-2 text-sm">
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
                            onClick={() => confirmOrder(checkout._id)}
                            disabled={submitting}
                            className="w-full rounded-full bg-shop-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {submitting ? "Placing order…" : "Place order"}
                        </button>
                        <button onClick={() => setStep("shipping")} disabled={submitting} className="rounded-full border border-shop-border px-5 py-2 text-sm">
                            Back
                        </button>
                    </div>
                )}

                {step === "payment" && checkout && checkout.grandTotal > 0 && (
                    <div className="flex flex-col gap-y-4">
                        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Payment method">
                            {([
                                {id: "stripe", label: "Card (Stripe)", disabled: !config?.stripePublishableKey},
                                {id: "cod", label: "Cash on delivery", disabled: false},
                                {id: "bank_transfer", label: "Bank transfer", disabled: false},
                            ] as const).map(method => (
                                <button
                                    key={method.id}
                                    role="radio"
                                    aria-checked={checkout.paymentMethod === method.id}
                                    disabled={method.disabled || submitting}
                                    onClick={() => selectPaymentMethod(method.id)}
                                    className={`rounded-full border px-4 py-1.5 text-sm ${checkout.paymentMethod === method.id ? "border-shop-accent bg-shop-accent/5 font-semibold" : "border-shop-border"} disabled:opacity-40`}
                                >
                                    {method.label}
                                </button>
                            ))}
                        </div>

                        {checkout.paymentMethod === "stripe" && checkout.stripeClientSecret && stripePromise && (
                            <Elements stripe={stripePromise} options={{clientSecret: checkout.stripeClientSecret}}>
                                <StripePaymentStep
                                    clientSecret={checkout.stripeClientSecret}
                                    onPaid={() => confirmOrder(checkout._id)}
                                    submitting={submitting}
                                    setSubmitting={setSubmitting}
                                />
                            </Elements>
                        )}

                        {(checkout.paymentMethod === "cod" || checkout.paymentMethod === "bank_transfer") && (
                            <button
                                onClick={() => confirmOrder(checkout._id)}
                                disabled={submitting}
                                className="w-full rounded-full bg-shop-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {submitting ? "Placing order…" : "Place order"}
                            </button>
                        )}

                        <button onClick={() => setStep("shipping")} disabled={submitting} className="rounded-full border border-shop-border px-5 py-2 text-sm">
                            Back
                        </button>
                    </div>
                )}
            </div>

            <aside className="flex h-fit flex-col gap-y-2 rounded-xl border border-shop-border p-5 text-sm" aria-label="Order summary">
                <h2 className="font-shop-display text-lg font-semibold">Order summary</h2>
                {summaryLines.map((item, index) => (
                    <div key={`${item.product}-${index}`} className="flex justify-between gap-2">
                        <span className="truncate text-shop-ink-muted">{item.quantity}× {item.snapshot?.title}</span>
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
                            <div className="flex justify-between">
                                <span className="text-shop-ink-muted">Shipping</span>
                                <span>{checkout?.selectedShippingRate ? formatMoney(checkout.shippingTotal) : "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-shop-ink-muted">Tax</span>
                                <span>{checkout?.selectedShippingRate ? formatMoney(checkout.taxTotal) : "—"}</span>
                            </div>
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
