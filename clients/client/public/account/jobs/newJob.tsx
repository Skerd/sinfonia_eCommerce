import {useEffect, useMemo, useState, type FormEvent} from "react";
import {Link, useNavigate} from "react-router-dom";
import {compose} from "redux";
import {toast} from "sonner";
import {ArrowLeft, ImagePlus, LocateFixed} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import SinglePinMap from "@coreModule/components/viewEngine/widgets/addresses/mapWithPins.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import {
    SHOP_BUTTON_CLASS,
    SHOP_BUTTON_SECONDARY_CLASS,
    SHOP_FIELD_INPUT_CLASS,
    SHOP_FIELD_LABEL_CLASS,
} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {
    ShopListingCategory,
    ShopListingTaxonomyResponse,
} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/jobs/newJob.tsx";

type ShopCountry = {_id: string; name: string; code: string};
type ShopCity = {_id: string; name: string};

/** Where the map opens before the buyer drops a pin (same default as the panel's pin picker). */
const DEFAULT_PIN = {lat: 41.3275, lng: 19.8187};

const EMPTY_FORM = {
    title: "",
    description: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    street: "",
    postalCode: "",
    country: "",
    city: "",
};

/** Parents first, each followed by its children, for an indented select. */
function orderedCategories(categories: ShopListingCategory[]): {category: ShopListingCategory; depth: number}[] {
    const result: {category: ShopListingCategory; depth: number}[] = [];
    const visit = (parent: string | undefined, depth: number) => {
        for (const category of categories.filter(item => item.parent === parent)) {
            result.push({category, depth});
            visit(category._id, depth + 1);
        }
    };
    visit(undefined, 0);
    return result;
}

