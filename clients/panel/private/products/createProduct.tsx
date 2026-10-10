import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createProductFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/createProduct.form.validator.ts";
import type {CreateProductFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/product/product.schema-def.ts";

export default createGenericCreatePage<CreateProductFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/products/createProduct.tsx",
    collectionName: "products",
    accessModel: "products",
    apiUrl: "/api/eCommerce/product",
    schema: createProductFormSchema,
    defaultValues: {
        type: "physical",
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
    },
    successPath: "/eCommerce/products",
    submitIcon: <IconPlus />,
});
