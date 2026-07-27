import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SetDefaultCustomerAddress from "@eCommerceModule/clients/panel/private/customerAddresses/center/actions/setDefaultCustomerAddress.tsx";
import SetDefaultCustomerAddressDialog from "@eCommerceModule/clients/panel/private/customerAddresses/center/dialogs/setDefaultCustomerAddressDialog.tsx";

const LIST_BASE = "/eCommerce/customeraddresses";

export type CustomerAddressSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: CustomerAddress;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function customerAddressEditPath(entity: CustomerAddress) {
    const params = new URLSearchParams();
    params.set("customerAddressId", entity._id);
    if (entity.firstName) params.set("customerAddressTitle", encodeURIComponent(String(entity.firstName)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function CustomerAddressSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    onSheetRowPatched,
}: CustomerAddressSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("customerAddresses");
    const viewConfig = useViewConfig("customerAddresses", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!entityProp) return;
        setSheetData(entityProp);
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const asEntity = sheetData as CustomerAddress;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/customerAddress/single"
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
                editPath={customerAddressEditPath(asEntity)}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <SetDefaultCustomerAddress entity={asEntity} onAction={(a: string) => setAction(a)} />
                }
            />
            {action === "setDefaultCustomerAddress" && (
                <SetDefaultCustomerAddressDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={(row) => {
                        setSheetData(row);
                        onSheetRowPatched?.(row);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerAddresses/center/sheetView/customerAddressSheetView.tsx"),
    withDebug(true, true),
)(CustomerAddressSheetView);
