import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createProductFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/createProduct.form.validator.ts";
import type {CreateProductFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.schema-def.ts";

function appendFiles(formData: FormData, field: string, value: unknown): void {
    const arr = Array.isArray(value) ? value : value != null ? [value] : [];
    arr.filter((f): f is File => f instanceof File).forEach((f) => formData.append(field, f));
}

export default createGenericCreatePage<CreateProductFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/products/createProduct.tsx",
    collectionName: "products",
    accessModel: "products",
    apiUrl: "/api/eCommerce/product",
    schema: createProductFormSchema,
    defaultValues: {
        type: "physical",
        status: "draft",
        title: "",
        tags: [],
        categories: [],
        collections: [],
        highlights: [],
        badges: [],
        videoUrls: [],
        attributes: [],
        specifications: [],
        faqs: [],
        variantOptions: [],
        relatedProducts: [],
        upsells: [],
        crossSells: [],
        frequentlyBoughtTogether: [],
        featured: false,
        hasVariants: false,
        taxable: true,
        trackInventory: true,
        allowBackorder: false,
        requiresShipping: true,
        availableForSale: true,
        preorderEnabled: false,
    } as unknown as CreateProductFormType,
    buildFormExtras: () => ({enableLocalFileMultipart: true}),
    successPath: "/eCommerce/products",
    mapSubmitPayload: (data) => {
        // Strip File-carrying media fields; everything else goes in the JSON `data` blob.
        const {mainImage, gallery, documents, ...rest} = data as Record<string, unknown>;
        const formData = new FormData();
        if (mainImage instanceof File) formData.append("mainImage", mainImage);
        appendFiles(formData, "gallery", gallery);
        appendFiles(formData, "documents", documents);
        formData.append("data", JSON.stringify(rest));
        return formData;
    },
    submitIcon: <IconPlus />,
});
