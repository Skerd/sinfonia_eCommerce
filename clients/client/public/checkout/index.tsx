import {useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {toast} from "sonner";
import {Check, ChevronDown, Lock} from "lucide-react";
import {loadStripe, type Stripe as StripeJs} from "@stripe/stripe-js";
import {Elements, PaymentElement, useElements, useStripe} from "@stripe/react-stripe-js";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {generateUUID} from "@coreModule/helpers/general/uuid.ts";
import {
    CHECKOUT_IDEMPOTENCY_STORAGE_KEY,
    clearCheckoutIdempotencyKey,
    useShopCart,
} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import {useShopAuth} from "@eCommerceModule/clients/client/public/shared/shopAuthContext.tsx";
import {shopErrorCode} from "@eCommerceModule/clients/client/public/shared/shopErrorMessages.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import {
    ShopFieldError,
    ShopSignInPrompt,
    SHOP_BUTTON_SECONDARY_CLASS,
    SHOP_FIELD_ERROR_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_FIELD_LABEL_CLASS,
    SHOP_SUBMIT_CLASS,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";
import type {Checkout, CheckoutAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/checkout/checkout.dto.ts";
import {checkoutAddressZod} from "armonia/src/modules/eCommerce/api/eCommerce/private/checkout/checkoutAddress.form.validator.ts";
import {confirmCheckoutFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/checkout/confirmCheckout.form.validator.ts";
import type {CheckoutPaymentMethodType} from "armonia/src/modules/eCommerce/api/eCommerce/private/checkout/checkoutPayment.form.validator.ts";
import type {BuyerProductOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/productOrder/productOrder.dto.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/checkout/index.tsx";

type ShopCountry = {_id: string; name: string; code: string};
type ShopState = {_id: string; name: string};
type Step = "address" | "shipping" | "payment";
type AddressErrors = Partial<Record<keyof CheckoutAddress | "email", string>>;

const STEPS: Step[] = ["address", "shipping", "payment"];

/** Errors after which the stored checkout can't be resumed — start a fresh one. */
const RESTART_CODES = new Set(["checkout_cart_changed", "checkout_expired", "idempotency_key_conflict", "checkout_not_found"]);

/** The email typed at checkout, kept across a payment redirect (3-D Secure) that reloads the page. */
const CHECKOUT_EMAIL_STORAGE_KEY = "shop-checkout-email";

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

function readStoredEmail(): string {
    try {
        return sessionStorage.getItem(CHECKOUT_EMAIL_STORAGE_KEY) ?? "";
    } catch {
        return "";
    }
}

function storeEmail(email: string): void {
    try {
        if (email) sessionStorage.setItem(CHECKOUT_EMAIL_STORAGE_KEY, email);
        else sessionStorage.removeItem(CHECKOUT_EMAIL_STORAGE_KEY);
    } catch {
        // storage unavailable — the order falls back to the account email
    }
}

/** The step a resumed checkout belongs on. */
function stepFor(checkout: Checkout): Step {
    if (checkout.paymentMethod || (checkout.selectedShippingRate && checkout.status === "pending")) return "payment";
    if (checkout.availableShippingRates?.length && checkout.shippingAddress) return "shipping";
    return "address";
}

const EMPTY_ADDRESS: CheckoutAddress = {firstName: "", lastName: "", phone: "", street: "", city: "", state: "", postalCode: "", country: ""};

function isEmptyAddress(address: CheckoutAddress): boolean {
    return !address.firstName && !address.lastName && !address.street && !address.city;
}

function savedToCheckoutAddress(address: CustomerAddress): CheckoutAddress {
    return {
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone ?? "",
        street: address.street,
        city: address.city?.name ?? "",
        state: address.state?.name ?? "",
        postalCode: address.postalCode ?? "",
        country: address.country?._id ?? "",
    };
}

function Field({label, error, className, children}: {label: string; error?: string; className?: string; children: ReactNode}) {
    return (
        <label className={cn(SHOP_FIELD_LABEL_CLASS, className)}>
            {label}
            {children}
            <ShopFieldError message={error} />
        </label>
    );
}

type StripePaymentStepProps = {
    clientSecret: string;
    payLabel: string;
    processingLabel: string;
    paymentFailedLabel: string;
    onPaid: () => Promise<void>;
    submitting: boolean;
    setSubmitting: (v: boolean) => void;
};

function StripePaymentStep({clientSecret, payLabel, processingLabel, paymentFailedLabel, onPaid, submitting, setSubmitting}: StripePaymentStepProps) {
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
                toast.error(result.error.message ?? paymentFailedLabel);
                return;
            }
            await onPaid();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <PaymentElement />
            <button type="button" onClick={handlePay} disabled={!stripe || submitting} className={SHOP_SUBMIT_CLASS}>
                <Lock className="h-4 w-4" aria-hidden />
                {submitting ? processingLabel : payLabel}
            </button>
        </div>
    );
}

function CheckoutPage({resolveLanguageKey, languageCode}: WithLanguageType) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const {cart, loading: cartLoading, signInRequired, refresh: refreshCart} = useShopCart();
    const {config, formatMoney} = useShopConfig();
    const {user} = useShopAuth();

    const [checkout, setCheckout] = useState<Checkout | null>(null);
    const [step, setStep] = useState<Step>("address");
    const [countries, setCountries] = useState<ShopCountry[]>([]);
    const [states, setStates] = useState<ShopState[]>([]);
    const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
    const [selectedSavedId, setSelectedSavedId] = useState("");
    const [shippingAddress, setShippingAddress] = useState<CheckoutAddress>(EMPTY_ADDRESS);
    const [email, setEmail] = useState(readStoredEmail);
    const [errors, setErrors] = useState<AddressErrors>({});
    const [rateIndex, setRateIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const returnHandled = useRef(false);
    // Read by the saved-address load, which can finish before or after the checkout's own address arrives
    const addressRef = useRef(shippingAddress);
    useEffect(() => {
        addressRef.current = shippingAddress;
    }, [shippingAddress]);

    const stripePromise = useMemo<Promise<StripeJs | null> | null>(
        () => (config?.stripePublishableKey ? loadStripe(config.stripePublishableKey) : null),
        [config?.stripePublishableKey],
    );

    // The account email is the default contact address
    useEffect(() => {
        if (user.username?.includes("@")) setEmail(current => current || user.username);
    }, [user.username]);

    const confirmOrder = useCallback(async (checkoutId: string) => {
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: BuyerProductOrder}>("/api/eCommerce/checkout/confirm", {
                checkoutId,
                email: email || readStoredEmail() || undefined,
                phone: shippingAddress.phone || undefined,
            });
            clearCheckoutIdempotencyKey();
            storeEmail("");
            await refreshCart();
            // The confirmation lives on the order's own page, so a refresh or Back keeps it
            navigate(`/account/orders/${res.data.data._id}?placed=1`, {replace: true});
        } catch (err) {
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: resolveLanguageKey("placeOrderError")});
        } finally {
            setSubmitting(false);
        }
    }, [email, shippingAddress.phone, refreshCart, navigate, resolveLanguageKey]);

    /** Starts or resumes the checkout for the current cart; restarts once if the stored one is stale. */
    const initCheckout = useCallback(async (allowRestart = true): Promise<Checkout | null> => {
        try {
            const res = await apiClient.post<{data: Checkout}>("/api/eCommerce/checkout/init", {
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
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: resolveLanguageKey("startError")});
            return null;
        }
    }, [resolveLanguageKey]);

    useEffect(() => {
        if (signInRequired) return;
        void (async () => {
            const started = await initCheckout();
            // Back from a redirect-based payment (3-D Secure, bank redirect): place the order
            if (started && !returnHandled.current && searchParams.get("payment_intent_client_secret")) {
                returnHandled.current = true;
                const failed = searchParams.get("redirect_status") === "failed";
                setSearchParams({}, {replace: true});
                if (failed) toast.error(resolveLanguageKey("paymentNotCompleted"));
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

    // Shipping and tax zones can be limited to states, so offer the country's states by name
    useEffect(() => {
        const countryId = shippingAddress.country;
        if (!countryId) {
            setStates([]);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<{data: ShopState[]}>("/api/eCommerce/shopStates", {countryId});
                if (!cancelled) setStates(res.data.data ?? []);
            } catch {
                if (!cancelled) setStates([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [shippingAddress.country]);

    useEffect(() => {
        if (signInRequired) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<{data: CustomerAddress[]}>("/api/eCommerce/customerAddress/my", {});
                if (cancelled) return;
                const addresses = res.data.data ?? [];
                setSavedAddresses(addresses);
                // Start from the default shipping address unless the checkout already has one
                const preferred = addresses.find(address => address.isDefault && address.type === "shipping")
                    ?? addresses.find(address => address.isDefault);
                if (preferred && isEmptyAddress(addressRef.current)) {
                    setSelectedSavedId(preferred._id);
                    setShippingAddress(savedToCheckoutAddress(preferred));
                }
            } catch {
                if (!cancelled) setSavedAddresses([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [signInRequired]);

    function updateAddress(next: CheckoutAddress, changed: keyof CheckoutAddress) {
        setSelectedSavedId("");
        setShippingAddress(next);
        setErrors(current => ({...current, [changed]: undefined}));
    }

    async function submitAddress(event: FormEvent) {
        event.preventDefault();
        if (!checkout) return;

        const labels = {
            firstNameLabel: resolveLanguageKey("firstName"),
            lastNameLabel: resolveLanguageKey("lastName"),
            streetLabel: resolveLanguageKey("street"),
            cityLabel: resolveLanguageKey("city"),
            countryLabel: resolveLanguageKey("country"),
            emailLabel: resolveLanguageKey("email"),
        };
        const nextErrors: AddressErrors = {};
        const parsedAddress = checkoutAddressZod(languageCode, labels).safeParse({...shippingAddress, country: shippingAddress.country || undefined});
        if (!parsedAddress.success) {
            for (const issue of parsedAddress.error.issues) {
                const key = issue.path[0];
                if (typeof key === "string") nextErrors[key as keyof CheckoutAddress] = issue.message;
            }
        }
        // Shipping and tax zones match on the country, so the storefront requires it
        if (!shippingAddress.country) nextErrors.country = resolveLanguageKey("countryRequired");
        const parsedEmail = confirmCheckoutFormSchema(languageCode, labels).shape.email.safeParse(email.trim() || undefined);
        if (!parsedEmail.success) nextErrors.email = parsedEmail.error.issues[0]?.message;

        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) {
            const firstField = Object.keys(nextErrors)[0];
            document.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
            return;
        }

        storeEmail(email.trim());
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: Checkout}>("/api/eCommerce/checkout/address", {
                checkoutId: checkout._id,
                shippingAddress,
            });
            setCheckout(res.data.data);
            setRateIndex(0);
            setStep("shipping");
        } catch (err) {
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: resolveLanguageKey("addressError")});
        } finally {
            setSubmitting(false);
        }
    }

    async function submitShipping(event: FormEvent) {
        event.preventDefault();
        if (!checkout) return;
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: Checkout}>("/api/eCommerce/checkout/shipping", {
                checkoutId: checkout._id,
                rateIndex,
            });
            setCheckout(res.data.data);
            setStep("payment");
        } catch (err) {
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: resolveLanguageKey("shippingError")});
        } finally {
            setSubmitting(false);
        }
    }

    async function selectPaymentMethod(method: CheckoutPaymentMethodType) {
        if (!checkout || checkout.paymentMethod === method) return;
        setSubmitting(true);
        try {
            const res = await apiClient.post<{data: Checkout}>("/api/eCommerce/checkout/payment", {
                checkoutId: checkout._id,
                paymentMethod: method,
            });
            setCheckout(res.data.data);
        } catch (err) {
            handleError(err, {context: "Checkout", showToast: true, fallbackMessage: resolveLanguageKey("paymentMethodError")});
        } finally {
            setSubmitting(false);
        }
    }

    if (signInRequired) {
        return <ShopSignInPrompt titleKey="checkoutTitle" next="/checkout" />;
    }

    if (!checkout && cartLoading) {
        return <div className="h-72 animate-pulse rounded-2xl bg-shop-cream" aria-busy="true" aria-label={resolveLanguageKey("loading")} />;
    }

    if (!checkout && (!cart || cart.items.length === 0)) {
        return (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
                <h1 className="font-shop-display text-3xl font-semibold tracking-tight">{resolveLanguageKey("emptyTitle")}</h1>
                <Link to="/products" className={SHOP_BUTTON_SECONDARY_CLASS}>{resolveLanguageKey("browse")}</Link>
            </div>
        );
    }

    const stepIndex = STEPS.indexOf(step);
    const fullyCovered = checkout != null && checkout.grandTotal <= 0 && (checkout.giftCard?.amount ?? 0) > 0;
    const paymentMethods: {id: CheckoutPaymentMethodType; available: boolean}[] = [
        {id: "stripe", available: Boolean(config?.stripePublishableKey)},
        {id: "cod", available: true},
        {id: "bank_transfer", available: true},
    ];

    const summary = (
        <div className="flex flex-col gap-4">
            <ul className="flex flex-col gap-4">
                {(checkout?.items ?? []).map((item, index) => {
                    const imageUrl = resolveShopMediaUrl(item.snapshot?.imageUrl);
                    return (
                        <li key={`${item.product}-${index}`} className="flex items-center gap-3 text-sm">
                            <div className="relative h-16 w-14 shrink-0">
                                <div className="h-full w-full overflow-hidden rounded-lg bg-white">
                                    {imageUrl && <img src={imageUrl} alt="" className="h-full w-full object-cover" />}
                                </div>
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-shop-ink px-1 text-[11px] font-semibold text-white">
                                    {item.quantity}
                                </span>
                            </div>
                            <span className="min-w-0 flex-1 line-clamp-2">{item.snapshot?.title}</span>
                            <span className="tabular-nums">{formatMoney(item.totalPrice)}</span>
                        </li>
                    );
                })}
            </ul>
            <dl className="flex flex-col gap-2.5 border-t border-shop-border pt-4 text-[15px]">
                <div className="flex justify-between"><dt className="text-shop-ink-muted">{resolveLanguageKey("subtotal")}</dt><dd className="tabular-nums">{formatMoney(checkout?.subtotal ?? cart?.subtotal)}</dd></div>
                {(checkout?.discountTotal ?? 0) > 0 && (
                    <div className="flex justify-between text-shop-success"><dt>{resolveLanguageKey("discount")}</dt><dd className="tabular-nums">−{formatMoney(checkout?.discountTotal)}</dd></div>
                )}
                <div className="flex justify-between">
                    <dt className="text-shop-ink-muted">{resolveLanguageKey("shipping")}</dt>
                    <dd className="tabular-nums">{checkout?.selectedShippingRate ? formatMoney(checkout.shippingTotal) : <span className="text-shop-ink-faded">{resolveLanguageKey("nextStep")}</span>}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-shop-ink-muted">{resolveLanguageKey("tax")}</dt>
                    <dd className="tabular-nums">{checkout?.selectedShippingRate ? formatMoney(checkout.taxTotal) : <span className="text-shop-ink-faded">{resolveLanguageKey("nextStep")}</span>}</dd>
                </div>
                {(checkout?.giftCard?.amount ?? 0) > 0 && (
                    <div className="flex justify-between text-shop-success">
                        <dt>{resolveLanguageKey("giftCard").replace("{code}", checkout?.giftCard?.code ?? "")}</dt>
                        <dd className="tabular-nums">−{formatMoney(checkout?.giftCard?.amount)}</dd>
                    </div>
                )}
                <div className="flex items-baseline justify-between border-t border-shop-border pt-3">
                    <dt className="font-semibold">{resolveLanguageKey("total")}</dt>
                    <dd className="font-shop-display text-2xl font-semibold tabular-nums">{formatMoney(checkout?.grandTotal ?? cart?.subtotal)}</dd>
                </div>
            </dl>
        </div>
    );

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
                <h1 className="font-shop-display text-4xl font-bold tracking-tight sm:text-5xl">{resolveLanguageKey("title")}</h1>
                <ol className="flex items-center gap-2 text-sm sm:gap-4" aria-label={resolveLanguageKey("stepsLabel")}>
                    {STEPS.map((id, index) => {
                        const done = index < stepIndex;
                        const current = index === stepIndex;
                        const label = (
                            <>
                                <span className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                    done ? "bg-shop-ink text-white" : current ? "bg-shop-accent text-white" : "border border-shop-border text-shop-ink-faded",
                                )}>
                                    {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                                </span>
                                <span className={cn("hidden sm:inline", current ? "font-semibold" : done ? "" : "text-shop-ink-faded")}>
                                    {resolveLanguageKey(`steps.${id}`)}
                                </span>
                            </>
                        );
                        return (
                            <li key={id} className="flex items-center gap-2 sm:gap-4" aria-current={current ? "step" : undefined}>
                                {done && !submitting ? (
                                    <button
                                        type="button"
                                        onClick={() => setStep(id)}
                                        className="flex items-center gap-2 rounded-full underline-offset-4 hover:underline"
                                        aria-label={resolveLanguageKey("backTo").replace("{step}", resolveLanguageKey(`steps.${id}`))}
                                    >
                                        {label}
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-2">{label}</span>
                                )}
                                {index < STEPS.length - 1 && <span className="h-px w-6 bg-shop-border sm:w-12" aria-hidden />}
                            </li>
                        );
                    })}
                </ol>
            </div>

            <details className="group rounded-2xl bg-shop-cream lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2 text-sm font-medium">
                        {resolveLanguageKey("showSummary")}
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
                    </span>
                    <span className="font-shop-display text-lg font-semibold tabular-nums">{formatMoney(checkout?.grandTotal ?? cart?.subtotal)}</span>
                </summary>
                <div className="px-5 pb-5">{summary}</div>
            </details>

            <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
                <div className="flex min-w-0 flex-col gap-6">
                    {step === "address" && (
                        <form onSubmit={submitAddress} noValidate className="flex flex-col gap-6">
                            <section className="flex flex-col gap-4">
                                <h2 className="font-shop-display text-xl font-semibold">{resolveLanguageKey("contactTitle")}</h2>
                                <Field label={resolveLanguageKey("email")} error={errors.email}>
                                    <input
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={e => {
                                            setEmail(e.target.value);
                                            setErrors(current => ({...current, email: undefined}));
                                        }}
                                        aria-invalid={Boolean(errors.email)}
                                        className={cn(SHOP_FIELD_INPUT_CLASS, errors.email && SHOP_FIELD_ERROR_CLASS)}
                                    />
                                </Field>
                            </section>

                            <section className="flex flex-col gap-4">
                                <h2 className="font-shop-display text-xl font-semibold">{resolveLanguageKey("shippingAddressTitle")}</h2>
                                {savedAddresses.length > 0 ? (
                                    <Field label={resolveLanguageKey("savedAddress")}>
                                        <select
                                            value={selectedSavedId}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                setSelectedSavedId(id);
                                                const saved = savedAddresses.find((address) => address._id === id);
                                                setShippingAddress(saved ? savedToCheckoutAddress(saved) : EMPTY_ADDRESS);
                                                setErrors({});
                                            }}
                                            className={SHOP_FIELD_INPUT_CLASS}
                                        >
                                            <option value="">{resolveLanguageKey("newAddress")}</option>
                                            {savedAddresses.map((address) => (
                                                <option key={address._id} value={address._id}>
                                                    {address.label || `${address.firstName} ${address.lastName}`}
                                                    {address.city?.name ? ` — ${address.city.name}` : ""}
                                                    {address.isDefault ? ` (${resolveLanguageKey("defaultAddress")})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                ) : null}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {([
                                        ["firstName", "given-name"],
                                        ["lastName", "family-name"],
                                    ] as const).map(([key, autoComplete]) => (
                                        <Field key={key} label={resolveLanguageKey(key)} error={errors[key]}>
                                            <input
                                                name={key}
                                                autoComplete={autoComplete}
                                                value={shippingAddress[key]}
                                                onChange={e => updateAddress({...shippingAddress, [key]: e.target.value}, key)}
                                                aria-invalid={Boolean(errors[key])}
                                                className={cn(SHOP_FIELD_INPUT_CLASS, errors[key] && SHOP_FIELD_ERROR_CLASS)}
                                            />
                                        </Field>
                                    ))}
                                    <Field label={resolveLanguageKey("street")} error={errors.street} className="sm:col-span-2">
                                        <input
                                            name="street"
                                            autoComplete="street-address"
                                            value={shippingAddress.street}
                                            onChange={e => updateAddress({...shippingAddress, street: e.target.value}, "street")}
                                            aria-invalid={Boolean(errors.street)}
                                            className={cn(SHOP_FIELD_INPUT_CLASS, errors.street && SHOP_FIELD_ERROR_CLASS)}
                                        />
                                    </Field>
                                    <Field label={resolveLanguageKey("city")} error={errors.city}>
                                        <input
                                            name="city"
                                            autoComplete="address-level2"
                                            value={shippingAddress.city}
                                            onChange={e => updateAddress({...shippingAddress, city: e.target.value}, "city")}
                                            aria-invalid={Boolean(errors.city)}
                                            className={cn(SHOP_FIELD_INPUT_CLASS, errors.city && SHOP_FIELD_ERROR_CLASS)}
                                        />
                                    </Field>
                                    <Field label={resolveLanguageKey("postalCode")}>
                                        <input
                                            name="postalCode"
                                            autoComplete="postal-code"
                                            value={shippingAddress.postalCode ?? ""}
                                            onChange={e => updateAddress({...shippingAddress, postalCode: e.target.value}, "postalCode")}
                                            className={SHOP_FIELD_INPUT_CLASS}
                                        />
                                    </Field>
                                    <Field label={resolveLanguageKey("country")} error={errors.country}>
                                        <select
                                            name="country"
                                            autoComplete="country"
                                            value={shippingAddress.country ?? ""}
                                            onChange={e => updateAddress({...shippingAddress, country: e.target.value, state: ""}, "country")}
                                            aria-invalid={Boolean(errors.country)}
                                            className={cn(SHOP_FIELD_INPUT_CLASS, errors.country && SHOP_FIELD_ERROR_CLASS, !shippingAddress.country && "text-shop-ink-faded")}
                                        >
                                            <option value="">{resolveLanguageKey("selectCountry")}</option>
                                            {countries.map(country => (
                                                <option key={country._id} value={country._id}>{country.name}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label={resolveLanguageKey("state")}>
                                        {states.length > 0 ? (
                                            <select
                                                name="state"
                                                autoComplete="address-level1"
                                                value={shippingAddress.state ?? ""}
                                                onChange={e => updateAddress({...shippingAddress, state: e.target.value}, "state")}
                                                className={cn(SHOP_FIELD_INPUT_CLASS, !shippingAddress.state && "text-shop-ink-faded")}
                                            >
                                                <option value="">{resolveLanguageKey("selectState")}</option>
                                                {states.map(state => (
                                                    <option key={state._id} value={state.name}>{state.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                name="state"
                                                autoComplete="address-level1"
                                                value={shippingAddress.state ?? ""}
                                                onChange={e => updateAddress({...shippingAddress, state: e.target.value}, "state")}
                                                className={SHOP_FIELD_INPUT_CLASS}
                                            />
                                        )}
                                    </Field>
                                    <Field label={resolveLanguageKey("phone")} className="sm:col-span-2">
                                        <input
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            value={shippingAddress.phone ?? ""}
                                            onChange={e => updateAddress({...shippingAddress, phone: e.target.value}, "phone")}
                                            className={SHOP_FIELD_INPUT_CLASS}
                                        />
                                    </Field>
                                </div>
                            </section>
                            <button type="submit" disabled={submitting || !checkout} className={SHOP_SUBMIT_CLASS}>
                                {submitting ? resolveLanguageKey("saving") : resolveLanguageKey("continueToShipping")}
                            </button>
                        </form>
                    )}

                    {step === "shipping" && checkout && (
                        <form onSubmit={submitShipping} className="flex flex-col gap-6">
                            <fieldset className="flex flex-col gap-3">
                                <legend className="mb-4 font-shop-display text-xl font-semibold">{resolveLanguageKey("shippingMethodTitle")}</legend>
                                {checkout.availableShippingRates.length === 0 ? (
                                    <p className="rounded-xl bg-shop-cream p-4 text-shop-ink-muted">{resolveLanguageKey("noShippingRates")}</p>
                                ) : checkout.availableShippingRates.map((rate, index) => (
                                    <label
                                        key={`${rate.name}-${index}`}
                                        className={cn(
                                            "flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-colors",
                                            rateIndex === index ? "border-shop-ink bg-shop-cream/60" : "border-shop-border hover:border-shop-ink/40",
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="shippingRate"
                                                checked={rateIndex === index}
                                                onChange={() => setRateIndex(index)}
                                                className="h-4 w-4 accent-shop-ink"
                                            />
                                            <span className="flex flex-col">
                                                <span className="font-medium">
                                                    {rate.name || resolveLanguageKey("shipping")}
                                                    {rate.carrier && <span className="font-normal text-shop-ink-muted"> · {rate.carrier}</span>}
                                                </span>
                                                {rate.estimatedDeliveryDays != null && (
                                                    <span className="text-sm text-shop-ink-muted">
                                                        {rate.estimatedDeliveryDays === 1
                                                            ? resolveLanguageKey("deliveryDayOne")
                                                            : resolveLanguageKey("deliveryDays").replace("{days}", String(rate.estimatedDeliveryDays))}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                        <span className="font-semibold tabular-nums">{rate.price === 0 ? resolveLanguageKey("free") : formatMoney(rate.price)}</span>
                                    </label>
                                ))}
                            </fieldset>
                            <button type="submit" disabled={submitting || checkout.availableShippingRates.length === 0} className={SHOP_SUBMIT_CLASS}>
                                {submitting ? resolveLanguageKey("saving") : resolveLanguageKey("continueToPayment")}
                            </button>
                        </form>
                    )}

                    {step === "payment" && checkout && fullyCovered && (
                        <div className="flex flex-col gap-5">
                            <h2 className="font-shop-display text-xl font-semibold">{resolveLanguageKey("paymentTitle")}</h2>
                            <p className="rounded-xl bg-shop-cream p-4 text-shop-success">
                                {resolveLanguageKey("coveredByGiftCard").replace("{code}", checkout.giftCard?.code ?? "")}
                            </p>
                            <button type="button" onClick={() => confirmOrder(checkout._id)} disabled={submitting} className={SHOP_SUBMIT_CLASS}>
                                {submitting ? resolveLanguageKey("placingOrder") : resolveLanguageKey("placeOrder")}
                            </button>
                        </div>
                    )}

                    {step === "payment" && checkout && !fullyCovered && (
                        <div className="flex flex-col gap-6">
                            <fieldset className="flex flex-col gap-3" disabled={submitting}>
                                <legend className="mb-4 font-shop-display text-xl font-semibold">{resolveLanguageKey("paymentTitle")}</legend>
                                {paymentMethods.filter(method => method.available).map(method => (
                                    <label
                                        key={method.id}
                                        className={cn(
                                            "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                                            checkout.paymentMethod === method.id ? "border-shop-ink bg-shop-cream/60" : "border-shop-border hover:border-shop-ink/40",
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={checkout.paymentMethod === method.id}
                                            onChange={() => selectPaymentMethod(method.id)}
                                            className="h-4 w-4 accent-shop-ink"
                                        />
                                        <span className="flex flex-col">
                                            <span className="font-medium">{resolveLanguageKey(`methods.${method.id}.label`)}</span>
                                            <span className="text-sm text-shop-ink-muted">{resolveLanguageKey(`methods.${method.id}.hint`)}</span>
                                        </span>
                                    </label>
                                ))}
                            </fieldset>

                            {checkout.paymentMethod === "stripe" && checkout.stripeClientSecret && stripePromise && (
                                <Elements stripe={stripePromise} options={{clientSecret: checkout.stripeClientSecret}}>
                                    <StripePaymentStep
                                        clientSecret={checkout.stripeClientSecret}
                                        payLabel={resolveLanguageKey("payNow").replace("{amount}", formatMoney(checkout.grandTotal))}
                                        processingLabel={resolveLanguageKey("processing")}
                                        paymentFailedLabel={resolveLanguageKey("paymentFailed")}
                                        onPaid={() => confirmOrder(checkout._id)}
                                        submitting={submitting}
                                        setSubmitting={setSubmitting}
                                    />
                                </Elements>
                            )}

                            {(checkout.paymentMethod === "cod" || checkout.paymentMethod === "bank_transfer") && (
                                <button type="button" onClick={() => confirmOrder(checkout._id)} disabled={submitting} className={SHOP_SUBMIT_CLASS}>
                                    {submitting ? resolveLanguageKey("placingOrder") : resolveLanguageKey("placeOrderAmount").replace("{amount}", formatMoney(checkout.grandTotal))}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <aside className="hidden rounded-2xl bg-shop-cream p-6 lg:sticky lg:top-28 lg:block" aria-labelledby="shop-checkout-summary">
                    <h2 id="shop-checkout-summary" className="mb-5 font-shop-display text-xl font-semibold">{resolveLanguageKey("summaryTitle")}</h2>
                    {summary}
                </aside>
            </div>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(CheckoutPage);
