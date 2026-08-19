import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosOrderCard from "./center/cardView/posOrderCard.tsx";
import ReprintPosOrder from "./center/actions/reprintPosOrder.tsx";
import ReprintPosOrderDialog from "./center/dialogs/reprintPosOrderDialog.tsx";

function AllPosOrders({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<PosOrder>
            apiUrl="/api/eCommerce/posOrder"
            collectionName="posOrders"
            accessModel="posOrders"
            tableConfigKey="posOrders"
            hideCreate
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true, allowMenuForCustomChildren: true}}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/posOrders/center/sheetView/posOrderSheetView.tsx"
            renderActionMenuChildren={(entity, bindRowAction) => (
                <ReprintPosOrder entity={entity} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction}) => {
                if (action === "reprintPosOrder") {
                    return (
                        <ReprintPosOrderDialog
                            open={true}
                            onClose={resetAction}
                            entity={entity}
                        />
                    );
                }
                return null;
            }}
            renderCard={(entity, onDelete, onRestore) => (
                <PosOrderCard
                    entity={entity}
                    onDelete={(row: PosOrder | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/index.tsx"),
    withDebug(true, true, "posOrders"),
)(AllPosOrders);
