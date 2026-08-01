import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto.ts";
import ManageMembersMenuItem from "@eCommerceModule/clients/panel/private/customerGroups/center/actions/manageMembers.tsx";
import SetDefaultCustomerGroup from "@eCommerceModule/clients/panel/private/customerGroups/center/actions/setDefaultCustomerGroup.tsx";

type Props = {
    customerGroup: CustomerGroup;
    onAction: (action: string) => void;
};

export default function CustomerGroupRowMenuExtras({customerGroup, onAction}: Props) {
    if (customerGroup.deletedAt) return null;

    return (
        <>
            <SetDefaultCustomerGroup entity={customerGroup} onAction={onAction} />
            <ManageMembersMenuItem onAction={onAction} />
        </>
    );
}
