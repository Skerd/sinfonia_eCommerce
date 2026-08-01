import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {FiscalConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/fiscalConfig/fiscalConfig.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import FiscalConfigCard from "./center/cardView/fiscalConfigCard.tsx";
import FiscalConfigSheetView from "./center/sheetView/fiscalConfigSheetView.tsx";
import ActivateFiscalConfig from "./center/actions/activateFiscalConfig.tsx";
import DeactivateFiscalConfig from "./center/actions/deactivateFiscalConfig.tsx";
import ActivateFiscalConfigDialog from "./center/dialogs/activateFiscalConfigDialog.tsx";
import DeactivateFiscalConfigDialog from "./center/dialogs/deactivateFiscalConfigDialog.tsx";

export function fiscalConfigEditPath(entity: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("fiscalConfigId", entity._id);
    if (entity.name) params.set("fiscalConfigTitle", encodeURIComponent(entity.name));
    return `/tenancy/systemSettings/fiscalconfigs/edit?${params.toString()}`;
}

function AllFiscalConfigs({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<FiscalConfig>
            apiUrl="/api/eCommerce/fiscalConfig"
            collectionName="fiscalConfigs"
            accessModel="fiscalConfigs"
            tableConfigKey="fiscalConfigs"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/tenancy/systemSettings/fiscalconfigs/create"
            createIcon={<IconPlus />}
            createLanguageKey="createFiscalConfig"
            buildEditPath={fiscalConfigEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/fiscalConfigs/center/sheetView/fiscalConfigSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivateFiscalConfig entity={_entity} onAction={bindRowAction} />
                    <DeactivateFiscalConfig entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ActivateFiscalConfig entity={_entity} onAction={bindRowAction} />
                    <DeactivateFiscalConfig entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "activateFiscalConfig") {
                    return (
                        <ActivateFiscalConfigDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivateFiscalConfig") {
                    return (
                        <DeactivateFiscalConfigDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: false})}
                        />
                    );
                }
                return null;
            }}
            renderCard={(entity, onDelete, onRestore, listRef) => (
                <FiscalConfigCard
                    entity={entity}
                    onDelete={(row: FiscalConfig | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                    onActiveChanged={(isActive) => listRef.current?.updateRow?.(entity._id, {isActive})}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <FiscalConfigSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                    entity={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<FiscalConfig>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fiscalConfigs/index.tsx"),
    withDebug(true, true),
)(AllFiscalConfigs);
