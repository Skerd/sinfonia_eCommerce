import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Star} from "lucide-react";
import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto.ts";

type SetDefaultCustomerGroupProps = WithLanguageType & {
    entity: Pick<CustomerGroup, "_id" | "isDefault" | "deletedAt">;
    onAction: (action: string) => void;
};

function SetDefaultCustomerGroup({entity, resolveLanguageKey, onAction}: SetDefaultCustomerGroupProps) {
    const {write} = useAccess("customerGroups");

    if (!write?.isDefault) return null;
    if (entity.deletedAt) return null;
    if (entity.isDefault) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("setDefaultCustomerGroup")}>
            <Star className="text-warning" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/customerGroups/center/actions/setDefaultCustomerGroup.tsx",
    ),
    withDebug(true, true, "customerGroups"),
)(SetDefaultCustomerGroup);
