import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import CustomerGroupRowMenuExtras from "@eCommerceModule/clients/panel/private/customerGroups/center/actions/customerGroupRowMenuExtras.tsx";
import ManageMembersDialog from "@eCommerceModule/clients/panel/private/customerGroups/center/dialogs/manageMembersDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/customergroups";

export type CustomerGroupSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerGroup?: CustomerGroup;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    onMembersChanged?: () => void;
    fetchId?: string;
};

function customerGroupEditPath(customerGroup: CustomerGroup) {
    const params = new URLSearchParams();
    params.set("customerGroupId", customerGroup._id);
    if (customerGroup.name) params.set("customerGroupName", encodeURIComponent(customerGroup.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function CustomerGroupSheetView({
    open,
    onOpenChange,
    customerGroup: customerGroupProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onMembersChanged,
    fetchId,
}: CustomerGroupSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(customerGroupProp || {_id: fetchId});
    const [memberAction, setMemberAction] = useState<string>("");
    const access = useAccess("customerGroups");
    const viewConfig = useViewConfig("customerGroups", "sheet");

    useEffect(() => {
        if (!customerGroupProp) return;
        setSheetData(customerGroupProp);
    }, [customerGroupProp]);

    const entityId = customerGroupProp?._id ?? fetchId;
    const customerGroup = sheetData as CustomerGroup;

    if (!viewConfig) return null;
    if (!entityId) return null;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/customerGroup/single"
                fetchId={fetchId}
                onDataFetched={(data) => {
                    setSheetData(data);
                }}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={customerGroupEditPath(customerGroup)}
                actionMenuAllowCustomChildren
                onActionMenuAction={(a) => setMemberAction(a)}
                actionMenuChildren={
                    <CustomerGroupRowMenuExtras
                        customerGroup={customerGroup}
                        onAction={(a) => setMemberAction(a)}
                    />
                }
            />
            {memberAction === "manageMembers" && (
                <ManageMembersDialog
                    open
                    onClose={() => setMemberAction("")}
                    customerGroup={customerGroup}
                    onSuccess={onMembersChanged}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerGroups/center/sheetView/customerGroupSheetView.tsx"),
    withDebug(true, true),
)(CustomerGroupSheetView);
