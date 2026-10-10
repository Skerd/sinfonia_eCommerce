import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {editProductFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/editProduct.form.validator.ts";
import type {EditProductFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.schema-def.ts";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";

export default createGenericEditPage<Product, EditProductFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/products/editProduct.tsx",
    collectionName: "products",
    accessModel: "products",
    apiUrl: "/api/eCommerce/product",
    schema: editProductFormSchema,
    mapEntityData: (data) => ({
        ...data,
        categories: (data.categories ?? []).map((c) => c._id),
        collections: (data.collections ?? []).map((c) => c._id),
        variantOptions: (data.variantOptions ?? []).map((a) => a._id),
        relatedProducts: (data.relatedProducts ?? []).map((p) => p._id),
        upsells: (data.upsells ?? []).map((p) => p._id),
        crossSells: (data.crossSells ?? []).map((p) => p._id),
        frequentlyBoughtTogether: (data.frequentlyBoughtTogether ?? []).map((p) => p._id),
        currency: data.currency?._id,
        mainImage: data.mainImage?._id,
        gallery: (data.gallery ?? []).map((m) => m._id),
        documents: (data.documents ?? []).map((m) => m._id),
        seo: data.seo? {...data.seo, openGraphImage: data.seo.openGraphImage?._id} : data.seo,
    }),
    buildFormExtras: (_id, _params, entity) => {
        const currency = entity?.currency;
        const currencyLabel = currency
            ? [currency.symbol, currency.name || currency.abbreviation].filter(Boolean).join(" ").trim()
            : "";
        return {
            categories: entity?.categories?.map((c) => ({value: c._id, label: c.name})) ?? [],
            collections: entity?.collections?.map((c) => ({value: c._id, label: c.name})) ?? [],
            variantOptions: entity?.variantOptions?.map((a) => ({value: a._id, label: a.name})) ?? [],
            relatedProducts: entity?.relatedProducts?.map((p) => ({value: p._id, label: p.title})) ?? [],
            upsells: entity?.upsells?.map((p) => ({value: p._id, label: p.title})) ?? [],
            crossSells: entity?.crossSells?.map((p) => ({value: p._id, label: p.title})) ?? [],
            frequentlyBoughtTogether: entity?.frequentlyBoughtTogether?.map((p) => ({value: p._id, label: p.title})) ?? [],
            currencyDefaultOptions:
                currency?._id && currencyLabel
                    ? [{value: currency._id, label: currencyLabel}]
                    : [],
        };
    },
    submitIcon: <Save />,
});
