import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {CatalogFilterSelect, uniqueBySlug} from "@coreModule/clients/portal/shared/catalogFilters.tsx";
import type {
    ShopCategory,
    ShopFacetOption,
    ShopFacetsResponse,
    ShopTaxonomyResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";

const TAXONOMY_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/shopTaxonomy", cache: true};
const FACETS_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/shopFacets", cache: true};

/** The product catalog's filters: the shop's categories and brands. */
function ShopProductFilters({resolveLanguageKey}: WithLanguageType) {
    const taxonomy = useHttpRequest<ShopTaxonomyResponse>(TAXONOMY_REQUEST, {}, 1);
    const facets = useHttpRequest<ShopFacetsResponse>(FACETS_REQUEST, {}, 1);
    const categories: ShopCategory[] = uniqueBySlug(taxonomy.data?.data.categories ?? []);
    const brands: ShopFacetOption[] = facets.data?.data.brands ?? [];

    const any = resolveLanguageKey("any");
    return (
        <>
            <CatalogFilterSelect
                name="category"
                label={resolveLanguageKey("category")}
                anyLabel={any}
                options={categories.map((category) => ({value: category.slug, label: category.name}))}
            />
            {brands.length > 0 ? (
                <CatalogFilterSelect
                    name="brand"
                    label={resolveLanguageKey("brand")}
                    anyLabel={any}
                    options={brands.map((brand) => ({value: brand.value, label: brand.value}))}
                />
            ) : null}
        </>
    );
}

export default compose(withLanguage("src/modules/eCommerce/clients/portal/shopProductFilters.tsx"))(ShopProductFilters);
