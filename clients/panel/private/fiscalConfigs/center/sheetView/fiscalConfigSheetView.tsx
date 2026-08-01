import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {FiscalConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import ActivateFiscalConfig from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/actions/activateFiscalConfig.tsx";
import DeactivateFiscalConfig from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/actions/deactivateFiscalConfig.tsx";
import ActivateFiscalConfigDialog from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/dialogs/activateFiscalConfigDialog.tsx";
import DeactivateFiscalConfigDialog from "@eCommerceModule/clients/panel/private/fiscalConfigs/center/dialogs/deactivateFiscalConfigDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/fiscalconfigs";

export type FiscalConfigSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: FiscalConfig;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
    onSheetRowPatched?: (row: Record<string, unknown>) => void;
};

function fiscalConfigEditPath(entity: FiscalConfig) {
    const params = new URLSearchParams();
    params.set("fiscalConfigId", entity._id);
    if (entity.name) params.set("fiscalConfigTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function FiscalConfigSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
    onSheetRowPatched,
}: FiscalConfigSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const [action, setAction] = useState("");
    const access = useAccess("fiscalConfigs");
    const viewConfig = useViewConfig("fiscalConfigs", "sheet");

    useEffect(() => {
        if (!open) setAction("");
    }, [open]);

    useEffect(() => {
        if (!entityProp) return;
        setSheetData(entityProp);
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;
    if (!viewConfig || !entityId) return null;

    const asEntity = sheetData as FiscalConfig;

    return (
        <>
            <SheetViewRenderer
                config={viewConfig}
                url="/api/eCommerce/fiscalConfig/single"
                fetchId={fetchId}
                onDataFetched={data => setSheetData(data)}
                data={sheetData}
                open={open}
                onOpenChange={onOpenChange}
                resolveLanguageKey={resolveLanguageKey}
                access={access}
                hideActions={hideActions}
                onDelete={onDelete}
                onRestore={onRestore}
                editPath={fiscalConfigEditPath(asEntity)}
                onSheetRowPatched={onSheetRowPatched}
                actionMenuAllowCustomChildren
                actionMenuChildren={
                    <>
                        <ActivateFiscalConfig entity={asEntity} onAction={(a: string) => setAction(a)} />
                        <DeactivateFiscalConfig entity={asEntity} onAction={(a: string) => setAction(a)} />
                    </>
                }
            />
            {action === "activateFiscalConfig" && (
                <ActivateFiscalConfigDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: true}));
                        onSheetRowPatched?.({isActive: true});
                    }}
                />
            )}
            {action === "deactivateFiscalConfig" && (
                <DeactivateFiscalConfigDialog
                    open={true}
                    onClose={() => setAction("")}
                    entity={asEntity}
                    onSuccess={() => {
                        setSheetData((prev) => ({...prev, isActive: false}));
                        onSheetRowPatched?.({isActive: false});
                    }}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fiscalConfigs/center/sheetView/fiscalConfigSheetView.tsx"),
    withDebug(true, true),
)(FiscalConfigSheetView);
