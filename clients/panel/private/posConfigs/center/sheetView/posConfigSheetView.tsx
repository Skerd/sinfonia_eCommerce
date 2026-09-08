import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import PosConfigRowMenuExtras from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/posConfigRowMenuExtras.tsx";
import ActivatePosConfig from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/activatePosConfig.tsx";
import DeactivatePosConfig from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/deactivatePosConfig.tsx";
import PausePosConfig from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/pausePosConfig.tsx";
import ResumePosConfig from "@eCommerceModule/clients/panel/private/posConfigs/center/actions/resumePosConfig.tsx";
import SetManagerPinDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/setManagerPinDialog.tsx";
import ChangeManagerPinDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/changeManagerPinDialog.tsx";
import ClearManagerPinDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/clearManagerPinDialog.tsx";
import RequestManagerPinResetDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/requestManagerPinResetDialog.tsx";
import ActivatePosConfigDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/activatePosConfigDialog.tsx";
import DeactivatePosConfigDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/deactivatePosConfigDialog.tsx";
import PausePosConfigDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/pausePosConfigDialog.tsx";
import ResumePosConfigDialog from "@eCommerceModule/clients/panel/private/posConfigs/center/dialogs/resumePosConfigDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/posconfigs";

export type PosConfigSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: PosConfig;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    onPinUpdated?: (updated: Partial<PosConfig>) => void;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
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
    onSheetRowPatched,
    fetchId,
}: PosConfigSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [menuAction, setMenuAction] = useState<string>("");
    const access = useAccess("posConfigs");
    const viewConfig = useViewConfig("posConfigs", "sheet");

    useEffect(() => {
        if (!open) setMenuAction("");
    }, [open]);

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
        setMenuAction("");
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
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                onActionMenuAction={(a) => setMenuAction(a)}
                actionMenuChildren={
                    <>
                        <PausePosConfig entity={config} onAction={(a: string) => setMenuAction(a)} />
                        <ResumePosConfig entity={config} onAction={(a: string) => setMenuAction(a)} />
                        <ActivatePosConfig entity={config} onAction={(a: string) => setMenuAction(a)} />
                        <DeactivatePosConfig entity={config} onAction={(a: string) => setMenuAction(a)} />
                        <PosConfigRowMenuExtras config={config} onAction={(a) => setMenuAction(a)} />
                    </>
                }
            />
            {menuAction === "activatePosConfig" && (
                <ActivatePosConfigDialog
                    open
                    onClose={() => setMenuAction("")}
                    entity={config}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: true}));
                        onSheetRowPatched?.({isActive: true});
                    }}
                />
            )}
            {menuAction === "deactivatePosConfig" && (
                <DeactivatePosConfigDialog
                    open
                    onClose={() => setMenuAction("")}
                    entity={config}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: false}));
                        onSheetRowPatched?.({isActive: false});
                    }}
                />
            )}
            {menuAction === "pausePosConfig" && (
                <PausePosConfigDialog
                    open
                    onClose={() => setMenuAction("")}
                    entity={config}
                    onSuccess={(patch: Partial<PosConfig>) => {
                        setSheetData((prev) => ({...prev, ...patch}));
                        onSheetRowPatched?.(patch);
                    }}
                />
            )}
            {menuAction === "resumePosConfig" && (
                <ResumePosConfigDialog
                    open
                    onClose={() => setMenuAction("")}
                    entity={config}
                    onSuccess={(patch: Partial<PosConfig>) => {
                        setSheetData((prev) => ({...prev, ...patch}));
                        onSheetRowPatched?.(patch);
                    }}
                />
            )}
            {menuAction === "setManagerPin" && (
                <SetManagerPinDialog
                    open
                    onClose={() => setMenuAction("")}
                    config={config}
                    onSuccess={applyPinUpdate}
                />
            )}
            {menuAction === "changeManagerPin" && (
                <ChangeManagerPinDialog
                    open
                    onClose={() => setMenuAction("")}
                    config={config}
                    onSuccess={applyPinUpdate}
                />
            )}
            {menuAction === "clearManagerPin" && (
                <ClearManagerPinDialog
                    open
                    onClose={() => setMenuAction("")}
                    config={config}
                    onSuccess={applyPinUpdate}
                />
            )}
            {menuAction === "requestManagerPinReset" && (
                <RequestManagerPinResetDialog
                    open
                    onClose={() => setMenuAction("")}
                    config={config}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/center/sheetView/posConfigSheetView.tsx"),
    withDebug(true, true, "posConfigs"),
)(PosConfigSheetView);
