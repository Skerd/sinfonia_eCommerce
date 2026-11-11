import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createShippingZoneFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/createShippingZone.form.validator.ts";
import type {CreateShippingZoneFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/shippingZone.schema-def.ts";

export default createGenericCreatePage<CreateShippingZoneFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/shippingZones/createShippingZone.tsx",
    collectionName: "shippingZones",
    accessModel: "shippingZones",
    apiUrl: "/api/eCommerce/shippingZone",
    schema: createShippingZoneFormSchema,
    defaultValues: {
        name: "",
        countries: [],
        // No prefilled rate: its name and how it is charged are the shop's choice (UX-06); "Add rate" opens an empty row.
        rates: [],
    },
    successPath: "/tenancy/systemSettings/shippingzones",
    submitIcon: <IconPlus />,
});
