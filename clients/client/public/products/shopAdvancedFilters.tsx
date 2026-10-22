import {useEffect, useState, type ReactNode} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {SHOP_FIELD_INPUT_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import type {ShopFacets} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import {
    SHOP_PRODUCT_TYPES,
    type ShopProductsFormType,
    type ShopProductType,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopProducts.form.validator.ts";

const FILTER_CHIP = "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors";

export type ShopFilterSelection = {
    priceMin: string;
    priceMax: string;
    inStock: boolean;
    onSale: boolean;
    brands: string[];
    types: string[];
    attributes: {name: string; value: string}[];
    minRating: string;
};

type ParamUpdate = string | string[] | undefined;

export function clearShopFilterParams(): Record<string, undefined> {
    return {
        minPrice: undefined,
        maxPrice: undefined,
        stock: undefined,
        sale: undefined,
        brand: undefined,
        type: undefined,
        attr: undefined,
        rating: undefined,
    };
}

function readList(params: URLSearchParams, key: string, max: number): string[] {
    const values: string[] = [];
    for (const raw of params.getAll(key)) {
        const value = raw.trim();
        if (!value || value.length > 200 || values.includes(value)) continue;
        values.push(value);
        if (values.length >= max) break;
    }
    return values;
}

function readPrice(value: string | null): string {
    if (!value) return "";
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000_000) return "";
    return String(parsed);
}

function isShopProductType(value: string): value is ShopProductType {
    return SHOP_PRODUCT_TYPES.some(type => type === value);
}

/** URL form is `name|value`. Catalog attribute names do not contain "|". */
function readAttributes(params: URLSearchParams): {name: string; value: string}[] {
    const pairs: {name: string; value: string}[] = [];
    for (const raw of params.getAll("attr")) {
        const splitAt = raw.indexOf("|");
        if (splitAt <= 0 || splitAt >= raw.length - 1) continue;
        const name = raw.slice(0, splitAt);
        const value = raw.slice(splitAt + 1);
        if (!name || !value || pairs.some(pair => pair.name === name && pair.value === value)) continue;
        pairs.push({name, value});
        if (pairs.length >= 40) break;
    }
    return pairs;
}

export function readShopFilterSelection(params: URLSearchParams): ShopFilterSelection {
    const rating = params.get("rating") ?? "";
    return {
        priceMin: readPrice(params.get("minPrice")),
        priceMax: readPrice(params.get("maxPrice")),
        inStock: params.get("stock") === "1",
        onSale: params.get("sale") === "1",
        brands: readList(params, "brand", 40),
        types: readList(params, "type", SHOP_PRODUCT_TYPES.length).filter(isShopProductType),
        attributes: readAttributes(params),
        minRating: rating === "1" || rating === "2" || rating === "3" || rating === "4" || rating === "5" ? rating : "",
    };
}

export function shopFilterCount(selection: ShopFilterSelection): number {
    let count = selection.brands.length + selection.types.length + selection.attributes.length;
    if (selection.priceMin || selection.priceMax) count += 1;
    if (selection.inStock) count += 1;
    if (selection.onSale) count += 1;
    if (selection.minRating) count += 1;
    return count;
}

export function shopFilterQuery(selection: ShopFilterSelection): Pick<
    ShopProductsFormType,
    "priceMin" | "priceMax" | "inStock" | "onSale" | "brands" | "types" | "attributes" | "minRating"
> {
    const query: ReturnType<typeof shopFilterQuery> = {};
    if (selection.priceMin) query.priceMin = Number(selection.priceMin);
    if (selection.priceMax) query.priceMax = Number(selection.priceMax);
    if (selection.inStock) query.inStock = true;
    if (selection.onSale) query.onSale = true;
    if (selection.brands.length > 0) query.brands = selection.brands;
    if (selection.types.length > 0) query.types = selection.types.filter(isShopProductType);
    if (selection.minRating) query.minRating = Number(selection.minRating);
    if (selection.attributes.length > 0) {
        const grouped = new Map<string, string[]>();
        for (const pair of selection.attributes) {
            const values = grouped.get(pair.name) ?? [];
            values.push(pair.value);
            grouped.set(pair.name, values);
        }
        query.attributes = [...grouped.entries()].map(([name, values]) => ({name, values}));
    }
    return query;
}

function priceParam(raw: string): string | undefined {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value < 0 || value > 1_000_000_000) return undefined;
    return String(value);
}

function toggleValue(current: string[], value: string): string[] | undefined {
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    return next.length > 0 ? next : undefined;
}

function withSelected(options: {value: string; count: number}[], selected: string[]): {value: string; count: number}[] {
    const seen = new Set(options.map(option => option.value));
    const extras = selected.filter(value => !seen.has(value)).map(value => ({value, count: 0}));
    const merged = [...options, ...extras];
    if (merged.length < 2 && selected.length === 0) return [];
    return merged;
}

