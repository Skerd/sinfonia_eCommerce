import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createProductVariantFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/productVariant/createProductVariant.form.validator.ts";
import type {CreateProductVariantFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/productVariant/productVariant.schema-def.ts";

export default createGenericCreatePage<CreateProductVariantFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/productVariants/createProductVariant.tsx",
    collectionName: "productVariants",
    accessModel: "productVariants",
    apiUrl: "/api/eCommerce/productVariant",
    schema: createProductVariantFormSchema,
    defaultValues: {product: "", status: "active", trackInventory: true, attributeCombination: []} as unknown as CreateProductVariantFormType,
    successPath: "/tenancy/systemSettings/productvariants",
    submitIcon: <IconPlus />,
});
