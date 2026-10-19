import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {compose} from "redux";
import {ArrowRight} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {useCmsBlocks} from "@eCommerceModule/components/cms/useCmsBlocks.ts";
import CmsBlockRenderer from "@eCommerceModule/components/cms/CmsBlockRenderer.tsx";
import ShopProductCard from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";
import ShopListingCard from "@eCommerceModule/clients/client/public/shared/shopListingCard.tsx";
import ShopBlogCard from "@eCommerceModule/clients/client/public/shared/shopBlogCard.tsx";
import {SHOP_BUTTON_CLASS, SHOP_LINK_CLASS} from "@eCommerceModule/clients/client/public/shared/shopAuthChrome.tsx";
import type {
    ShopCategory,
    ShopProductCard as ShopProductCardType,
    ShopProductsResponse,
    ShopTaxonomyResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import type {
    ShopListingCard as ShopListingCardType,
    ShopListingsResponse,
} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";
import type {
    PublicBlogFormResponseType,
    PublicBlogPostItem,
} from "armonia/src/modules/core/api/auxiliary/public/blog/blog.form.response.type.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/home/index.tsx";

const HERO_TYPES = new Set(["hero_banner", "slider"]);
const PRODUCT_STRIP_TYPES = new Set(["featured_collection", "flash_sale", "trending", "best_sellers", "category_showcase"]);

function HomePage({resolveLanguageKey}: WithLanguageType) {
    const {blocks, loading: blocksLoading} = useCmsBlocks();
    const [featured, setFeatured] = useState<ShopProductCardType[]>([]);
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [services, setServices] = useState<ShopListingCardType[]>([]);
    const [posts, setPosts] = useState<PublicBlogPostItem[]>([]);
    // The merchant's first hero heads the page; without one the built-in hero does
    const firstHeroId = blocks.find(block => HERO_TYPES.has(block.type))?._id;
    const showDefaultHero = !blocksLoading && !firstHeroId;
    // The built-in featured grid only fills in when the merchant's blocks show no products
    const showFeatured = !blocksLoading && !blocks.some(block => PRODUCT_STRIP_TYPES.has(block.type));

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [productsRes, taxonomyRes] = await Promise.all([
                    apiClient.post<ShopProductsResponse>("/api/eCommerce/shopProducts", {sort: "featured", limit: 8}),
                    apiClient.post<ShopTaxonomyResponse>("/api/eCommerce/shopTaxonomy", {}),
                ]);
                if (cancelled) return;
                setFeatured(productsRes.data.data ?? []);
                setCategories((taxonomyRes.data.data?.categories ?? []).filter(category => !category.parent));
            } catch {
                if (!cancelled) {
                    setFeatured([]);
                    setCategories([]);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Services and stories are optional sections: either failing leaves the rest of the page intact
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [servicesRes, blogRes] = await Promise.allSettled([
                apiClient.post<ShopListingsResponse>("/api/eCommerceMarketplace/shopListings", {limit: 4}),
                apiClient.post<PublicBlogFormResponseType>("/api/auxiliary/public/blog", {limit: 3}),
            ]);
            if (cancelled) return;
            setServices(servicesRes.status === "fulfilled" ? servicesRes.value.data.data ?? [] : []);
            setPosts(blogRes.status === "fulfilled" ? blogRes.value.data.posts ?? [] : []);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="flex flex-col gap-16 sm:gap-20">
            {showDefaultHero && (
                <section className="rounded-3xl bg-shop-cream px-6 py-16 sm:px-12 sm:py-24">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-shop-ink-faded">{resolveLanguageKey("heroEyebrow")}</p>
                    <h1 className="mt-4 max-w-3xl font-shop-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                        {resolveLanguageKey("heroTitle")}
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-shop-ink-muted">{resolveLanguageKey("heroSubtitle")}</p>
                    <Link to="/products" className={cn(SHOP_BUTTON_CLASS, "mt-8")}>
                        {resolveLanguageKey("heroCta")}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                </section>
            )}

            {blocks.map(block => (
                <CmsBlockRenderer key={block._id} block={block} headingLevel={block._id === firstHeroId ? "h1" : "h2"} />
            ))}

            {categories.length > 0 && (
                <section className="flex flex-col gap-6" aria-labelledby="shop-home-categories">
                    <h2 id="shop-home-categories" className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">
                        {resolveLanguageKey("categoriesTitle")}
                    </h2>
                    <ul className="flex flex-wrap gap-3">
                        {categories.map(category => (
                            <li key={category._id}>
                                <Link
                                    to={`/products?category=${encodeURIComponent(category.slug)}`}
                                    className="inline-flex h-11 items-center rounded-full border border-shop-border px-5 text-[15px] font-medium transition-colors hover:border-shop-ink hover:bg-shop-cream"
                                >
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {showFeatured && featured.length > 0 && (
                <section className="flex flex-col gap-6" aria-labelledby="shop-home-featured">
                    <div className="flex items-end justify-between gap-4">
                        <h2 id="shop-home-featured" className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">
                            {resolveLanguageKey("featuredTitle")}
                        </h2>
                        <Link to="/products" className={cn(SHOP_LINK_CLASS, "inline-flex items-center gap-1 text-sm")}>
                            {resolveLanguageKey("viewAll")}
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                        {featured.map(product => (
                            <ShopProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {services.length > 0 && (
                <section className="flex flex-col gap-6" aria-labelledby="shop-home-services">
                    <div className="flex items-end justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 id="shop-home-services" className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">
                                {resolveLanguageKey("servicesTitle")}
                            </h2>
                            <p className="text-shop-ink-muted">{resolveLanguageKey("servicesLead")}</p>
                        </div>
                        <Link to="/services" className={cn(SHOP_LINK_CLASS, "inline-flex shrink-0 items-center gap-1 text-sm")}>
                            {resolveLanguageKey("viewAll")}
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                        {services.map(listing => (
                            <ShopListingCard key={listing._id} listing={listing} />
                        ))}
                    </div>
                </section>
            )}

            {posts.length > 0 && (
                <section className="flex flex-col gap-6" aria-labelledby="shop-home-blog">
                    <div className="flex items-end justify-between gap-4">
                        <h2 id="shop-home-blog" className="font-shop-display text-2xl font-semibold tracking-tight sm:text-3xl">
                            {resolveLanguageKey("blogTitle")}
                        </h2>
                        <Link to="/blog" className={cn(SHOP_LINK_CLASS, "inline-flex shrink-0 items-center gap-1 text-sm")}>
                            {resolveLanguageKey("blogAll")}
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </div>
                    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map(post => (
                            <ShopBlogCard key={post._id} post={post} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(HomePage);
