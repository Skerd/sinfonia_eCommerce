import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import PosConfigRowMenuExtras from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/posConfigRowMenuExtras.tsx";
import SetManagerPinDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/setManagerPinDialog.tsx";
import ChangeManagerPinDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/changeManagerPinDialog.tsx";
import ClearManagerPinDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/clearManagerPinDialog.tsx";
import RequestManagerPinResetDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/requestManagerPinResetDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/posconfigs";

export type PosConfigSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: PosConfig;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    onPinUpdated?: (updated: Partial<PosConfig>) => void;
    fetchId?: string;
};

function posConfigEditPath(entity: PosConfig) {
    const params = new URLSearchParams();
    params.set("posConfigId", entity._id);
    if (entity.name) params.set("posConfigTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function PosConfigSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onPinUpdated,
    fetchId,
}: PosConfigSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [pinAction, setPinAction] = useState<string>("");
    const access = useAccess("posConfigs");
    const viewConfig = useViewConfig("posConfigs", "sheet");

    useEffect(() => {
        if (!entityProp) return;
        setSheetData(entityProp);
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;
    const config = sheetData as PosConfig;

    if (!viewConfig) return null;
    if (!entityId) return null;

    const applyPinUpdate = (updated: Partial<PosConfig>) => {
        setSheetData((prev) => ({...prev, ...updated}));
        onPinUpdated?.(updated);
        setPinAction("");
    };

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/posConfig/single"
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
                editPath={posConfigEditPath(config)}
                actionMenuAllowCustomChildren
                onActionMenuAction={(a) => setPinAction(a)}
                actionMenuChildren={
                    <PosConfigRowMenuExtras config={config} onAction={(a) => setPinAction(a)} />
                }
            />
            {pinAction === "setManagerPin" && (
                <SetManagerPinDialog
                    open
                    onClose={() => setPinAction("")}
                    config={config}
                    onSuccess={applyPinUpdate}
                />
            )}
            {pinAction === "changeManagerPin" && (
                <ChangeManagerPinDialog
                    open
                    onClose={() => setPinAction("")}
                    config={config}
                    onSuccess={applyPinUpdate}
                />
            )}
            {pinAction === "clearManagerPin" && (
                <ClearManagerPinDialog
                    open
                    onClose={() => setPinAction("")}
                    config={config}
                    onSuccess={applyPinUpdate}
                />
            )}
            {pinAction === "requestManagerPinReset" && (
                <RequestManagerPinResetDialog
                    open
                    onClose={() => setPinAction("")}
                    config={config}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/sheetView/posConfigSheetView.tsx"),
    withDebug(true, true),
)(PosConfigSheetView);
