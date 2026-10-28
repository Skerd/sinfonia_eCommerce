import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {CatalogFilterSelect} from "@coreModule/clients/portal/shared/catalogFilters.tsx";
import {uniqueBySlug, withListings} from "./shopCategories.ts";
import type {
    ShopListingCategory,
    ShopListingTaxonomyResponse,
} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/public/shopMarketplace/shopMarketplace.types.ts";

/** The service catalog's filter: the marketplace categories that lead to at least one service. */
function ShopServiceFilters({resolveLanguageKey}: WithLanguageType) {
    const [categories, setCategories] = useState<ShopListingCategory[]>([]);

    useEffect(() => {
        let cancelled = false;
        apiClient.post<ShopListingTaxonomyResponse>("/api/eCommerceMarketplace/shopListingTaxonomy", {})
            .then((res) => {
                if (cancelled) return;
                const all = res.data.data.categories;
                const keep = withListings(all);
                setCategories(uniqueBySlug(all.filter((category) => keep.has(category._id))));
            })
            .catch(() => undefined);
        return () => { cancelled = true; };
    }, []);

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
