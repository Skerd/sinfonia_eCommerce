import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import PosOrderCard from "./center/cardView/posOrderCard.tsx";
import ReprintPosOrder from "./center/actions/reprintPosOrder.tsx";
import ReprintPosOrderDialog from "./center/dialogs/reprintPosOrderDialog.tsx";

function AllPosOrders({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "state",
            label: String(resolveLanguageKey("fields.state")),
            type: COLUMN_TYPE.ENUM,
            enumValues: ["draft", "paid", "cancel", "refunded"].map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.state.${value}`)),
            })),
        },
        {
            field: "config",
            label: String(resolveLanguageKey("fields.config")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/posConfig/select",
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<PosOrder>
            apiUrl="/api/eCommerce/posOrder"
            collectionName="posOrders"
            accessModel="posOrders"
            tableConfigKey="posOrders"
            hideCreate
            buildEditPath={() => ""}
            rowActionMenu={{hideEdit: true, hideDelete: true, hideRestore: true, allowMenuForCustomChildren: true}}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
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
