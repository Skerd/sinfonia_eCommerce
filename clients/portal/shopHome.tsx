import {compose} from "redux";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {useCmsBlocks} from "@eCommerceModule/components/cms/useCmsBlocks.ts";
import CmsBlockRenderer from "@eCommerceModule/components/cms/CmsBlockRenderer.tsx";
import type {ShopCategory, ShopTaxonomyResponse} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import {uniqueBySlug} from "./shopCategories.ts";

/** The shop's part of the home page: the company's own CMS blocks, then its top categories into the catalog. */
function ShopHome({resolveLanguageKey}: WithLanguageType) {
    const {blocks} = useCmsBlocks();
    const [categories, setCategories] = useState<ShopCategory[]>([]);

    useEffect(() => {
        let cancelled = false;
        apiClient.post<ShopTaxonomyResponse>("/api/eCommerce/shopTaxonomy", {})
            .then((res) => { if (!cancelled) setCategories(uniqueBySlug(res.data.data.categories.filter((category) => !category.parent))); })
            .catch(() => undefined);
        return () => { cancelled = true; };
    }, []);

    return (
        <>
            {blocks.map((block, index) => (
                <CmsBlockRenderer key={block._id} block={block} headingLevel={index === 0 ? "h1" : "h2"} />
            ))}
            {categories.length > 0 ? (
                <section className="flex flex-col gap-5" aria-labelledby="shop-home-categories">
                    <h2 id="shop-home-categories" className="font-display text-2xl font-bold tracking-tight">{resolveLanguageKey("categoriesTitle")}</h2>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <Button key={category._id} asChild variant="outline" size="lg" className="px-4">
                                <Link to={`/?${new URLSearchParams({kind: "product", "f.category": category.slug})}`}>{category.name}</Link>
                            </Button>
                        ))}
                    </div>
                </section>
            ) : null}
        </>
    );
}

export default compose(withLanguage("src/modules/eCommerce/clients/portal/shopHome.tsx"))(ShopHome);
