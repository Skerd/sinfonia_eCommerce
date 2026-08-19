import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ActivatePosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/activatePosPaymentMethod.tsx";
import DeactivatePosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/deactivatePosPaymentMethod.tsx";
import TestPosTerminalConnection from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/testPosTerminalConnection.tsx";
import ActivatePosPaymentMethodDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/activatePosPaymentMethodDialog.tsx";
import DeactivatePosPaymentMethodDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/deactivatePosPaymentMethodDialog.tsx";
import TestPosTerminalConnectionDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/testPosTerminalConnectionDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/pospaymentmethods";

export type PosPaymentMethodSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: PosPaymentMethod;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function posPaymentMethodEditPath(entity: PosPaymentMethod) {
    const params = new URLSearchParams();
    params.set("posPaymentMethodId", entity._id);
    if (entity.name) params.set("posPaymentMethodTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function PosPaymentMethodSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    onSheetRowPatched,
}: PosPaymentMethodSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("posPaymentMethods");
    const viewConfig = useViewConfig("posPaymentMethods", "sheet");

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

    const asEntity = sheetData as PosPaymentMethod;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/posPaymentMethod/single"
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
                editPath={posPaymentMethodEditPath(asEntity)}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <TestPosTerminalConnection entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <ActivatePosPaymentMethod entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DeactivatePosPaymentMethod entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "activatePosPaymentMethod" && (
                <ActivatePosPaymentMethodDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        const patch = {isActive: true};
                        setSheetData((prev) => ({...prev, ...patch}));
                        onSheetRowPatched?.(patch);
                    }}
                />
            )}
            {action === "deactivatePosPaymentMethod" && (
                <DeactivatePosPaymentMethodDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        const patch = {isActive: false};
                        setSheetData((prev) => ({...prev, ...patch}));
                        onSheetRowPatched?.(patch);
                    }}
                />
            )}
            {action === "testPosTerminalConnection" && (
                <TestPosTerminalConnectionDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posPaymentMethods/center/sheetView/posPaymentMethodSheetView.tsx"),
    withDebug(true, true, "posPaymentMethods"),
)(PosPaymentMethodSheetView);
