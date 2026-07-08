import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editShippingZoneFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/editShippingZone.form.validator.ts";
import type {EditShippingZoneFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/shippingZone.schema-def.ts";
import type {ShippingZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/shippingZone.dto.ts";

export default createGenericEditPage<ShippingZone, EditShippingZoneFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/shippingZones/editShippingZone.tsx",
    collectionName: "shippingZones",
    accessModel: "shippingZones",
    apiUrl: "/api/eCommerce/shippingZone",
    schema: editShippingZoneFormSchema,
    mapEntityData: (data) => ({
        ...data,
        countries: data.countries?.map((c) => c._id),
        states: data.states?.map((s) => s._id),
    }),
    submitIcon: <Save />,
});
