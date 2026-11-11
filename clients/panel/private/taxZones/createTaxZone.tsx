import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/pages/createGenericCreatePage.tsx";
import {createTaxZoneFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/createTaxZone.form.validator.ts";
import type {CreateTaxZoneFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/taxZone.schema-def.ts";

export default createGenericCreatePage<CreateTaxZoneFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/taxZones/createTaxZone.tsx",
    collectionName: "taxZones",
    accessModel: "taxZones",
    apiUrl: "/api/eCommerce/taxZone",
    schema: createTaxZoneFormSchema,
    defaultValues: {
        name: "",
        country: "",
        priority: 0,
        // One empty rate row to fill in (a zone needs at least one rate); every product is the usual scope.
        rates: [{name: "", rate: 0, isCompound: false, appliesTo: "all"}],
    },
    successPath: "/tenancy/systemSettings/taxzones",
    submitIcon: <IconPlus />,
});
