import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
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
        isActive: true,
        priority: 0,
        rates: [{name: "Default", rate: 0, isCompound: false, appliesTo: "all"}],
    } as unknown as CreateTaxZoneFormType,
    successPath: "/eCommerce/taxzones",
    submitIcon: <IconPlus />,
});
