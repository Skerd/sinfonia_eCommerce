import { Save } from "lucide-react";
import { createGenericEditPage } from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import { editListingAddOnFormSchema } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingAddOn/editListingAddOn.form.validator.ts";
import type { ListingAddOn } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingAddOn/listingAddOn.dto.ts";
import type { EditListingAddOnFormType } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingAddOn/listingAddOn.schema-def.ts";

export default createGenericEditPage<ListingAddOn, EditListingAddOnFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/listingAddOns/editListingAddOn.tsx",
    collectionName: "listingaddons",
    accessModel: "listingAddOns",
    apiUrl: "/api/eCommerceMarketplace/listingAddOn",
    schema: editListingAddOnFormSchema,
    buildInitialValues: (data, writeFields) => ({
        _id: data._id,
        // Read-only after create: shown so the provider sees which listing the row belongs to
        listing: data.listing?._id,
        name: writeFields.name ? data.name : undefined,
        price: writeFields.price
            ? {amount: data.price.amount, currency: data.price.currency?._id}
            : undefined,
        deliveryDays: writeFields.deliveryDays ? data.deliveryDays : undefined,
    }),
    submitIcon: <Save />,
});
