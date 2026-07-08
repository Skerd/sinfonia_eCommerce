import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
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
        isActive: true,
        rates: [{name: "Default", type: "flat", price: 0}],
    } as unknown as CreateShippingZoneFormType,
    successPath: "/eCommerce/shippingzones",
    submitIcon: <IconPlus />,
});
