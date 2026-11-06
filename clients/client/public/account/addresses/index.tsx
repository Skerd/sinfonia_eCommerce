import {useEffect, useState, type FormEvent} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
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

const MY_ADDRESSES_URL = "/api/eCommerce/customerAddress/my";
const ADDRESSES_REQUEST: HttpRequest = {method: "POST", url: MY_ADDRESSES_URL};
const CREATE_ADDRESS_REQUEST: HttpRequest = {method: "PUT", url: MY_ADDRESSES_URL};
const EDIT_ADDRESS_REQUEST: HttpRequest = {method: "PATCH", url: MY_ADDRESSES_URL};
const DELETE_ADDRESS_REQUEST: HttpRequest = {method: "DELETE", url: MY_ADDRESSES_URL};
const COUNTRIES_REQUEST: HttpRequest = {method: "GET", url: "/api/eCommerce/shopCountries"};
const CITIES_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/shopCities"};

function AddressPageInner({resolveLanguageKey, languageCode}: WithLanguageType) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<MyCustomerAddressCreateFormType>(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [showForm, setShowForm] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const loadError = (err: unknown) => handleError(err, {context: "Shop addresses", showToast: true, fallbackMessage: resolveLanguageKey("loadError")});
    const [addressesCount, setAddressesCount] = useState(1);
    const loadAddresses = () => setAddressesCount((count) => count + 1);
    const addressesRequest = useHttpRequest<{data: CustomerAddress[]}>(ADDRESSES_REQUEST, {}, addressesCount, true, {error: loadError});
    const countriesRequest = useHttpRequest<{data: ShopCountry[]}>(COUNTRIES_REQUEST, {}, 1, true, {error: loadError});
    const addresses: CustomerAddress[] = addressesRequest.data?.data ?? [];
    const countries: ShopCountry[] = countriesRequest.data?.data ?? [];
    // The page skeleton covers the first load only; reloads after a save keep the list on screen.
    const loading = (addressesRequest.loading && !addressesRequest.data) || countriesRequest.loading;

    const [citiesCount, setCitiesCount] = useState(0);
    useEffect(() => {
        if (form.country) setCitiesCount((count) => count + 1);
    }, [form.country]);
    const citiesRequest = useHttpRequest<{data: ShopCity[]}>(CITIES_REQUEST, {countryId: form.country}, citiesCount);
    const cities: ShopCity[] = form.country && !citiesRequest.error ? citiesRequest.data?.data ?? [] : [];

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

    const saveLifecycle = {
        success: () => {
            loadAddresses();
            setShowForm(false);
            setEditingId(null);
            toast.success(resolveLanguageKey("saved"));
        },
        error: (err: unknown) => handleError(err, {context: "Shop addresses", showToast: true, fallbackMessage: resolveLanguageKey("saveError")}),
    };
    const [createCall, setCreateCall] = useState<{body: Record<string, unknown>; count: number}>({body: {}, count: 0});
    const [editCall, setEditCall] = useState<{body: Record<string, unknown>; count: number}>({body: {}, count: 0});
    const createRequest = useHttpRequest(CREATE_ADDRESS_REQUEST, createCall.body, createCall.count, true, saveLifecycle);
    const editRequest = useHttpRequest(EDIT_ADDRESS_REQUEST, editCall.body, editCall.count, true, saveLifecycle);
    const saving = createRequest.loading || editRequest.loading;

    const [deleteCall, setDeleteCall] = useState({id: "", count: 0});
    useHttpRequest(DELETE_ADDRESS_REQUEST, {_id: deleteCall.id}, deleteCall.count, true, {
        success: () => {
            loadAddresses();
            if (editingId === deleteCall.id) {
                setShowForm(false);
                setEditingId(null);
            }
            toast.success(resolveLanguageKey("deleted"));
        },
        error: (err) => handleError(err, {context: "Shop addresses", showToast: true, fallbackMessage: resolveLanguageKey("deleteError")}),
    });

    const handleSave = (event: FormEvent) => {
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

        const body: Record<string, unknown> = {...parsed.data};
        if (editingId) setEditCall((current) => ({body, count: current.count + 1}));
        else setCreateCall((current) => ({body, count: current.count + 1}));
    };

    const handleDelete = (id: string) => {
        setConfirmDeleteId(null);
        setDeleteCall((current) => ({id, count: current.count + 1}));
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
