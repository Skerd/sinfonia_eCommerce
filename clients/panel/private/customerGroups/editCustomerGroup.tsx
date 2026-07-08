import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editCustomerGroupFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/editCustomerGroup.form.validator";
import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto";
import type {EditCustomerGroupFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.schema-def";

export default createGenericEditPage<CustomerGroup, EditCustomerGroupFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/customerGroups/editCustomerGroup.tsx",
    collectionName: "customerGroups",
    accessModel: "customerGroups",
    apiUrl: "/api/eCommerce/customerGroup",
    schema: editCustomerGroupFormSchema,
    submitIcon: <Save />,
});
