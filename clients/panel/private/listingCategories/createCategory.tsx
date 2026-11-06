import {IconCirclePlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import type {CreateListingCategoryFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingCategory/listingCategory.schema-def.ts";
import {createListingCategoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingCategory/createListingCategory.form.validator.ts";

export default createGenericCreatePage<CreateListingCategoryFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/listingCategories/createCategory.tsx",
    collectionName: "listingcategories",
    apiUrl: "/api/eCommerceMarketplace/listingCategory",
    schema: createListingCategoryFormSchema,
    // No parent means a top-level category; the cleared select sends "".
    mapSubmitPayload: (data) => ({
        name: data.name,
        parentListingCategory: data.parentListingCategory || undefined,
        order: data.order ?? 0,
    }),
    successPath: "/tenancy/systemSettings/listingcategories",
    submitIcon: <IconCirclePlus className="h-4 w-4" />,
});
