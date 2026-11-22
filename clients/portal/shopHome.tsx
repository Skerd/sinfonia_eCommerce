import {useId} from "react";
import {compose} from "redux";
import {Link, useSearchParams} from "react-router-dom";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {Button} from "@coreModule/components/ui/button.tsx";
import {useCmsBlocks} from "@eCommerceModule/components/cms/useCmsBlocks.ts";
import CmsBlockRenderer from "@eCommerceModule/components/cms/CmsBlockRenderer.tsx";
import type {ShopCategory, ShopTaxonomyResponse} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";
import {CATALOG_FILTER_PREFIX, uniqueBySlug} from "@coreModule/clients/portal/shared/catalogFilters.tsx";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/portal/shopHome.tsx";
const TAXONOMY_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/shopTaxonomy", cache: true};
/** The product catalog's category filter, the one `ShopProductFilters` sets too. */
const CATEGORY_PARAM = `${CATALOG_FILTER_PREFIX}category`;

/**
 * The shop's top categories above the products tab's filters (its catalog intro), each narrowing the products to it:
 * the chosen one is marked, the visitor's search and city stay, and choosing the marked one again shows every category.
 */
function ShopCategories({resolveLanguageKey}: Pick<WithLanguageType, "resolveLanguageKey">) {
    const headingId = useId();
    const [params] = useSearchParams();
    const taxonomy = useHttpRequest<ShopTaxonomyResponse>(TAXONOMY_REQUEST, {}, 1);
    const categories: ShopCategory[] = uniqueBySlug((taxonomy.data?.data.categories ?? []).filter((category) => !category.parent));
    if (categories.length === 0) return null;

    const chosen = params.get(CATEGORY_PARAM);
    const hrefOf = (slug: string) => {
        const next = new URLSearchParams(params);
        next.delete("page");
        if (slug === chosen) next.delete(CATEGORY_PARAM);
        else next.set(CATEGORY_PARAM, slug);
        return `/?${next}`;
    };

    return (
        <section className="flex flex-col gap-5" aria-labelledby={headingId}>
            <h2 id={headingId} className="font-display text-2xl font-bold tracking-tight">{resolveLanguageKey("categoriesTitle")}</h2>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                    const isChosen = category.slug === chosen;
                    return (
                        <Button key={category._id} asChild variant={isChosen ? "default" : "outline"} size="lg" className="px-4">
                            <Link to={hrefOf(category.slug)} aria-current={isChosen ? "true" : undefined}>{category.name}</Link>
                        </Button>
                    );
                })}
            </div>
        </section>
    );
}

/** The shop's part of the home page: the company's own CMS blocks. Its categories open with the products tab. */
function ShopHome() {
    const {blocks} = useCmsBlocks();

    return (
        <>
            {blocks.map((block, index) => (
                <CmsBlockRenderer key={block._id} block={block} headingLevel={index === 0 ? "h1" : "h2"} />
            ))}
        </>
    );
}

/** The categories above the products tab's filters (`PortalCatalog.Intro`). */
export const ShopCategoriesIntro = compose(withLanguage(LANGUAGE_PATH))(ShopCategories);

export default ShopHome;
