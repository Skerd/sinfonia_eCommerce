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
import {Button} from "@coreModule/components/ui/button.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {NativeSelect} from "@coreModule/components/ui/native-select.tsx";
import {FieldError} from "@coreModule/components/ui/field.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";

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
        return <div className="h-48 animate-pulse rounded-xl bg-muted" />;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-semibold">{resolveLanguageKey("title")}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{resolveLanguageKey("subtitle")}</p>
                </div>
                <Button size="lg" type="button" onClick={startCreate} >
                    {resolveLanguageKey("add")}
                </Button>
            </div>

            {addresses.length === 0 && !showForm ? (
                <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
                    {resolveLanguageKey("empty")}
                </div>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                        <li key={address._id} className="rounded-2xl border border-border p-4 text-sm">
                            <p className="font-semibold">
                                {address.label || resolveLanguageKey(`type.${address.type}`)}
                                {address.isDefault ? (
                                    <span className="ml-2 text-xs font-medium text-primary">{resolveLanguageKey("default")}</span>
                                ) : null}
                            </p>
                            <p className="mt-1 text-muted-foreground">
                                {address.firstName} {address.lastName}
                            </p>
                            <p className="text-muted-foreground">{address.street}</p>
                            <p className="text-muted-foreground">
                                {[address.city?.name, address.postalCode, address.country?.name].filter(Boolean).join(", ")}
                            </p>
                            {confirmDeleteId === address._id ? (
                                <div className="mt-3 flex flex-wrap items-center gap-3" role="group" aria-label={resolveLanguageKey("confirmDelete")}>
                                    <span className="text-sm font-medium">{resolveLanguageKey("confirmDelete")}</span>
                                    <Button variant="link" type="button" onClick={() => handleDelete(address._id)} className="h-auto p-0 font-semibold text-destructive">
                                        {resolveLanguageKey("delete")}
                                    </Button>
                                    <Button variant="link" type="button" onClick={() => setConfirmDeleteId(null)} className="h-auto p-0 text-muted-foreground">
                                        {resolveLanguageKey("keep")}
                                    </Button>
                                </div>
                            ) : (
                                <div className="mt-3 flex gap-4">
                                    <Button variant="link" type="button" onClick={() => startEdit(address)} className="h-auto p-0">
                                        {resolveLanguageKey("edit")}
                                    </Button>
                                    <Button variant="link" type="button" onClick={() => setConfirmDeleteId(address._id)} className="h-auto p-0 text-destructive">
                                        {resolveLanguageKey("delete")}
                                    </Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {showForm ? (
                <form className="flex max-w-lg flex-col gap-4 rounded-2xl border border-border p-5" onSubmit={handleSave} noValidate>
                    <h2 className="font-display text-xl font-semibold">
                        {editingId ? resolveLanguageKey("editTitle") : resolveLanguageKey("createTitle")}
                    </h2>
                    <Label className="flex-col items-stretch gap-1.5">
                        {resolveLanguageKey("form.typeLabel")}
                        <NativeSelect
              value={form.type}
              onChange={(e) => setField("type", e.target.value as (typeof customerAddressTypes)[number])}
              className="w-full bg-card"
            >
                            {customerAddressTypes.map((type) => (
                                <option key={type} value={type}>{resolveLanguageKey(`type.${type}`)}</option>
                            ))}
                        </NativeSelect>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        <Label className="flex-col items-stretch gap-1.5">
                            {resolveLanguageKey("form.firstNameLabel")}
                            <Input
                value={form.firstName}
                autoComplete="given-name"
                onChange={(e) => setField("firstName", e.target.value)}
                aria-invalid={fieldErrors.firstName ? true : undefined}
              />
                            <FieldError>{fieldErrors.firstName}</FieldError>
                        </Label>
                        <Label className="flex-col items-stretch gap-1.5">
                            {resolveLanguageKey("form.lastNameLabel")}
                            <Input
                value={form.lastName}
                autoComplete="family-name"
                onChange={(e) => setField("lastName", e.target.value)}
                aria-invalid={fieldErrors.lastName ? true : undefined}
              />
                            <FieldError>{fieldErrors.lastName}</FieldError>
                        </Label>
                    </div>
                    <Label className="flex-col items-stretch gap-1.5">
                        {resolveLanguageKey("form.streetLabel")}
                        <Input
              value={form.street}
              autoComplete="street-address"
              onChange={(e) => setField("street", e.target.value)}
              aria-invalid={fieldErrors.street ? true : undefined}
            />
                        <FieldError>{fieldErrors.street}</FieldError>
                    </Label>
                    <Label className="flex-col items-stretch gap-1.5">
                        {resolveLanguageKey("form.countryLabel")}
                        <NativeSelect
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
              className="w-full bg-card" aria-invalid={fieldErrors.country ? true : undefined}
            >
                            <option value="">{resolveLanguageKey("form.countryPlaceholder")}</option>
                            {countries.map((country) => (
                                <option key={country._id} value={country._id}>{country.name}</option>
                            ))}
                        </NativeSelect>
                        <FieldError>{fieldErrors.country}</FieldError>
                    </Label>
                    <Label className="flex-col items-stretch gap-1.5">
                        {resolveLanguageKey("form.cityLabel")}
                        <NativeSelect
              value={form.city}
              disabled={!form.country}
              onChange={(e) => setField("city", e.target.value)}
              className="w-full bg-card" aria-invalid={fieldErrors.city ? true : undefined}
            >
                            <option value="">{resolveLanguageKey("form.cityPlaceholder")}</option>
                            {cities.map((city) => (
                                <option key={city._id} value={city._id}>{city.name}</option>
                            ))}
                        </NativeSelect>
                        <FieldError>{fieldErrors.city}</FieldError>
                    </Label>
                    <Label className="flex-col items-stretch gap-1.5">
                        {resolveLanguageKey("form.postalCodeLabel")}
                        <Input
              value={form.postalCode ?? ""}
              autoComplete="postal-code"
              onChange={(e) => setField("postalCode", e.target.value)}
              
            />
                    </Label>
                    <Label className="flex-col items-stretch gap-1.5">
                        {resolveLanguageKey("form.phoneLabel")}
                        <Input
              type="tel"
              value={form.phone ?? ""}
              autoComplete="tel"
              onChange={(e) => setField("phone", e.target.value)}
              
            />
                    </Label>
                    <Label className="flex-col items-stretch gap-1.5">
                        {resolveLanguageKey("form.labelLabel")}
                        <Input
              value={form.label ?? ""}
              onChange={(e) => setField("label", e.target.value)}
              
            />
                    </Label>
                    <Label>
                        <Checkbox
                            checked={Boolean(form.isDefault)}
                            onCheckedChange={(checked) => setField("isDefault", checked === true)}
                        />
                        {resolveLanguageKey("form.isDefaultLabel")}
                    </Label>
                    <div className="flex gap-3">
                        <Button size="lg" type="submit" disabled={saving} className="w-full">
                            {saving ? resolveLanguageKey("saving") : resolveLanguageKey("save")}
                        </Button>
                        <Button variant="outline" size="lg"
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                            }}
                            
                        >
                            {resolveLanguageKey("cancel")}
                        </Button>
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
