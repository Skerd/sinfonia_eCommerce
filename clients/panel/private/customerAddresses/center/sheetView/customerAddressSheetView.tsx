import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import SetDefaultCustomerAddress from "@eCommerceModule/clients/panel/private/customerAddresses/center/actions/setDefaultCustomerAddress.tsx";
import SetDefaultCustomerAddressDialog from "@eCommerceModule/clients/panel/private/customerAddresses/center/dialogs/setDefaultCustomerAddressDialog.tsx";

const FORM_BASE = "/tenancy/systemSettings/customeraddresses";

export type CustomerAddressSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: CustomerAddress;
    lockCustomer?: boolean;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
    onDefaultChanged?: (addressId: string) => void;
};

function customerAddressEditPath(entity: CustomerAddress, lockCustomer: boolean) {
    const params = new URLSearchParams();
    params.set("customerAddressId", entity._id);
    if (entity.firstName) params.set("customerAddressTitle", encodeURIComponent(String(entity.firstName)));
    if (lockCustomer) params.set("lockCustomer", "1");
    return `${FORM_BASE}/edit?${params.toString()}`;
}

function CustomerAddressSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    lockCustomer = false,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    onSheetRowPatched,
    onDefaultChanged,
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
                // Named by the recipient, typed in tone (UX-01, UX-02).
                headerTitle={<SheetNameTitle name={[asEntity.firstName, asEntity.lastName].filter(Boolean).join(" ")} typeLabel={String(resolveLanguageKey("sheetTypeLabel"))} />}
                headerDescription={
                    <>
                        <StatusBadge tableConfigKey="customerAddresses" field="type" value={asEntity.type} label={String(resolveLanguageKey(`addressType.${asEntity.type}`))} />
                        {asEntity.isDefault ? <Badge variant="outline">{resolveLanguageKey("defaultAddress")}</Badge> : null}
                    </>
                }
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={customerAddressEditPath(asEntity, lockCustomer)}
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
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isDefault: true}));
                        onSheetRowPatched?.({isDefault: true});
                        onDefaultChanged?.(asEntity._id);
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerAddresses/center/sheetView/customerAddressSheetView.tsx"),
    withDebug(true, true, "customerAddresses"),
)(CustomerAddressSheetView);
