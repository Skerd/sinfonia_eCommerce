import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editProductAttributeFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/productAttribute/editProductAttribute.form.validator.ts";
import type {EditProductAttributeFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/productAttribute/productAttribute.schema-def.ts";
import type {ProductAttribute} from "armonia/src/modules/eCommerce/api/eCommerce/private/productAttribute/productAttribute.dto.ts";

export default createGenericEditPage<ProductAttribute, EditProductAttributeFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/productAttributes/editProductAttribute.tsx",
    collectionName: "productAttributes",
    accessModel: "productAttributes",
    apiUrl: "/api/eCommerce/productAttribute",
    schema: editProductAttributeFormSchema,
    submitIcon: <Save />,
});
