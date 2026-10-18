import { Save } from "lucide-react";
import { createGenericEditPage } from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import { editListingPackageFormSchema } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingPackage/editListingPackage.form.validator.ts";
import type { ListingPackage } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingPackage/listingPackage.dto.ts";
import type { EditListingPackageFormType } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingPackage/listingPackage.schema-def.ts";

export default createGenericEditPage<ListingPackage, EditListingPackageFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/listingPackages/editListingPackage.tsx",
    collectionName: "listingpackages",
    accessModel: "listingPackages",
    apiUrl: "/api/eCommerceMarketplace/listingPackage",
    schema: editListingPackageFormSchema,
    buildInitialValues: (data, writeFields) => ({
        _id: data._id,
        listing: writeFields.listing ? data.listing?._id : undefined,
        name: writeFields.name ? data.name : undefined,
        description: writeFields.description ? (data.description ?? "") : undefined,
        price: writeFields.price
            ? {
                amount: (writeFields.price as any)?.keys?.amount !== false ? data.price.amount : undefined,
                currency: (writeFields.price as any)?.keys?.currency !== false ? data.price.currency._id : undefined,
            }
            : undefined,
        deliveryDays: writeFields.deliveryDays ? data.deliveryDays : undefined,
        order: writeFields.order ? data.order : undefined,
    }),
    submitIcon: <Save />,
});