function NewJobPage({resolveLanguageKey}: WithLanguageType) {
    const navigate = useNavigate();
    const {config} = useShopConfig();
    const [form, setForm] = useState(EMPTY_FORM);
    const [pin, setPin] = useState<{lat: number; lng: number} | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [categories, setCategories] = useState<ShopListingCategory[]>([]);
    const [countries, setCountries] = useState<ShopCountry[]>([]);
    const [cities, setCities] = useState<ShopCity[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [taxonomy, countryList] = await Promise.allSettled([
                apiClient.post<ShopListingTaxonomyResponse>("/api/eCommerceMarketplace/shopListingTaxonomy", {}),
                apiClient.get<{data: ShopCountry[]}>("/api/eCommerce/shopCountries"),
            ]);
            if (cancelled) return;
            setCategories(taxonomy.status === "fulfilled" ? taxonomy.value.data.data.categories : []);
            setCountries(countryList.status === "fulfilled" ? countryList.value.data.data ?? [] : []);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

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

    const imagePreview = useMemo(() => (image ? URL.createObjectURL(image) : undefined), [image]);
    useEffect(() => () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
    }, [imagePreview]);

    const setField = (key: keyof typeof EMPTY_FORM, value: string) => setForm(current => ({...current, [key]: value}));
    const currency = config?.currency;

    function locateMe() {
        navigator.geolocation?.getCurrentPosition(
            position => setPin({lat: position.coords.latitude, lng: position.coords.longitude}),
            () => toast.error(resolveLanguageKey("locationError")),
        );
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (!pin) {
            toast.error(resolveLanguageKey("pinRequired"));
            return;
        }
        if (!image || !currency) return;
        setSubmitting(true);
        const payload = new FormData();
        payload.append("data", JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            category: form.category,
            budgetMin: Number(form.budgetMin),
            budgetMax: Number(form.budgetMax),
            currency: currency._id,
            address: {
                street: form.street.trim(),
                postalCode: form.postalCode.trim(),
                country: form.country,
                city: form.city,
                latitude: pin.lat,
                longitude: pin.lng,
            },
        }));
        payload.append("mainImage", image);
        try {
            const res = await apiClient.put<{data: {_id: string}}>("/api/eCommerceMarketplace/taskRequest/createMine", payload);
            navigate(`/account/jobs/${res.data.data._id}?posted=1`);
        } catch (err) {
            handleError(err, {context: "NewJob", showToast: true, fallbackMessage: resolveLanguageKey("submitError")});
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <Link to="/account/jobs" className="inline-flex items-center gap-1.5 self-start text-sm text-shop-ink-muted hover:text-shop-ink">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {resolveLanguageKey("backToJobs")}
            </Link>
            <div className="flex flex-col gap-2">
                <h1 className="font-shop-display text-3xl font-bold tracking-tight">{resolveLanguageKey("title")}</h1>
                <p className="max-w-2xl text-shop-ink-muted">{resolveLanguageKey("lead")}</p>
            </div>

            <form onSubmit={submit} className="flex max-w-3xl flex-col gap-8">
                <section className="flex flex-col gap-4">
                    <h2 className="font-semibold">{resolveLanguageKey("sectionWhat")}</h2>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("titleLabel")}
                        <input required maxLength={200} value={form.title} onChange={event => setField("title", event.target.value)} placeholder={resolveLanguageKey("titlePlaceholder")} className={SHOP_FIELD_INPUT_CLASS} />
                    </label>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("descriptionLabel")}
                        <textarea rows={5} maxLength={5000} value={form.description} onChange={event => setField("description", event.target.value)} placeholder={resolveLanguageKey("descriptionPlaceholder")} className={cn(SHOP_FIELD_INPUT_CLASS, "h-auto py-2.5")} />
                    </label>
                    <label className={SHOP_FIELD_LABEL_CLASS}>
                        {resolveLanguageKey("categoryLabel")}
                        <select required value={form.category} onChange={event => setField("category", event.target.value)} className={SHOP_FIELD_INPUT_CLASS}>
                            <option value="">{resolveLanguageKey("categoryPlaceholder")}</option>
                            {orderedCategories(categories).map(({category, depth}) => (
                                <option key={category._id} value={category._id}>{`${"  ".repeat(depth)}${category.name}`}</option>
                            ))}
                        </select>
                    </label>
                    <div className="flex flex-col gap-1.5 text-sm font-medium">
                        {resolveLanguageKey("imageLabel")}
                        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-shop-border p-4 hover:border-shop-ink">
                            <span className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-shop-cream text-shop-ink-faded">
                                {imagePreview ? <img src={imagePreview} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6" aria-hidden />}
                            </span>
                            <span className="font-normal text-shop-ink-muted">{image?.name ?? resolveLanguageKey("imageHint")}</span>
                            <input required type="file" accept="image/*" className="sr-only" onChange={event => setImage(event.target.files?.[0] ?? null)} />
                        </label>
                    </div>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="font-semibold">{resolveLanguageKey("sectionBudget")}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className={SHOP_FIELD_LABEL_CLASS}>
                            {resolveLanguageKey("budgetMinLabel").replace("{currency}", currency?.abbreviation ?? currency?.symbol ?? "")}
                            <input required type="number" min={0} step="0.01" inputMode="decimal" value={form.budgetMin} onChange={event => setField("budgetMin", event.target.value)} className={SHOP_FIELD_INPUT_CLASS} />
                        </label>
                        <label className={SHOP_FIELD_LABEL_CLASS}>
                            {resolveLanguageKey("budgetMaxLabel").replace("{currency}", currency?.abbreviation ?? currency?.symbol ?? "")}
                            <input required type="number" min={0} step="0.01" inputMode="decimal" value={form.budgetMax} onChange={event => setField("budgetMax", event.target.value)} className={SHOP_FIELD_INPUT_CLASS} />
                        </label>
                    </div>
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="font-semibold">{resolveLanguageKey("sectionWhere")}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className={cn(SHOP_FIELD_LABEL_CLASS, "sm:col-span-2")}>
                            {resolveLanguageKey("streetLabel")}
                            <input required maxLength={200} value={form.street} onChange={event => setField("street", event.target.value)} className={SHOP_FIELD_INPUT_CLASS} />
                        </label>
                        <label className={SHOP_FIELD_LABEL_CLASS}>
                            {resolveLanguageKey("countryLabel")}
                            <select required value={form.country} onChange={event => setForm(current => ({...current, country: event.target.value, city: ""}))} className={SHOP_FIELD_INPUT_CLASS}>
                                <option value="">{resolveLanguageKey("selectPlaceholder")}</option>
                                {countries.map(country => <option key={country._id} value={country._id}>{country.name}</option>)}
                            </select>
                        </label>
                        <label className={SHOP_FIELD_LABEL_CLASS}>
                            {resolveLanguageKey("cityLabel")}
                            <select required disabled={!form.country} value={form.city} onChange={event => setField("city", event.target.value)} className={SHOP_FIELD_INPUT_CLASS}>
                                <option value="">{resolveLanguageKey("selectPlaceholder")}</option>
                                {cities.map(city => <option key={city._id} value={city._id}>{city.name}</option>)}
                            </select>
                        </label>
                        <label className={SHOP_FIELD_LABEL_CLASS}>
                            {resolveLanguageKey("postalCodeLabel")}
                            <input required maxLength={20} value={form.postalCode} onChange={event => setField("postalCode", event.target.value)} className={SHOP_FIELD_INPUT_CLASS} />
                        </label>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className="font-medium">{resolveLanguageKey("pinLabel")}</span>
                            <button type="button" onClick={locateMe} className="inline-flex items-center gap-1.5 font-medium text-shop-accent hover:underline underline-offset-4">
                                <LocateFixed className="h-4 w-4" aria-hidden />
                                {resolveLanguageKey("useMyLocation")}
                            </button>
                        </div>
                        <div className="h-72 overflow-hidden rounded-2xl">
                            <SinglePinMap
                                latitude={pin?.lat ?? DEFAULT_PIN.lat}
                                longitude={pin?.lng ?? DEFAULT_PIN.lng}
                                onPinChange={coords => setPin(coords)}
                            />
                        </div>
                        <p className="text-xs text-shop-ink-muted">{resolveLanguageKey(pin ? "pinSet" : "pinHint")}</p>
                    </div>
                </section>

                <div className="flex flex-wrap gap-3 border-t border-shop-border pt-6">
                    <button type="submit" disabled={submitting || !currency} className={SHOP_BUTTON_CLASS}>
                        {resolveLanguageKey(submitting ? "submitting" : "submit")}
                    </button>
                    <Link to="/account/jobs" className={SHOP_BUTTON_SECONDARY_CLASS}>{resolveLanguageKey("cancel")}</Link>
                </div>
            </form>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(NewJobPage);
