import {IconDeviceFloppy} from "@tabler/icons-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import type {EditCategoryFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.schema-def.ts";
import type {Category} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.dto.ts";
import {editCategoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/editCategory.form.validator.ts";

/** The form values, plus `null` for a cleared parent: the API reads it as "make this a top-level category". */
type EditCategoryPayload = Omit<EditCategoryFormType, "parent"> & {parent?: string | null};

export default createGenericEditPage<Category, EditCategoryPayload>({
    languagePath: "src/modules/eCommerce/clients/panel/private/categories/editCategory.tsx",
    collectionName: "productcategories",
    apiUrl: "/api/eCommerce/category",
    schema: editCategoryFormSchema,
    buildInitialValues: (category, writeFields) => ({
        _id: category._id,
        name: writeFields.name ? category.name : undefined,
        parent: writeFields.parent ? category.parent?._id : undefined,
        order: writeFields.order ? category.order : undefined,
    }),
    // Sends only writable fields; a cleared parent ("") moves the category to the top level.
    mapSubmitPayload: (data, {writeFields}) => ({
        _id: data._id,
        ...(writeFields.name ? {name: data.name} : {}),
        ...(writeFields.parent && data.parent !== undefined ? {parent: data.parent === "" ? null : data.parent} : {}),
        ...(writeFields.order ? {order: data.order} : {}),
    }),
    // The parent picker leaves the edited category out.
    buildFormExtras: (categoryId) => ({categoryId}),
    submitIcon: <IconDeviceFloppy className="h-4 w-4" />,
});
