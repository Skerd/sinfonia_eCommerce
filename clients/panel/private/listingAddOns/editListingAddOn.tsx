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
        listing: writeFields.listing ? data.listing?._id : undefined,
        name: writeFields.name ? data.name : undefined,
        price: writeFields.price
            ? {
                amount: (writeFields.price as any)?.keys?.amount !== false ? data.price.amount : undefined,
                currency: (writeFields.price as any)?.keys?.currency !== false ? data.price.currency._id : undefined,
            }
            : undefined,
        deliveryDays: writeFields.deliveryDays ? data.deliveryDays : undefined,
    }),
    submitIcon: <Save />,
});
