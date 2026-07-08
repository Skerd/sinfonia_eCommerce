import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editProductFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/editProduct.form.validator.ts";
import type {EditProductFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.schema-def.ts";
import type {Product} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.dto.ts";

const ID_ARRAY_FIELDS = [
    "categories",
    "collections",
    "variantOptions",
    "relatedProducts",
    "upsells",
    "crossSells",
    "frequentlyBoughtTogether",
] as const;

const SCALAR_FIELDS = [
    "type", "status", "title", "description", "shortDescription", "careInstructions", "warranty",
    "sku", "barcode", "gtin", "upc", "ean", "isbn", "mpn", "hsCode", "countryOfOrigin",
    "brand", "vendor",
    "price", "compareAtPrice", "costPrice", "msrp", "taxable", "taxClass",
    "minOrderQty", "maxOrderQty", "stepQty", "currency",
    "saleStartsAt", "saleEndsAt",
    "weight", "weightUnit", "dimensionUnit", "volumetricWeight", "shippingClass", "isHazmat", "requiresShipping",
    "trackInventory", "allowBackorder", "lowStockThreshold", "safetyStock", "backorderLimit",
    "preorderEnabled", "preorderAvailableAt", "availableForSale",
    "featured", "hasVariants",
    "dimensions", "seo", "tags", "highlights", "badges", "videoUrls",
    "attributes", "specifications", "faqs",
] as const;

function refId(x: any): string {
    return typeof x === "string" ? x : x?._id ?? "";
}

function existingMediaIds(value: unknown): string[] {
    const arr = Array.isArray(value) ? value : [];
    return arr.filter((x) => typeof x === "string" || (x && typeof x === "object")).map(refId).filter(Boolean);
}

export default createGenericEditPage<Product, EditProductFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/products/editProduct.tsx",
    collectionName: "products",
    accessModel: "products",
    apiUrl: "/api/eCommerce/product",
    schema: editProductFormSchema,
    buildInitialValues: (data, writeFields) => {
        const wf = writeFields as Record<string, any>;
        const out: Record<string, unknown> = {_id: data._id};
        for (const key of SCALAR_FIELDS) {
            if (wf[key]) out[key] = (data as any)[key];
        }
        for (const key of ID_ARRAY_FIELDS) {
            if (wf[key]) out[key] = ((data as any)[key] ?? []).map(refId);
        }
        if (wf.mainImage) out.mainImage = data.mainImage?._id;
        if (wf.gallery) out.gallery = (data.gallery ?? []).map((m: any) => m._id);
        if (wf.documents) out.documents = (data.documents ?? []).map((m: any) => m._id);
        if (wf.seo && data.seo) {
            out.seo = {...data.seo, openGraphImage: refId((data.seo as any).openGraphImage) || undefined};
        }
        return out as EditProductFormType;
    },
    buildFormExtras: (_id, _params, entity) => ({
        enableLocalFileMultipart: true,
        editMediaExistingList: [
            ...(entity?.mainImage ? [entity.mainImage] : []),
            ...(entity?.gallery ?? []),
            ...(entity?.documents ?? []),
        ],
        categories: entity?.categories?.map((c: any) => ({value: c._id, label: c.name})) ?? [],
        collections: entity?.collections?.map((c: any) => ({value: c._id, label: c.name})) ?? [],
        variantOptions: entity?.variantOptions?.map((a: any) => ({value: a._id, label: a.name})) ?? [],
        relatedProducts: entity?.relatedProducts?.map((p: any) => ({value: p._id, label: p.title})) ?? [],
        upsells: entity?.upsells?.map((p: any) => ({value: p._id, label: p.title})) ?? [],
        crossSells: entity?.crossSells?.map((p: any) => ({value: p._id, label: p.title})) ?? [],
        frequentlyBoughtTogether: entity?.frequentlyBoughtTogether?.map((p: any) => ({value: p._id, label: p.title})) ?? [],
    }),
    mapSubmitPayload: (data, {writeFields}) => {
        const wf = writeFields as Record<string, boolean | undefined>;
        const {mainImage, gallery, documents, ...rest} = data as Record<string, unknown>;
        const postBody: Record<string, unknown> = {_id: (data as any)._id};

        for (const [key, value] of Object.entries(rest)) {
            if (key === "_id") continue;
            if (wf[key] && value !== undefined) postBody[key] = value;
        }

        const formData = new FormData();

        if (wf.mainImage) {
            if (mainImage instanceof File) formData.append("mainImage", mainImage);
            else postBody.mainImage = refId(mainImage) || null;
        }
        if (wf.gallery) {
            postBody.gallery = existingMediaIds(gallery);
            (Array.isArray(gallery) ? gallery : []).filter((f): f is File => f instanceof File).forEach((f) => formData.append("gallery", f));
        }
        if (wf.documents) {
            postBody.documents = existingMediaIds(documents);
            (Array.isArray(documents) ? documents : []).filter((f): f is File => f instanceof File).forEach((f) => formData.append("documents", f));
        }

        formData.append("data", JSON.stringify(postBody));
        return formData;
    },
    submitIcon: <Save />,
});
