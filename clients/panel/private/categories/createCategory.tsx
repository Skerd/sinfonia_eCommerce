import {IconCirclePlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import type {CreateCategoryFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.schema-def.ts";
import {createCategoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/createCategory.form.validator.ts";

export default createGenericCreatePage<CreateCategoryFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/categories/createCategory.tsx",
    collectionName: "productcategories",
    apiUrl: "/api/eCommerce/category",
    schema: createCategoryFormSchema,
    // No parent means a top-level category; the cleared select sends "".
    mapSubmitPayload: (data) => ({name: data.name, ...(data.names ? {names: data.names} : {}), parent: data.parent || undefined, order: data.order}),
    successPath: "/tenancy/systemSettings/categories",
    submitIcon: <IconCirclePlus className="h-4 w-4" />,
});
