import {useEffect, useState, type FormEvent} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";
import {
    myCustomerAddressCreateFormSchema,
    myCustomerAddressEditFormSchema,
    type MyCustomerAddressCreateFormType,
} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/myCustomerAddress.form.validator.ts";
import {customerAddressTypes} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.schema-def.ts";
import {cn} from "@coreModule/components/lib/utils.ts";
import {
    SHOP_BUTTON_CLASS,
    SHOP_BUTTON_SECONDARY_CLASS,
    SHOP_FIELD_ERROR_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_FIELD_LABEL_CLASS,
    SHOP_LINK_CLASS,
    SHOP_SUBMIT_CLASS,
    ShopFieldError,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/addresses/index.tsx";

type ShopCountry = {_id: string; name: string; code: string};
type ShopCity = {_id: string; name: string};
type FieldErrors = Partial<Record<keyof MyCustomerAddressCreateFormType, string>>;

const EMPTY_FORM: MyCustomerAddressCreateFormType = {
    type: "shipping",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
    label: "",
    isDefault: false,
};

function AddressPageInner({resolveLanguageKey, languageCode}: WithLanguageType) {
    const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
    const [countries, setCountries] = useState<ShopCountry[]>([]);
    const [cities, setCities] = useState<ShopCity[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<MyCustomerAddressCreateFormType>(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [showForm, setShowForm] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const loadAddresses = async () => {
        const res = await apiClient.post<{data: CustomerAddress[]}>("/api/eCommerce/customerAddress/my", {});
        setAddresses(res.data.data ?? []);
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [addressRes, countryRes] = await Promise.all([
                    apiClient.post<{data: CustomerAddress[]}>("/api/eCommerce/customerAddress/my", {}),
                    apiClient.get<{data: ShopCountry[]}>("/api/eCommerce/shopCountries"),
                ]);
                if (cancelled) return;
                setAddresses(addressRes.data.data ?? []);
                setCountries(countryRes.data.data ?? []);
            } catch (err) {
                handleError(err, {context: "Shop addresses", showToast: true, fallbackMessage: resolveLanguageKey("loadError")});
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [resolveLanguageKey]);

    useEffect(() => {
        if (!form.country) {
            setCities([]);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<{data: ShopCity[]}>("/api/eCommerce/shopCities", {countryId: form.country});
                if (!cancelled) setCities(res.data.data ?? []);
            } catch {
                if (!cancelled) setCities([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [form.country]);

    const setField = <K extends keyof MyCustomerAddressCreateFormType>(key: K, value: MyCustomerAddressCreateFormType[K]) => {
        setForm((prev) => ({...prev, [key]: value}));
        setFieldErrors((prev) => {
            if (!prev[key]) return prev;
            const next = {...prev};
            delete next[key];
            return next;
        });
    };

    const startCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFieldErrors({});
        setShowForm(true);
    };

    const startEdit = (address: CustomerAddress) => {
        setEditingId(address._id);
        setForm({
            type: address.type,
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email ?? "",
            phone: address.phone ?? "",
            street: address.street,
            city: address.city?._id ?? "",
            postalCode: address.postalCode ?? "",
            country: address.country?._id ?? "",
            label: address.label ?? "",
            isDefault: address.isDefault,
        });
        setFieldErrors({});
        setShowForm(true);
    };

    const handleSave = async (event: FormEvent) => {
        event.preventDefault();
        if (saving) return;

        const payload = {
            ...form,
            email: form.email?.trim() || undefined,
            phone: form.phone?.trim() || undefined,
            postalCode: form.postalCode?.trim() || undefined,
            label: form.label?.trim() || undefined,
        };

        const parsed = editingId
            ? myCustomerAddressEditFormSchema(languageCode, {
                firstNameLabel: resolveLanguageKey("form.firstNameLabel"),
                lastNameLabel: resolveLanguageKey("form.lastNameLabel"),
                streetLabel: resolveLanguageKey("form.streetLabel"),
                cityLabel: resolveLanguageKey("form.cityLabel"),
                countryLabel: resolveLanguageKey("form.countryLabel"),
            }).safeParse({...payload, _id: editingId})
            : myCustomerAddressCreateFormSchema(languageCode, {
                firstNameLabel: resolveLanguageKey("form.firstNameLabel"),
                lastNameLabel: resolveLanguageKey("form.lastNameLabel"),
                streetLabel: resolveLanguageKey("form.streetLabel"),
                cityLabel: resolveLanguageKey("form.cityLabel"),
                countryLabel: resolveLanguageKey("form.countryLabel"),
            }).safeParse(payload);

        if (!parsed.success) {
            const next: FieldErrors = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0];
                if (typeof key === "string" && key in EMPTY_FORM) {
                    next[key as keyof MyCustomerAddressCreateFormType] = issue.message;
                }
            }
            setFieldErrors(next);
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await apiClient.patch("/api/eCommerce/customerAddress/my", parsed.data);
            } else {
                await apiClient.put("/api/eCommerce/customerAddress/my", parsed.data);
            }
            await loadAddresses();
            setShowForm(false);
            setEditingId(null);
            toast.success(resolveLanguageKey("saved"));
        } catch (err) {
            handleError(err, {context: "Shop addresses", showToast: true, fallbackMessage: resolveLanguageKey("saveError")});
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDeleteId(null);
        try {
            await apiClient.delete("/api/eCommerce/customerAddress/my", {data: {_id: id}});
            await loadAddresses();
            if (editingId === id) {
                setShowForm(false);
                setEditingId(null);
            }
            toast.success(resolveLanguageKey("deleted"));
        } catch (err) {
            handleError(err, {context: "Shop addresses", showToast: true, fallbackMessage: resolveLanguageKey("deleteError")});
        }
    };

    if (loading) {
        return <div className="h-48 animate-pulse rounded-xl bg-shop-cream" />;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-shop-display text-3xl font-semibold">{resolveLanguageKey("title")}</h1>
                    <p className="mt-2 text-sm text-shop-ink-muted">{resolveLanguageKey("subtitle")}</p>
                </div>
                <button type="button" onClick={startCreate} className={SHOP_BUTTON_CLASS}>
                    {resolveLanguageKey("add")}
                </button>
            </div>

            {addresses.length === 0 && !showForm ? (
                <div className="rounded-xl border border-dashed border-shop-border py-16 text-center text-shop-ink-muted">
                    {resolveLanguageKey("empty")}
                </div>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                        <li key={address._id} className="rounded-2xl border border-shop-border p-4 text-sm">
                            <p className="font-semibold">
                                {address.label || resolveLanguageKey(`type.${address.type}`)}
                                {address.isDefault ? (
                                    <span className="ml-2 text-xs font-medium text-shop-accent">{resolveLanguageKey("default")}</span>
                                ) : null}
                            </p>
                            <p className="mt-1 text-shop-ink-muted">
                                {address.firstName} {address.lastName}
                            </p>
                            <p className="text-shop-ink-muted">{address.street}</p>
                            <p className="text-shop-ink-muted">
                                {[address.city?.name, address.postalCode, address.country?.name].filter(Boolean).join(", ")}
                            </p>
                            {confirmDeleteId === address._id ? (
                                <div className="mt-3 flex flex-wrap items-center gap-3" role="group" aria-label={resolveLanguageKey("confirmDelete")}>
                                    <span className="text-sm font-medium">{resolveLanguageKey("confirmDelete")}</span>
                                    <button type="button" onClick={() => handleDelete(address._id)} className="text-sm font-semibold text-shop-danger underline-offset-4 hover:underline">
                                        {resolveLanguageKey("delete")}
                                    </button>
                                    <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-sm font-medium text-shop-ink-muted underline-offset-4 hover:underline">
                                        {resolveLanguageKey("keep")}
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 flex gap-4">
                                    <button type="button" onClick={() => startEdit(address)} className={SHOP_LINK_CLASS}>
                                        {resolveLanguageKey("edit")}
                                    </button>
                                    <button type="button" onClick={() => setConfirmDeleteId(address._id)} className="text-sm font-medium text-shop-danger underline-offset-4 hover:underline">
                                        {resolveLanguageKey("delete")}
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {showForm ? (
                <form className="flex max-w-lg flex-col gap-4 rounded-2xl border border-shop-border p-5" onSubmit={handleSave} noValidate>
                    <h2 className="font-shop-display text-xl font-semibold">
                        {editingId ? resolveLanguageKey("editTitle") : resolveLanguageKey("createTitle")}
                    </h2>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("form.typeLabel")}
                        <select
                            value={form.type}
                            onChange={(e) => setField("type", e.target.value as (typeof customerAddressTypes)[number])}
                            className={`${SHOP_FIELD_INPUT_CLASS} bg-white`}
                        >
                            {customerAddressTypes.map((type) => (
                                <option key={type} value={type}>{resolveLanguageKey(`type.${type}`)}</option>
                            ))}
                        </select>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className={SHOP_FIELD_LABEL_CLASS}>
                            {resolveLanguageKey("form.firstNameLabel")}
                            <input
                                value={form.firstName}
                                autoComplete="given-name"
                                onChange={(e) => setField("firstName", e.target.value)}
                                className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.firstName && SHOP_FIELD_ERROR_CLASS)}
                            />
                            <ShopFieldError message={fieldErrors.firstName} />
                        </label>
                        <label className={SHOP_FIELD_LABEL_CLASS}>
                            {resolveLanguageKey("form.lastNameLabel")}
                            <input
                                value={form.lastName}
                                autoComplete="family-name"
                                onChange={(e) => setField("lastName", e.target.value)}
                                className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.lastName && SHOP_FIELD_ERROR_CLASS)}
                            />
                            <ShopFieldError message={fieldErrors.lastName} />
                        </label>
                    </div>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("form.streetLabel")}
                        <input
                            value={form.street}
                            autoComplete="street-address"
                            onChange={(e) => setField("street", e.target.value)}
                            className={cn(SHOP_FIELD_INPUT_CLASS, fieldErrors.street && SHOP_FIELD_ERROR_CLASS)}
                        />
                        <ShopFieldError message={fieldErrors.street} />
                    </label>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("form.countryLabel")}
                        <select
                            value={form.country}
                            onChange={(e) => {
                                setForm((prev) => ({...prev, country: e.target.value, city: ""}));
                                setFieldErrors((prev) => {
                                    const next = {...prev};
                                    delete next.country;
                                    delete next.city;
                                    return next;
                                });
                            }}
                            className={cn(SHOP_FIELD_INPUT_CLASS, "bg-white", fieldErrors.country && SHOP_FIELD_ERROR_CLASS)}
                        >
                            <option value="">{resolveLanguageKey("form.countryPlaceholder")}</option>
                            {countries.map((country) => (
                                <option key={country._id} value={country._id}>{country.name}</option>
                            ))}
                        </select>
                        <ShopFieldError message={fieldErrors.country} />
                    </label>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("form.cityLabel")}
                        <select
                            value={form.city}
                            disabled={!form.country}
                            onChange={(e) => setField("city", e.target.value)}
                            className={cn(SHOP_FIELD_INPUT_CLASS, "bg-white", fieldErrors.city && SHOP_FIELD_ERROR_CLASS)}
                        >
                            <option value="">{resolveLanguageKey("form.cityPlaceholder")}</option>
                            {cities.map((city) => (
                                <option key={city._id} value={city._id}>{city.name}</option>
                            ))}
                        </select>
                        <ShopFieldError message={fieldErrors.city} />
                    </label>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("form.postalCodeLabel")}
                        <input
                            value={form.postalCode ?? ""}
                            autoComplete="postal-code"
                            onChange={(e) => setField("postalCode", e.target.value)}
                            className={SHOP_FIELD_INPUT_CLASS}
                        />
                    </label>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("form.phoneLabel")}
                        <input
                            type="tel"
                            value={form.phone ?? ""}
                            autoComplete="tel"
                            onChange={(e) => setField("phone", e.target.value)}
                            className={SHOP_FIELD_INPUT_CLASS}
                        />
                    </label>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("form.labelLabel")}
                        <input
                            value={form.label ?? ""}
                            onChange={(e) => setField("label", e.target.value)}
                            className={SHOP_FIELD_INPUT_CLASS}
                        />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-shop-ink">
                        <input
                            type="checkbox"
                            checked={Boolean(form.isDefault)}
                            onChange={(e) => setField("isDefault", e.target.checked)}
                        />
                        {resolveLanguageKey("form.isDefaultLabel")}
                    </label>
                    <div className="flex gap-3">
                        <button type="submit" disabled={saving} className={SHOP_SUBMIT_CLASS}>
                            {saving ? resolveLanguageKey("saving") : resolveLanguageKey("save")}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                            }}
                            className={SHOP_BUTTON_SECONDARY_CLASS}
                        >
                            {resolveLanguageKey("cancel")}
                        </button>
                    </div>
                </form>
            ) : null}
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(AddressPageInner);
