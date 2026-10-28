import {useEffect, useMemo, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {compose} from "redux";
import {Star} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import {useShopCart} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";
import ShopProductCard, {ShopPrice} from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";
import ShopQuantityStepper from "@eCommerceModule/clients/client/public/shared/shopQuantityStepper.tsx";
import {ShopInlineSignIn} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import ShopSellerCard from "@eCommerceModule/clients/client/public/shared/shopSellerCard.tsx";
import ReviewsSection from "./reviewsSection.tsx";
import {shopProductHref} from "@eCommerceModule/clients/client/public/shared/shopProductHref.ts";
import {useSectionBase} from "@coreModule/clients/portal/shared/sectionBase.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import DetailPage, {DetailBelow, DetailHeading, DetailSection, DetailSpecs, DetailStatus, DetailText} from "@coreModule/clients/portal/shared/detailPage.tsx";
import DetailGallery from "@coreModule/clients/portal/shared/detailGallery.tsx";
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

function ProductPage({resolveLanguageKey}: WithLanguageType) {
    const base = useSectionBase();
    const [searchParams] = useSearchParams();
    const productId = searchParams.get("id") ?? "";
    const slug = searchParams.get("slug") ?? "";
    const sellerCompanyId = searchParams.get("seller") ?? "";
    const {addItem, signInRequired, setMiniCartOpen} = useShopCart();

    const [product, setProduct] = useState<ShopProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selection, setSelection] = useState<OptionSelection>({});
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (!productId && !slug) return;
        let cancelled = false;
        setLoading(true);
        setProduct(null);
        (async () => {
            try {
                const res = await apiClient.post<ShopProductResponse>("/api/eCommerce/shopProduct", {
                    ...(productId ? {id: productId} : {}),
                    ...(slug ? {slug} : {}),
                    ...(sellerCompanyId ? {sellerCompanyId} : {}),
                });
                if (cancelled) return;
                const next = res.data.data;
                const initial = next.variants.find(variant => variant.inStock !== false) ?? next.variants[0];
                setProduct(next);
                setSelection(selectionOf(initial));
                setSelectedVariantId(initial?._id ?? "");
                setQuantity(Math.max(1, next.minOrderQty ?? 1));
                setActiveImage(resolveShopMediaUrl(initial?.mainImage ?? next.mainImage));
            } catch {
                if (!cancelled) setProduct(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [productId, slug, sellerCompanyId]);

    const groups = useMemo(() => optionGroups(product?.variants ?? []), [product]);
    const selectedVariant = product?.variants.find(variant => variant._id === selectedVariantId);
    const galleryImages = useMemo(() => {
        return [product?.mainImage, ...(product?.gallery ?? []), ...(product?.variants.map(variant => variant.mainImage) ?? [])]
            .map(resolveShopMediaUrl)
            .filter((value): value is string => Boolean(value));
    }, [product]);

    /** Picks a variant and shows its own image when it has one. */
    function chooseVariant(variant: ShopProductVariant) {
        setSelectedVariantId(variant._id);
        setSelection(selectionOf(variant));
        if (variant.mainImage) setActiveImage(resolveShopMediaUrl(variant.mainImage));
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

    if (!productId && !slug) {
        return <ProductMissing resolveLanguageKey={resolveLanguageKey} />;
    }

    if (loading) {
        return (
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]" aria-busy="true" aria-label={resolveLanguageKey("loading")}>
                <div className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />
                <div className="flex flex-col gap-4 pt-4">
                    <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                    <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
                    <div className="mt-6 h-11 w-full animate-pulse rounded-full bg-muted" />
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
        <DetailPage
            kind="product"
            title={product.title}
            crumbs={category ? [{label: category.name, to: `/?${new URLSearchParams({kind: "product", "f.category": category.slug})}`}] : []}
            media={<DetailGallery title={product.title} images={galleryImages} active={activeImage} onActiveChange={setActiveImage} />}
            below={(
                <>
                    <ReviewsSection productId={product._id} slug={product.slug} sellerCompanyId={product.seller?._id} />
                    {product.related.length > 0 && (
                        <DetailBelow title={resolveLanguageKey("related")}>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                                {product.related.map(rel => (
                                    <ShopProductCard key={rel._id} product={rel} />
                                ))}
                            </div>
                        </DetailBelow>
                    )}
                </>
            )}
        >
            <DetailHeading eyebrow={category?.name} title={product.title}>
                {product.ratingCount ? (
                    <a href="#shop-reviews" className="inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground">
                        <Star className="h-4 w-4 fill-foreground text-foreground" aria-hidden />
                        {resolveLanguageKey("ratingSummary")
                            .replace("{average}", product.ratingAverage?.toFixed(1) ?? "")
                            .replace("{count}", String(product.ratingCount))}
                    </a>
                ) : null}
                <ShopPrice price={price} compareAtPrice={compareAt} currency={product.currency} size="lg" />
                <ShopSellerCard seller={product.seller} kind="product" size="card" className="mt-1" />
            </DetailHeading>

            {groups.map(group => (
                <fieldset key={group.name} className="flex flex-col gap-3">
                    <legend className="mb-3 text-sm">
                        <span className="font-semibold">{group.name}</span>
                        {selection[group.name] ? <span className="text-muted-foreground"> · {selection[group.name]}</span> : null}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                        {group.values.map(value => {
                            const candidate = variantFor(group.name, value);
                            const selected = selection[group.name] === value;
                            const soldOut = candidate?.inStock === false;
                            return (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={selected ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => selectOption(group.name, value)}
                                    aria-pressed={selected}
                                    aria-label={soldOut ? resolveLanguageKey("optionSoldOut").replace("{value}", value) : value}
                                    className={cn((soldOut || !candidate) && !selected && "text-muted-foreground line-through decoration-1")}
                                >
                                    {value}
                                </Button>
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
                            <Button
                                key={variant._id}
                                type="button"
                                onClick={() => chooseVariant(variant)}
                                aria-pressed={variant._id === selectedVariantId}
                                variant={variant._id === selectedVariantId ? "default" : "outline"}
                                size="lg"
                                className={cn(variant.inStock === false && variant._id !== selectedVariantId && "text-muted-foreground line-through")}
                            >
                                {variant.title || variant.sku || variant._id}
                            </Button>
                        ))}
                    </div>
                </fieldset>
            )}

            <div className="flex flex-col gap-3">
                <p className={cn("flex items-center gap-2 text-sm font-medium", inStock ? "text-success" : "text-destructive")}>
                    <span className={cn("h-2 w-2 rounded-full", inStock ? "bg-success" : "bg-destructive")} aria-hidden />
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
                    <Button size="lg"
                        type="button"
                        onClick={handleAddToCart}
                        disabled={adding || !inStock || signInRequired}
                        className="h-11 flex-1"
                    >
                        {!inStock ? resolveLanguageKey("outOfStock") : adding ? resolveLanguageKey("adding") : resolveLanguageKey("addToCart")}
                    </Button>
                </div>
                {minQty > 1 || stepQty > 1 ? (
                    <p className="text-xs text-muted-foreground">
                        {resolveLanguageKey("quantityRule").replace("{min}", String(minQty)).replace("{step}", String(stepQty))}
                    </p>
                ) : null}
                {signInRequired && product && (
                    <ShopInlineSignIn next={shopProductHref(base, product)} />
                )}
            </div>

            {product.description && (
                <DetailSection title={resolveLanguageKey("description")}>
                    <DetailText>{product.description}</DetailText>
                </DetailSection>
            )}

            {product.specifications?.length ? (
                <DetailSection title={resolveLanguageKey("specifications")}>
                    <DetailSpecs rows={product.specifications} />
                </DetailSection>
            ) : null}
        </DetailPage>
    );
}

function ProductMissing({resolveLanguageKey}: Pick<WithLanguageType, "resolveLanguageKey">) {
    const base = useSectionBase();
    return (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h1 className="font-display text-3xl font-semibold">{resolveLanguageKey("notFound")}</h1>
            <p className="text-muted-foreground">{resolveLanguageKey("notFoundMessage")}</p>
            <Button asChild variant="link" className="h-auto p-0"><Link to={`${base}/products`}>{resolveLanguageKey("backToProducts")}</Link></Button>
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ProductPage);
