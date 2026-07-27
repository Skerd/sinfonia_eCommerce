import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createProductAttributeFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/productAttribute/createProductAttribute.form.validator.ts";
import type {CreateProductAttributeFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/productAttribute/productAttribute.schema-def.ts";

export default createGenericCreatePage<CreateProductAttributeFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/productAttributes/createProductAttribute.tsx",
    collectionName: "productAttributes",
    accessModel: "productAttributes",
    apiUrl: "/api/eCommerce/productAttribute",
    schema: createProductAttributeFormSchema,
    defaultValues: {name: "", values: [], isVisibleOnProductPage: true, isUsedForVariants: false, position: 0} as unknown as CreateProductAttributeFormType,
    successPath: "/tenancy/systemSettings/productattributes",
    submitIcon: <IconPlus />,
});
