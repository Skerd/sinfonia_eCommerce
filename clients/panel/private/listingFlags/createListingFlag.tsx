import { IconPlus } from "@tabler/icons-react";
import { createGenericCreatePage } from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import { createListingFlagFormSchema } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingFlag/createListingFlag.form.validator.ts";
import type { CreateListingFlagFormType } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingFlag/listingFlag.schema-def.ts";

export default createGenericCreatePage<CreateListingFlagFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/listingFlags/createListingFlag.tsx",
    collectionName: "listingflags",
    accessModel: "listingflags",
    apiUrl: "/api/eCommerceMarketplace/listingFlag",
    schema: createListingFlagFormSchema,
    defaultValues: {listing: "", reason: "other", comment: ""},
    submitIcon: <IconPlus />,
});
