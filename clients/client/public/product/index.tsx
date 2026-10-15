import {useEffect, useMemo, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {ChevronRight, ImageOff, Star} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import {useShopCart} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";
import ShopProductCard, {ShopPrice} from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";
import ShopQuantityStepper from "@eCommerceModule/clients/client/public/shared/shopQuantityStepper.tsx";
import {ShopInlineSignIn, SHOP_BUTTON_CLASS, SHOP_LINK_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import ReviewsSection from "./reviewsSection.tsx";
import type {
    ShopProductDetail,
    ShopProductResponse,
    ShopProductVariant,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/product/index.tsx";

type OptionSelection = Record<string, string>;

function optionValue(variant: ShopProductVariant, name: string): string | undefined {
    return variant.options?.find(option => option.name === name)?.value;
}

function selectionOf(variant: ShopProductVariant | undefined): OptionSelection {
    return Object.fromEntries((variant?.options ?? []).map(option => [option.name, option.value]));
}

/** Option names in first-seen order, each with its values in first-seen order. */
function optionGroups(variants: ShopProductVariant[]): {name: string; values: string[]}[] {
    const groups = new Map<string, string[]>();
    for (const variant of variants) {
        for (const option of variant.options ?? []) {
            const values = groups.get(option.name) ?? [];
            if (!values.includes(option.value)) values.push(option.value);
            groups.set(option.name, values);
        }
    }
    return [...groups].map(([name, values]) => ({name, values}));
}

const CHIP_CLASS = "inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors";

function ProductPage({resolveLanguageKey}: WithLanguageType) {
    const [searchParams] = useSearchParams();
    const slug = searchParams.get("slug") ?? "";
    const {addItem, signInRequired, setMiniCartOpen} = useShopCart();

    const [product, setProduct] = useState<ShopProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selection, setSelection] = useState<OptionSelection>({});
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;
        setLoading(true);
        setProduct(null);
        (async () => {
            try {
                const res = await apiClient.post<ShopProductResponse>("/api/eCommerce/shopProduct", {slug});
                if (cancelled) return;
                const next = res.data.data;
                const initial = next.variants.find(variant => variant.inStock !== false) ?? next.variants[0];
                setProduct(next);
                setSelection(selectionOf(initial));
                setSelectedVariantId(initial?._id ?? "");
                setQuantity(Math.max(1, next.minOrderQty ?? 1));
                setActiveImage(initial?.mainImage ?? next.mainImage);
            } catch {
                if (!cancelled) setProduct(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    const groups = useMemo(() => optionGroups(product?.variants ?? []), [product]);
    const selectedVariant = product?.variants.find(variant => variant._id === selectedVariantId);
    const galleryImages = useMemo(() => {
        const images = [product?.mainImage, ...(product?.gallery ?? []), ...(product?.variants.map(variant => variant.mainImage) ?? [])]
            .filter((value): value is string => Boolean(value));
        return [...new Set(images)];
    }, [product]);

    /** Picks a variant and shows its own image when it has one. */
    function chooseVariant(variant: ShopProductVariant) {
        setSelectedVariantId(variant._id);
        setSelection(selectionOf(variant));
        if (variant.mainImage) setActiveImage(variant.mainImage);
    }

    /** The variant matching `selection` with `name` set to `value`, if that combination exists. */
    function variantFor(name: string, value: string): ShopProductVariant | undefined {
        return product?.variants.find(variant =>
            groups.every(group => optionValue(variant, group.name) === (group.name === name ? value : selection[group.name])),
        );
    }

    function selectOption(name: string, value: string) {
        if (!product) return;
        // An impossible combination moves the other options to the closest variant that has this value
        const variant = variantFor(name, value)
            ?? product.variants.find(candidate => optionValue(candidate, name) === value && candidate.inStock !== false)
            ?? product.variants.find(candidate => optionValue(candidate, name) === value);
        if (variant) chooseVariant(variant);
    }

    async function handleAddToCart() {
        if (!product || signInRequired) return;
        setAdding(true);
        try {
            await addItem(product._id, selectedVariant?._id, quantity);
            setMiniCartOpen(true);
        } catch (err) {
            handleError(err, {context: "Product", showToast: true, fallbackMessage: resolveLanguageKey("addError")});
        } finally {
            setAdding(false);
        }
    }

    if (!slug) {
        return <ProductMissing resolveLanguageKey={resolveLanguageKey} />;
    }

    if (loading) {
        return (
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                <div className="aspect-[4/5] animate-pulse rounded-3xl bg-shop-cream" />
                <div className="flex flex-col gap-4 pt-4">
                    <div className="h-4 w-1/4 animate-pulse rounded bg-shop-cream" />
                    <div className="h-10 w-3/4 animate-pulse rounded bg-shop-cream" />
                    <div className="h-8 w-1/3 animate-pulse rounded bg-shop-cream" />
                    <div className="mt-6 h-11 w-full animate-pulse rounded-full bg-shop-cream" />
                </div>
            </div>
        );
    }

    if (!product) {
        return <ProductMissing resolveLanguageKey={resolveLanguageKey} />;
    }

    const price = selectedVariant?.price ?? product.price;
    const compareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
    const inStock = product.variants.length ? selectedVariant?.inStock !== false : product.inStock !== false;
    const minQty = Math.max(1, product.minOrderQty ?? 1);
    const stepQty = Math.max(1, product.stepQty ?? 1);
    const category = product.categories?.[0];
    const plainVariants = product.variants.length > 0 && groups.length === 0;

    return (
        <div className="flex flex-col gap-16 sm:gap-20">
            <div className="flex flex-col gap-6">
                <nav aria-label={resolveLanguageKey("breadcrumb")} className="text-sm text-shop-ink-muted">
                    <ol className="flex flex-wrap items-center gap-1.5">
                        <li><Link to="/" className="hover:text-shop-ink">{resolveLanguageKey("home")}</Link></li>
                        <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
                        <li><Link to="/products" className="hover:text-shop-ink">{resolveLanguageKey("products")}</Link></li>
                        {category && (
                            <>
                                <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
                                <li><Link to={`/products?category=${encodeURIComponent(category.slug)}`} className="hover:text-shop-ink">{category.name}</Link></li>
                            </>
                        )}
                        <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
                        <li aria-current="page" className="max-w-[16rem] truncate text-shop-ink">{product.title}</li>
                    </ol>
                </nav>

                <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
                    <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[5rem_1fr] lg:items-start">
                        <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-shop-cream lg:col-start-2 lg:row-start-1">
                            {activeImage ? (
                                <img src={resolveShopMediaUrl(activeImage)} alt={product.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-shop-ink-faded">
                                    <ImageOff className="h-8 w-8" aria-hidden />
                                    <span className="text-sm">{resolveLanguageKey("noImage")}</span>
                                </div>
                            )}
                        </div>
                        {galleryImages.length > 1 && (
                            <ul className="flex gap-2 overflow-x-auto lg:col-start-1 lg:row-start-1 lg:flex-col lg:overflow-visible">
                                {galleryImages.map((image, index) => (
                                    <li key={image} className="shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setActiveImage(image)}
                                            aria-label={resolveLanguageKey("imageOf")
                                                .replace("{number}", String(index + 1))
                                                .replace("{total}", String(galleryImages.length))}
                                            aria-pressed={activeImage === image}
                                            className={cn(
                                                "block h-20 w-16 overflow-hidden rounded-xl border-2 transition-colors lg:h-24 lg:w-20",
                                                activeImage === image ? "border-shop-ink" : "border-transparent hover:border-shop-border",
                                            )}
                                        >
                                            <img src={resolveShopMediaUrl(image)} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-col gap-7 lg:sticky lg:top-28 lg:self-start">
                        <div className="flex flex-col gap-3">
                            {category && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-shop-ink-faded">{category.name}</p>}
                            <h1 className="font-shop-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{product.title}</h1>
                            {product.ratingCount ? (
                                <a href="#shop-reviews" className="inline-flex items-center gap-1.5 self-start text-sm text-shop-ink-muted hover:text-shop-ink">
                                    <Star className="h-4 w-4 fill-shop-ink text-shop-ink" aria-hidden />
                                    {resolveLanguageKey("ratingSummary")
                                        .replace("{average}", product.ratingAverage?.toFixed(1) ?? "")
                                        .replace("{count}", String(product.ratingCount))}
                                </a>
                            ) : null}
                            <ShopPrice price={price} compareAtPrice={compareAt} size="lg" />
                        </div>

                        {groups.map(group => (
                            <fieldset key={group.name} className="flex flex-col gap-3">
                                <legend className="mb-3 text-sm">
                                    <span className="font-semibold">{group.name}</span>
                                    {selection[group.name] ? <span className="text-shop-ink-muted"> · {selection[group.name]}</span> : null}
                                </legend>
                                <div className="flex flex-wrap gap-2">
                                    {group.values.map(value => {
                                        const candidate = variantFor(group.name, value);
                                        const selected = selection[group.name] === value;
                                        const soldOut = candidate?.inStock === false;
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => selectOption(group.name, value)}
                                                aria-pressed={selected}
                                                aria-label={soldOut ? resolveLanguageKey("optionSoldOut").replace("{value}", value) : value}
                                                className={cn(
                                                    CHIP_CLASS,
                                                    selected ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink",
                                                    (soldOut || !candidate) && !selected && "text-shop-ink-faded line-through decoration-1",
                                                )}
                                            >
                                                {value}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        ))}

                        {plainVariants && (
                            <fieldset className="flex flex-col gap-3">
                                <legend className="mb-3 text-sm font-semibold">{resolveLanguageKey("variant")}</legend>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map(variant => (
                                        <button
                                            key={variant._id}
                                            type="button"
                                            onClick={() => chooseVariant(variant)}
                                            aria-pressed={variant._id === selectedVariantId}
                                            className={cn(
                                                CHIP_CLASS,
                                                variant._id === selectedVariantId ? "border-shop-ink bg-shop-ink text-white" : "border-shop-border hover:border-shop-ink",
                                                variant.inStock === false && variant._id !== selectedVariantId && "text-shop-ink-faded line-through",
                                            )}
                                        >
                                            {variant.title || variant.sku || variant._id}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                        )}

                        <div className="flex flex-col gap-3">
                            <p className={cn("flex items-center gap-2 text-sm font-medium", inStock ? "text-shop-success" : "text-shop-danger")}>
                                <span className={cn("h-2 w-2 rounded-full", inStock ? "bg-shop-success" : "bg-shop-danger")} aria-hidden />
                                {resolveLanguageKey(inStock ? "inStock" : "outOfStock")}
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <ShopQuantityStepper
                                    value={quantity}
                                    min={minQty}
                                    max={product.maxOrderQty || undefined}
                                    step={stepQty}
                                    itemLabel={product.title}
                                    onChange={setQuantity}
                                    disabled={!inStock}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={adding || !inStock || signInRequired}
                                    className={cn(SHOP_BUTTON_CLASS, "h-11 flex-1")}
                                >
                                    {!inStock ? resolveLanguageKey("outOfStock") : adding ? resolveLanguageKey("adding") : resolveLanguageKey("addToCart")}
                                </button>
                            </div>
                            {minQty > 1 || stepQty > 1 ? (
                                <p className="text-xs text-shop-ink-muted">
                                    {resolveLanguageKey("quantityRule").replace("{min}", String(minQty)).replace("{step}", String(stepQty))}
                                </p>
                            ) : null}
                            {signInRequired && <ShopInlineSignIn next={`/product?slug=${encodeURIComponent(slug)}`} />}
                        </div>

                        {product.description && (
                            <section className="flex flex-col gap-2 border-t border-shop-border pt-6">
                                <h2 className="text-sm font-semibold">{resolveLanguageKey("description")}</h2>
                                <p className="whitespace-pre-line text-[15px] leading-relaxed text-shop-ink-muted">{product.description}</p>
                            </section>
                        )}

                        {product.specifications?.length ? (
                            <section className="flex flex-col gap-3 border-t border-shop-border pt-6">
                                <h2 className="text-sm font-semibold">{resolveLanguageKey("specifications")}</h2>
                                <dl className="divide-y divide-shop-border text-sm">
                                    {product.specifications.map(spec => (
                                        <div key={spec.label} className="flex justify-between gap-6 py-2.5">
                                            <dt className="text-shop-ink-muted">{spec.label}</dt>
                                            <dd className="text-right font-medium">{spec.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        ) : null}
                    </div>
                </div>
            </div>

            <ReviewsSection productId={product._id} slug={product.slug} />

            {product.related.length > 0 && (
                <section className="flex flex-col gap-6" aria-labelledby="shop-related">
                    <h2 id="shop-related" className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">{resolveLanguageKey("related")}</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                        {product.related.map(rel => (
                            <ShopProductCard key={rel._id} product={rel} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function ProductMissing({resolveLanguageKey}: Pick<WithLanguageType, "resolveLanguageKey">) {
    return (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h1 className="font-shop-display text-3xl font-semibold">{resolveLanguageKey("notFound")}</h1>
            <p className="text-shop-ink-muted">{resolveLanguageKey("notFoundMessage")}</p>
            <Link to="/products" className={SHOP_LINK_CLASS}>{resolveLanguageKey("backToProducts")}</Link>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ProductPage);
