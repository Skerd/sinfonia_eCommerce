import { IconPlus } from "@tabler/icons-react";
import { createGenericCreatePage } from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import { createListingAddOnFormSchema } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingAddOn/createListingAddOn.form.validator.ts";
import type { CreateListingAddOnFormType } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingAddOn/listingAddOn.schema-def.ts";

export default createGenericCreatePage<CreateListingAddOnFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/listingAddOns/createListingAddOn.tsx",
    collectionName: "listingaddons",
    accessModel: "listingAddOns",
    apiUrl: "/api/eCommerceMarketplace/listingAddOn",
    schema: createListingAddOnFormSchema,
    defaultValues: (params) => ({
        listing: params.get("listingId") || "",
        name: "",
        price: {amount: 0, currency: ""},
        deliveryDays: undefined,
    }),
    submitIcon: <IconPlus />,
});
