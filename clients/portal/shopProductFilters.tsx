import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {CatalogFilterSelect} from "@coreModule/clients/portal/shared/catalogFilters.tsx";
import {uniqueBySlug} from "./shopCategories.ts";
import type {
    ShopCategory,
    ShopFacetOption,
    ShopFacetsResponse,
    ShopTaxonomyResponse,
} from "armonia/src/modules/eCommerce/api/eCommerce/public/shopCatalog/shopCatalog.types.ts";

/** The product catalog's filters: the shop's categories and brands. */
function ShopProductFilters({resolveLanguageKey}: WithLanguageType) {
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [brands, setBrands] = useState<ShopFacetOption[]>([]);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            apiClient.post<ShopTaxonomyResponse>("/api/eCommerce/shopTaxonomy", {}),
            apiClient.post<ShopFacetsResponse>("/api/eCommerce/shopFacets", {}),
        ]).then(([taxonomy, facets]) => {
            if (cancelled) return;
            setCategories(uniqueBySlug(taxonomy.data.data.categories));
            setBrands(facets.data.data.brands);
        }).catch(() => undefined);
        return () => { cancelled = true; };
    }, []);

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
