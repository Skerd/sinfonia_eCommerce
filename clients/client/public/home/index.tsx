import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {useCmsBlocks} from "@eCommerceModule/components/cms/useCmsBlocks.ts";
import CmsBlockRenderer from "@eCommerceModule/components/cms/CmsBlockRenderer.tsx";
import ShopProductCard from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";
import type {
    ShopProductCard as ShopProductCardType,
    ShopProductsResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";

function HomePage() {
    const {blocks} = useCmsBlocks();
    const [featured, setFeatured] = useState<ShopProductCardType[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.post<ShopProductsResponse>("/api/eCommerce/shopProducts", {sort: "featured", limit: 8});
                if (!cancelled) setFeatured(res.data.data ?? []);
            } catch {
                if (!cancelled) setFeatured([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="space-y-12">
            <section className="rounded-2xl bg-shop-cream px-8 py-16 text-center">
                <h1 className="font-shop-display text-4xl font-bold tracking-tight">Discover our catalog</h1>
                <p className="mx-auto mt-3 max-w-xl text-shop-ink-muted">
                    Browse the latest products, curated collections and seasonal offers.
                </p>
                <Link
                    to="/products"
                    className="mt-6 inline-block rounded-full bg-shop-accent px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                    Shop all products
                </Link>
            </section>

            {blocks.length > 0 && (
                <section className="space-y-4">
                    {blocks.map(block => (
                        <CmsBlockRenderer key={block._id} block={block} />
                    ))}
                </section>
            )}

            {featured.length > 0 && (
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-shop-display text-2xl font-semibold">Featured products</h2>
                        <Link to="/products" className="text-sm font-medium text-shop-accent hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {featured.map(product => (
                            <ShopProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default HomePage;
