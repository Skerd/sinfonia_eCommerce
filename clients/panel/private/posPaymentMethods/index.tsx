import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosPaymentMethodCard from "./center/cardView/posPaymentMethodCard.tsx";
import PosPaymentMethodSheetView from "./center/sheetView/posPaymentMethodSheetView.tsx";
import ActivatePosPaymentMethod from "./center/actions/activatePosPaymentMethod.tsx";
import DeactivatePosPaymentMethod from "./center/actions/deactivatePosPaymentMethod.tsx";
import TestPosTerminalConnection from "./center/actions/testPosTerminalConnection.tsx";
import ActivatePosPaymentMethodDialog from "./center/dialogs/activatePosPaymentMethodDialog.tsx";
import DeactivatePosPaymentMethodDialog from "./center/dialogs/deactivatePosPaymentMethodDialog.tsx";
import TestPosTerminalConnectionDialog from "./center/dialogs/testPosTerminalConnectionDialog.tsx";

export function posPaymentMethodEditPath(entity: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("posPaymentMethodId", entity._id);
    if (entity.name) params.set("posPaymentMethodTitle", encodeURIComponent(entity.name));
    return `/tenancy/systemSettings/pospaymentmethods/edit?${params.toString()}`;
}

function AllPosPaymentMethods({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PosPaymentMethod>
            apiUrl="/api/eCommerce/posPaymentMethod"
            collectionName="posPaymentMethods"
            accessModel="posPaymentMethods"
            tableConfigKey="posPaymentMethods"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/tenancy/systemSettings/pospaymentmethods/create"
            createIcon={<IconPlus />}
            createLanguageKey="createPosPaymentMethod"
            buildEditPath={posPaymentMethodEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/posPaymentMethods/center/sheetView/posPaymentMethodSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <TestPosTerminalConnection entity={_entity} onAction={bindRowAction} />
                    <ActivatePosPaymentMethod entity={_entity} onAction={bindRowAction} />
                    <DeactivatePosPaymentMethod entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <TestPosTerminalConnection entity={_entity} onAction={bindRowAction} />
                    <ActivatePosPaymentMethod entity={_entity} onAction={bindRowAction} />
                    <DeactivatePosPaymentMethod entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "testPosTerminalConnection") {
                    return (
                        <TestPosTerminalConnectionDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                        />
                    );
                }
                if (action === "activatePosPaymentMethod") {
                    return (
                        <ActivatePosPaymentMethodDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => listRef.current?.updateRow?.(entity._id, {isActive: true})}
                        />
                    );
                }
                if (action === "deactivatePosPaymentMethod") {
                    return (
                        <DeactivatePosPaymentMethodDialog
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
                <PosPaymentMethodCard
                    entity={entity}
                    onDelete={(row: PosPaymentMethod | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                    onActiveChanged={(isActive: boolean) => listRef.current?.updateRow?.(entity._id, {isActive})}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <PosPaymentMethodSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => { if (!opened) onOpenChange(); }}
                    entity={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<PosPaymentMethod>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posPaymentMethods/index.tsx"),
    withDebug(true, true, "posPaymentMethods"),
)(AllPosPaymentMethods);
