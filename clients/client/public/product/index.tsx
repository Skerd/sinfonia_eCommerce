import {useEffect, useMemo, useState} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {toast} from "sonner";
import {Star} from "lucide-react";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {resolveShopMediaUrl} from "@eCommerceModule/clients/client/public/shared/shopMedia.ts";
import {useShopCart} from "@eCommerceModule/clients/client/public/shared/shopCartContext.tsx";
import {useShopConfig} from "@eCommerceModule/clients/client/public/shared/shopConfigContext.tsx";
import ShopProductCard from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";
import ReviewsSection from "./reviewsSection.tsx";
import type {
    ShopProductDetail,
    ShopProductResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";

function ProductPage() {
    const [searchParams] = useSearchParams();
    const slug = searchParams.get("slug") ?? "";
    const {formatMoney} = useShopConfig();
    const {addItem, signInRequired} = useShopCart();

    const [product, setProduct] = useState<ShopProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariantId, setSelectedVariantId] = useState<string>("");
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
                setProduct(res.data.data);
                setSelectedVariantId(res.data.data.variants[0]?._id ?? "");
                setQuantity(res.data.data.minOrderQty && res.data.data.minOrderQty > 1 ? res.data.data.minOrderQty : 1);
                setActiveImage(res.data.data.mainImage);
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

    const selectedVariant = useMemo(
        () => product?.variants.find(v => v._id === selectedVariantId),
        [product, selectedVariantId],
    );

    const price = selectedVariant?.price ?? product?.price;
    const compareAt = selectedVariant?.compareAtPrice ?? product?.compareAtPrice;
    const galleryImages = useMemo(() => {
        const images = [product?.mainImage, ...(product?.gallery ?? [])].filter((v): v is string => Boolean(v));
        return [...new Set(images)];
    }, [product]);

    async function handleAddToCart() {
        if (!product) return;
        if (signInRequired) {
            toast.error("Please sign in to add items to your cart.");
            return;
        }
        setAdding(true);
        try {
            await addItem(product._id, selectedVariant?._id, quantity);
            toast.success(`Added "${product.title}" to cart`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Could not add to cart");
        } finally {
            setAdding(false);
        }
    }

    if (!slug) {
        return <p className="text-shop-ink-muted">Missing product.</p>;
    }

    if (loading) {
        return (
            <div className="grid gap-8 md:grid-cols-2">
                <div className="aspect-square animate-pulse rounded-xl bg-shop-cream" />
                <div className="space-y-4">
                    <div className="h-8 w-2/3 animate-pulse rounded bg-shop-cream" />
                    <div className="h-5 w-1/3 animate-pulse rounded bg-shop-cream" />
                    <div className="h-24 animate-pulse rounded bg-shop-cream" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="py-16 text-center">
                <p className="text-lg font-medium">Product not found</p>
                <Link to="/products" className="mt-2 inline-block text-sm text-shop-accent hover:underline">
                    Back to products
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-14">
            <div className="grid gap-10 md:grid-cols-2">
                <div className="space-y-3">
                    <div className="aspect-square overflow-hidden rounded-xl bg-shop-cream">
                        {activeImage ? (
                            <img src={resolveShopMediaUrl(activeImage)} alt={product.title} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-shop-ink-faded">No image</div>
                        )}
                    </div>
                    {galleryImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {galleryImages.map(image => (
                                <button
                                    key={image}
                                    onClick={() => setActiveImage(image)}
                                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border ${activeImage === image ? "border-shop-accent" : "border-shop-border"}`}
                                >
                                    <img src={resolveShopMediaUrl(image)} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-5">
                    <div>
                        {product.categories?.length ? (
                            <p className="text-xs uppercase tracking-wide text-shop-ink-faded">
                                {product.categories.map(c => c.name).join(" · ")}
                            </p>
                        ) : null}
                        <h1 className="font-shop-display mt-1 text-3xl font-semibold">{product.title}</h1>
                        {product.ratingCount ? (
                            <p className="mt-1 inline-flex items-center gap-1 text-sm text-shop-ink-muted">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                {product.ratingAverage?.toFixed(1)} · {product.ratingCount} reviews
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-semibold">{formatMoney(price)}</span>
                        {compareAt != null && price != null && compareAt > price && (
                            <span className="text-base text-shop-ink-faded line-through">{formatMoney(compareAt)}</span>
                        )}
                    </div>

                    {product.variants.length > 0 && (
                        <div>
                            <p className="mb-1 text-sm font-medium">Variant</p>
                            <select
                                value={selectedVariantId}
                                onChange={event => setSelectedVariantId(event.target.value)}
                                className="h-10 w-full max-w-xs rounded-md border border-shop-border bg-white px-2 text-sm outline-none focus:border-shop-accent"
                            >
                                {product.variants.map(variant => (
                                    <option key={variant._id} value={variant._id}>
                                        {variant.options?.map(o => `${o.name}: ${o.value}`).join(", ") || variant.sku || variant._id}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-end gap-3">
                        <div>
                            <p className="mb-1 text-sm font-medium">Quantity</p>
                            <input
                                type="number"
                                min={product.minOrderQty ?? 1}
                                max={product.maxOrderQty || undefined}
                                step={product.stepQty || 1}
                                value={quantity}
                                onChange={event => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                                className="h-10 w-24 rounded-md border border-shop-border px-2 text-sm outline-none focus:border-shop-accent"
                            />
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="h-10 rounded-full bg-shop-accent px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {adding ? "Adding…" : "Add to cart"}
                        </button>
                    </div>
                    {signInRequired && (
                        <p className="text-xs text-shop-ink-muted">
                            You need an account to order — sign in from the main app first.
                        </p>
                    )}

                    {product.description && (
                        <div className="prose prose-sm max-w-none border-t border-shop-border pt-5 text-shop-ink-muted">
                            <p className="whitespace-pre-line">{product.description}</p>
                        </div>
                    )}

                    {product.specifications?.length ? (
                        <div className="border-t border-shop-border pt-5">
                            <p className="mb-2 text-sm font-semibold">Specifications</p>
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                {product.specifications.map(spec => (
                                    <div key={spec.label} className="contents">
                                        <dt className="text-shop-ink-faded">{spec.label}</dt>
                                        <dd>{spec.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    ) : null}
                </div>
            </div>

            <ReviewsSection productId={product._id} slug={product.slug} />

            {product.related.length > 0 && (
                <section>
                    <h2 className="font-shop-display mb-4 text-2xl font-semibold">You may also like</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {product.related.map(rel => (
                            <ShopProductCard key={rel._id} product={rel} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default ProductPage;