function FilterGroup({title, children}: {title: string; children: ReactNode}) {
    return (
        <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-shop-ink-muted">{title}</legend>
            {children}
        </fieldset>
    );
}

function ChoiceList({
    options,
    isSelected,
    onToggle,
}: {
    options: {value: string; count: number; label: string}[];
    isSelected: (value: string) => boolean;
    onToggle: (value: string) => void;
}) {
    if (options.length <= 8) {
        return (
            <ul className="flex flex-wrap gap-2">
                {options.map(option => {
                    const pressed = isSelected(option.value);
                    return (
                        <li key={option.value}>
                            <button
                                type="button"
                                aria-pressed={pressed}
                                onClick={() => onToggle(option.value)}
                                className={cn(FILTER_CHIP, pressed ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink")}
                            >
                                {option.label}
                                {option.count > 0 && (
                                    <span className={cn("text-xs tabular-nums", pressed ? "text-white/70" : "text-shop-ink-faded")}>{option.count}</span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <ul className="flex max-h-44 flex-col gap-0.5 overflow-y-auto pr-1">
            {options.map(option => (
                <li key={option.value}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-shop-cream">
                        <input
                            type="checkbox"
                            checked={isSelected(option.value)}
                            onChange={() => onToggle(option.value)}
                            className="h-4 w-4 accent-shop-ink"
                        />
                        <span className="min-w-0 flex-1 truncate" title={option.label}>{option.label}</span>
                        {option.count > 0 && <span className="text-xs tabular-nums text-shop-ink-faded">{option.count}</span>}
                    </label>
                </li>
            ))}
        </ul>
    );
}

function PriceField({
    label,
    value,
    onChange,
    onCommit,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onCommit: () => void;
    placeholder?: string;
}) {
    return (
        <label className="min-w-0 flex-1">
            <span className="sr-only">{label}</span>
            <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={value}
                placeholder={placeholder}
                onChange={event => onChange(event.target.value)}
                onBlur={onCommit}
                onKeyDown={event => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        onCommit();
                    }
                }}
                className={cn(SHOP_FIELD_INPUT_CLASS, "h-10")}
            />
        </label>
    );
}

type ShopAdvancedFiltersProps = {
    resolveLanguageKey: WithLanguageType["resolveLanguageKey"];
    facets: ShopFacets | null;
    selection: ShopFilterSelection;
    onChange: (updates: Record<string, ParamUpdate>) => void;
};

export default function ShopAdvancedFilters({resolveLanguageKey, facets, selection, onChange}: ShopAdvancedFiltersProps) {
    const {formatMoney} = useShopConfig();
    const [minInput, setMinInput] = useState(selection.priceMin);
    const [maxInput, setMaxInput] = useState(selection.priceMax);

    useEffect(() => {
        setMinInput(selection.priceMin);
        setMaxInput(selection.priceMax);
    }, [selection.priceMin, selection.priceMax]);

    function commitPrice() {
        let min = priceParam(minInput);
        let max = priceParam(maxInput);
        if (min && max && Number(min) > Number(max)) {
            const swap = min;
            min = max;
            max = swap;
        }
        if ((min ?? "") === selection.priceMin && (max ?? "") === selection.priceMax) return;
        setMinInput(min ?? "");
        setMaxInput(max ?? "");
        onChange({minPrice: min, maxPrice: max, page: undefined});
    }

    function toggleAttribute(name: string, value: string) {
        const current = selection.attributes.map(pair => `${pair.name}|${pair.value}`);
        const encoded = `${name}|${value}`;
        onChange({attr: toggleValue(current, encoded), page: undefined});
    }

    const brands = facets ? withSelected(facets.brands, selection.brands) : [];
    const types = facets ? withSelected(facets.types, selection.types) : [];
    const showInStock = selection.inStock || (facets != null && facets.total > facets.inStock && facets.inStock > 0);
    const showOnSale = selection.onSale || (facets != null && facets.onSale > 0);
    const ratingChoices = ["4", "3"];
    if (selection.minRating && !ratingChoices.includes(selection.minRating)) ratingChoices.unshift(selection.minRating);
    const showRating = Boolean(selection.minRating) || (facets != null && facets.rated > 0);

    return (
        <div id="shop-advanced-filters" role="region" aria-label={resolveLanguageKey("filtersLabel")} className="flex flex-col gap-6 border-t border-shop-border pt-4">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                <FilterGroup title={resolveLanguageKey("price")}>
                    <div className="flex items-center gap-2">
                        <PriceField
                            label={resolveLanguageKey("priceMin")}
                            value={minInput}
                            onChange={setMinInput}
                            onCommit={commitPrice}
                            placeholder={facets?.priceMin != null ? String(facets.priceMin) : undefined}
                        />
                        <span className="shrink-0 text-sm text-shop-ink-faded">{resolveLanguageKey("priceTo")}</span>
                        <PriceField
                            label={resolveLanguageKey("priceMax")}
                            value={maxInput}
                            onChange={setMaxInput}
                            onCommit={commitPrice}
                            placeholder={facets?.priceMax != null ? String(facets.priceMax) : undefined}
                        />
                    </div>
                    {facets?.priceMin != null && facets.priceMax != null && (
                        <p className="text-xs text-shop-ink-faded">
                            {resolveLanguageKey("priceRange")
                                .replace("{min}", formatMoney(facets.priceMin))
                                .replace("{max}", formatMoney(facets.priceMax))}
                        </p>
                    )}
                </FilterGroup>

                {facets == null ? (
                    <div className="flex flex-col gap-3 sm:col-span-2" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                        <div className="h-4 w-24 animate-pulse rounded bg-shop-cream" />
                        <div className="h-9 w-2/3 animate-pulse rounded-full bg-shop-cream" />
                    </div>
                ) : (
                    <>
                        {(showInStock || showOnSale) && (
                            <FilterGroup title={resolveLanguageKey("availability")}>
                                <ul className="flex flex-wrap gap-2">
                                    {showInStock && (
                                        <li>
                                            <button
                                                type="button"
                                                aria-pressed={selection.inStock}
                                                onClick={() => onChange({stock: selection.inStock ? undefined : "1", page: undefined})}
                                                className={cn(FILTER_CHIP, selection.inStock ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink")}
                                            >
                                                {resolveLanguageKey("inStock")}
                                                {facets.inStock > 0 && (
                                                    <span className={cn("text-xs tabular-nums", selection.inStock ? "text-white/70" : "text-shop-ink-faded")}>{facets.inStock}</span>
                                                )}
                                            </button>
                                        </li>
                                    )}
                                    {showOnSale && (
                                        <li>
                                            <button
                                                type="button"
                                                aria-pressed={selection.onSale}
                                                onClick={() => onChange({sale: selection.onSale ? undefined : "1", page: undefined})}
                                                className={cn(FILTER_CHIP, selection.onSale ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink")}
                                            >
                                                {resolveLanguageKey("onSale")}
                                                {facets.onSale > 0 && (
                                                    <span className={cn("text-xs tabular-nums", selection.onSale ? "text-white/70" : "text-shop-ink-faded")}>{facets.onSale}</span>
                                                )}
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </FilterGroup>
                        )}

                        {showRating && (
                            <FilterGroup title={resolveLanguageKey("rating")}>
                                <ul className="flex flex-wrap gap-2">
                                    {ratingChoices.map(rating => {
                                        const pressed = selection.minRating === rating;
                                        return (
                                            <li key={rating}>
                                                <button
                                                    type="button"
                                                    aria-pressed={pressed}
                                                    onClick={() => onChange({rating: pressed ? undefined : rating, page: undefined})}
                                                    className={cn(FILTER_CHIP, pressed ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink")}
                                                >
                                                    {resolveLanguageKey("ratingAtLeast").replace("{rating}", rating)}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </FilterGroup>
                        )}

                        {brands.length > 0 && (
                            <FilterGroup title={resolveLanguageKey("brand")}>
                                <ChoiceList
                                    options={brands.map(option => ({...option, label: option.value}))}
                                    isSelected={value => selection.brands.includes(value)}
                                    onToggle={value => onChange({brand: toggleValue(selection.brands, value), page: undefined})}
                                />
                            </FilterGroup>
                        )}

                        {types.length > 0 && (
                            <FilterGroup title={resolveLanguageKey("productType")}>
                                <ChoiceList
                                    options={types.map(option => ({...option, label: resolveLanguageKey(`type.${option.value}`)}))}
                                    isSelected={value => selection.types.includes(value)}
                                    onToggle={value => onChange({type: toggleValue(selection.types, value), page: undefined})}
                                />
                            </FilterGroup>
                        )}

                        {facets.attributes.map(group => {
                            const selected = selection.attributes.filter(pair => pair.name === group.name).map(pair => pair.value);
                            const options = withSelected(group.values, selected);
                            if (options.length === 0) return null;
                            return (
                                <FilterGroup key={group.name} title={group.name}>
                                    <ChoiceList
                                        options={options.map(option => ({...option, label: option.value}))}
                                        isSelected={value => selected.includes(value)}
                                        onToggle={value => toggleAttribute(group.name, value)}
                                    />
                                </FilterGroup>
                            );
                        })}
                    </>
                )}
            </div>

            {shopFilterCount(selection) > 0 && (
                <button
                    type="button"
                    onClick={() => {
                        setMinInput("");
                        setMaxInput("");
                        onChange({...clearShopFilterParams(), page: undefined});
                    }}
                    className="self-start text-sm font-medium underline underline-offset-4 hover:text-shop-accent"
                >
                    {resolveLanguageKey("clearFilters")}
                </button>
            )}
        </div>
    );
}
