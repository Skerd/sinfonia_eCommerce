import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import FulfillmentCard from "./center/cardView/fulfillmentCard.tsx";
import FulfillmentSheetView from "./center/sheetView/fulfillmentSheetView.tsx";
import ShipFulfillment from "./center/actions/shipFulfillment.tsx";
import MarkDeliveredFulfillment from "./center/actions/markDeliveredFulfillment.tsx";
import MarkFailedFulfillment from "./center/actions/markFailedFulfillment.tsx";
import ShipFulfillmentDialog from "./center/dialogs/shipFulfillmentDialog.tsx";
import MarkDeliveredFulfillmentDialog from "./center/dialogs/markDeliveredFulfillmentDialog.tsx";
import MarkFailedFulfillmentDialog from "./center/dialogs/markFailedFulfillmentDialog.tsx";

export function fulfillmentEditPath(entity: {_id: string; trackingNumber?: string}) {
    const params = new URLSearchParams();
    params.set("fulfillmentId", entity._id);
    if (entity.trackingNumber) params.set("fulfillmentTitle", encodeURIComponent(String(entity.trackingNumber)));
    return `/eCommerce/fulfillments/edit?${params.toString()}`;
}

function AllFulfillments({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Fulfillment>
            apiUrl="/api/eCommerce/fulfillment"
            collectionName="fulfillments"
            accessModel="fulfillments"
            tableConfigKey="fulfillments"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            createPath="/eCommerce/fulfillments/create"
            createIcon={<IconPlus />}
            createLanguageKey="createFulfillment"
            buildEditPath={fulfillmentEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/fulfillments/center/sheetView/fulfillmentSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ShipFulfillment entity={_entity} onAction={bindRowAction} />
                    <MarkDeliveredFulfillment entity={_entity} onAction={bindRowAction} />
                    <MarkFailedFulfillment entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderSheetActionMenuChildren={(_entity, bindRowAction) => (
                <>
                    <ShipFulfillment entity={_entity} onAction={bindRowAction} />
                    <MarkDeliveredFulfillment entity={_entity} onAction={bindRowAction} />
                    <MarkFailedFulfillment entity={_entity} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "shipFulfillment") {
                    return (
                        <ShipFulfillmentDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={(row) => listRef.current?.updateRow?.(entity._id, row)}
                        />
                    );
                }
                if (action === "markDeliveredFulfillment") {
                    return (
                        <MarkDeliveredFulfillmentDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={(row) => listRef.current?.updateRow?.(entity._id, row)}
                        />
                    );
                }
                if (action === "markFailedFulfillment") {
                    return (
                        <MarkFailedFulfillmentDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={(row) => listRef.current?.updateRow?.(entity._id, row)}
                        />
                    );
                }
                return null;
            }}
            renderCard={(entity, onDelete, onRestore) => (
                <FulfillmentCard
                    entity={entity}
                    onDelete={(row: Fulfillment | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <FulfillmentSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    entity={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<Fulfillment>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fulfillments/index.tsx"),
    withDebug(true, true),
)(AllFulfillments);
