import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createCustomerGroupFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/createCustomerGroup.form.validator";
import type {CreateCustomerGroupFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.schema-def";

export default createGenericCreatePage<CreateCustomerGroupFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/customerGroups/createCustomerGroup.tsx",
    collectionName: "customerGroups",
    accessModel: "customerGroups",
    apiUrl: "/api/eCommerce/customerGroup",
    schema: createCustomerGroupFormSchema,
    defaultValues: {name: "", description: ""},
    successPath: "/eCommerce/customergroups",
    submitIcon: <IconPlus />,
});
