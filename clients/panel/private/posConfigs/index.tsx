import {useState} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosConfigCard from "./center/cardView/posConfigCard.tsx";
import PosConfigSheetView from "./center/sheetView/posConfigSheetView.tsx";
import PosConfigRowMenuExtras from "./center/actions/posConfigRowMenuExtras.tsx";
import ActivatePosConfig from "./center/actions/activatePosConfig.tsx";
import DeactivatePosConfig from "./center/actions/deactivatePosConfig.tsx";
import PausePosConfig from "./center/actions/pausePosConfig.tsx";
import ResumePosConfig from "./center/actions/resumePosConfig.tsx";
import PosConfigsBulkMenu from "./center/actions/posConfigsBulkMenu.tsx";
import SetManagerPinDialog from "./center/dialogs/setManagerPinDialog.tsx";
import ChangeManagerPinDialog from "./center/dialogs/changeManagerPinDialog.tsx";
import ClearManagerPinDialog from "./center/dialogs/clearManagerPinDialog.tsx";
import RequestManagerPinResetDialog from "./center/dialogs/requestManagerPinResetDialog.tsx";
import ActivatePosConfigDialog from "./center/dialogs/activatePosConfigDialog.tsx";
import DeactivatePosConfigDialog from "./center/dialogs/deactivatePosConfigDialog.tsx";
import PausePosConfigDialog from "./center/dialogs/pausePosConfigDialog.tsx";
import ResumePosConfigDialog from "./center/dialogs/resumePosConfigDialog.tsx";

export function posConfigEditPath(entity: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("posConfigId", entity._id);
    if (entity.name) params.set("posConfigTitle", encodeURIComponent(entity.name));
    return `/tenancy/systemSettings/posconfigs/edit?${params.toString()}`;
}

function AllPosConfigs({resolveLanguageKey}: WithLanguageType) {
    const [listVersion, setListVersion] = useState(0);

    return (
        <EntityListPage<PosConfig>
            key={listVersion}
            apiUrl="/api/eCommerce/posConfig"
            collectionName="posConfigs"
            accessModel="posConfigs"
            tableConfigKey="posConfigs"
            createPath="/tenancy/systemSettings/posconfigs/create"
            createIcon={<IconPlus />}
            createLanguageKey="createPosConfig"
            buildEditPath={posConfigEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/posConfigs/center/sheetView/posConfigSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            headerActions={
                <PosConfigsBulkMenu onChanged={() => setListVersion((v) => v + 1)} />
            }
            renderActionMenuChildren={(config, bindRowAction) => (
                <>
                    <PausePosConfig entity={config} onAction={bindRowAction} />
                    <ResumePosConfig entity={config} onAction={bindRowAction} />
                    <ActivatePosConfig entity={config} onAction={bindRowAction} />
                    <DeactivatePosConfig entity={config} onAction={bindRowAction} />
                    <PosConfigRowMenuExtras config={config} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(config, bindRowAction) => (
                <>
                    <PausePosConfig entity={config} onAction={bindRowAction} />
                    <ResumePosConfig entity={config} onAction={bindRowAction} />
                    <ActivatePosConfig entity={config} onAction={bindRowAction} />
                    <DeactivatePosConfig entity={config} onAction={bindRowAction} />
                    <PosConfigRowMenuExtras config={config} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onPinSuccess = (updated: Partial<PosConfig>) => {
                    listRef.current?.updateRow?.(entity._id, updated);
                    resetAction();
                };
                return (
                    <>
                        {action === "activatePosConfig" && (
                            <ActivatePosConfigDialog
                                open
                                onClose={resetAction}
                                entity={entity}
                                onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                            />
                        )}
                        {action === "deactivatePosConfig" && (
                            <DeactivatePosConfigDialog
                                open
                                onClose={resetAction}
                                entity={entity}
                                onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                            />
                        )}
                        {action === "pausePosConfig" && (
                            <PausePosConfigDialog
                                open
                                onClose={resetAction}
                                entity={entity}
                                onSuccess={(patch) => listRef.current?.updateRow?.(entity._id, patch)}
                            />
                        )}
                        {action === "resumePosConfig" && (
                            <ResumePosConfigDialog
                                open
                                onClose={resetAction}
                                entity={entity}
                                onSuccess={(patch) => listRef.current?.updateRow?.(entity._id, patch)}
                            />
                        )}
                        {action === "setManagerPin" && (
                            <SetManagerPinDialog
                                open
                                onClose={resetAction}
                                config={entity}
                                onSuccess={onPinSuccess}
                            />
                        )}
                        {action === "changeManagerPin" && (
                            <ChangeManagerPinDialog
                                open
                                onClose={resetAction}
                                config={entity}
                                onSuccess={onPinSuccess}
                            />
                        )}
                        {action === "clearManagerPin" && (
                            <ClearManagerPinDialog
                                open
                                onClose={resetAction}
                                config={entity}
                                onSuccess={onPinSuccess}
                            />
                        )}
                        {action === "requestManagerPinReset" && (
                            <RequestManagerPinResetDialog
                                open
                                onClose={resetAction}
                                config={entity}
                            />
                        )}
                    </>
                );
            }}
            renderCard={(entity, onDelete, onRestore, listRef) => (
                <PosConfigCard
                    entity={entity}
                    onDelete={(row: PosConfig | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                    onPinUpdated={(updated) => listRef.current?.updateRow?.(entity._id, updated)}
                    onActiveChanged={(isActive) => listRef.current?.updateRow?.(entity._id, {isActive})}
                    onPausedChanged={(patch) => listRef.current?.updateRow?.(entity._id, patch)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <PosConfigSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                    entity={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onPinUpdated={(updated) => listRef.current?.updateRow?.(entity._id, updated)}
                    onSheetRowPatched={(row) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<PosConfig>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/index.tsx"),
    withDebug(true, true),
)(AllPosConfigs);
