import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosConfigCard from "./center/cardView/posConfigCard.tsx";
import PosConfigRowMenuExtras from "./center/actions/posConfigRowMenuExtras.tsx";
import SetManagerPinDialog from "./center/dialogs/setManagerPinDialog.tsx";
import ChangeManagerPinDialog from "./center/dialogs/changeManagerPinDialog.tsx";
import ClearManagerPinDialog from "./center/dialogs/clearManagerPinDialog.tsx";
import RequestManagerPinResetDialog from "./center/dialogs/requestManagerPinResetDialog.tsx";

export function posConfigEditPath(entity: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("posConfigId", entity._id);
    if (entity.name) params.set("posConfigTitle", encodeURIComponent(entity.name));
    return `/tenancy/systemSettings/posconfigs/edit?${params.toString()}`;
}

function AllPosConfigs({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PosConfig>
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
            renderActionMenuChildren={(config, bindRowAction) => (
                <PosConfigRowMenuExtras config={config} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                const onSuccess = (updated: Partial<PosConfig>) => {
                    listRef.current?.updateRow?.(entity._id, updated);
                    resetAction();
                };
                return (
                    <>
                        {action === "setManagerPin" && (
                            <SetManagerPinDialog
                                open
                                onClose={resetAction}
                                config={entity}
                                onSuccess={onSuccess}
                            />
                        )}
                        {action === "changeManagerPin" && (
                            <ChangeManagerPinDialog
                                open
                                onClose={resetAction}
                                config={entity}
                                onSuccess={onSuccess}
                            />
                        )}
                        {action === "clearManagerPin" && (
                            <ClearManagerPinDialog
                                open
                                onClose={resetAction}
                                config={entity}
                                onSuccess={onSuccess}
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
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posConfigs/index.tsx"),
    withDebug(true, true),
)(AllPosConfigs);
