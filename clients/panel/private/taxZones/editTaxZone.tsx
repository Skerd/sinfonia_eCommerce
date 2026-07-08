import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editTaxZoneFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/editTaxZone.form.validator.ts";
import type {EditTaxZoneFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/taxZone.schema-def.ts";
import type {TaxZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/taxZone.dto.ts";

export default createGenericEditPage<TaxZone, EditTaxZoneFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/taxZones/editTaxZone.tsx",
    collectionName: "taxZones",
    accessModel: "taxZones",
    apiUrl: "/api/eCommerce/taxZone",
    schema: editTaxZoneFormSchema,
    mapEntityData: (data) => ({
        ...data,
        country: data.country?._id,
        states: data.states?.map((s) => s._id),
    }),
    submitIcon: <Save />,
});
