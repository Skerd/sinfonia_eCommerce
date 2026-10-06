import {compose} from "redux";
import {useSelector} from "react-redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {Star} from "lucide-react";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";

type SetDefaultCustomerAddressProps = WithLanguageType & {
    entity: Pick<CustomerAddress, "_id" | "isDefault" | "deletedAt" | "customer">;
    onAction: (action: string) => void;
};

function SetDefaultCustomerAddress({entity, resolveLanguageKey, onAction}: SetDefaultCustomerAddressProps) {
    const currentUserId = useSelector((state: RootState) => state.authentication.user.id);
    const selfAccess = useAccess("customerAddresses", "self");
    const othersAccess = useAccess("customerAddresses", "others");
    const isOwner = !!currentUserId && entity.customer?._id === currentUserId;
    const canWriteDefault = accessFieldPathExists(selfAccess.write, "isDefault")
        || accessFieldPathExists(othersAccess.write, "isDefault");

    if (!isOwner && !canWriteDefault) return null;
    if (entity.deletedAt) return null;
    if (entity.isDefault) return null;

    return (
        <DropdownMenuItem onClick={() => onAction("setDefaultCustomerAddress")}>
            <Star className="text-warning" size={16} />
            {resolveLanguageKey("title")}
        </DropdownMenuItem>
    );
}

export default compose(
    withLanguage(
        "src/modules/eCommerce/clients/panel/private/customerAddresses/center/actions/setDefaultCustomerAddress.tsx",
    ),
    withDebug(true, true, "customerAddresses"),
)(SetDefaultCustomerAddress);
