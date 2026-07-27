import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editProductVariantFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/productVariant/editProductVariant.form.validator.ts";
import type {EditProductVariantFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/productVariant/productVariant.schema-def.ts";
import type {ProductVariant} from "armonia/src/modules/eCommerce/api/eCommerce/private/productVariant/productVariant.dto.ts";

export default createGenericEditPage<ProductVariant, EditProductVariantFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/productVariants/editProductVariant.tsx",
    collectionName: "productVariants",
    accessModel: "productVariants",
    apiUrl: "/api/eCommerce/productVariant",
    schema: editProductVariantFormSchema,
    mapEntityData: (data: any) => ({
        ...data,
        product: data.product?._id ?? data.product,
        currency: data.currency?._id ?? data.currency,
        mainImage: data.mainImage?._id ?? data.mainImage,
        attributeCombination: (data.attributeCombination ?? []).map((c: any) => ({
            attribute: c.attribute?._id ?? c.attribute,
            value: c.value,
        })),
    }),
    submitIcon: <Save />,
});
