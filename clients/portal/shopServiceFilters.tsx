import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {CatalogFilterSelect} from "@coreModule/clients/portal/shared/catalogFilters.tsx";
import {uniqueBySlug, withListings} from "./shopCategories.ts";
import type {
    ShopListingCategory,
    ShopListingTaxonomyResponse,
} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";

const TAXONOMY_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerceMarketplace/shopListingTaxonomy"};

/** The service catalog's filter: the marketplace categories that lead to at least one service. */
function ShopServiceFilters({resolveLanguageKey}: WithLanguageType) {
    const taxonomy = useHttpRequest<ShopListingTaxonomyResponse>(TAXONOMY_REQUEST, {}, 1);
    const all = taxonomy.data?.data.categories ?? [];
    const keep = withListings(all);
    const categories: ShopListingCategory[] = uniqueBySlug(all.filter((category) => keep.has(category._id)));

    return (
        <CatalogFilterSelect
            name="category"
            label={resolveLanguageKey("category")}
            anyLabel={resolveLanguageKey("any")}
            options={categories.map((category) => ({value: category.slug, label: category.name}))}
        />
    );
}

export default compose(withLanguage("src/modules/eCommerce/clients/portal/shopServiceFilters.tsx"))(ShopServiceFilters);
