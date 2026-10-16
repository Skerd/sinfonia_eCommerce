import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import {IconPlus} from "@tabler/icons-react";
import type {StockTransfer} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockTransfer/stockTransfer.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import StockDocumentActionItems from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionItems.tsx";
import StockDocumentActionDialog from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionDialog.tsx";
import StockTransferCard from "./center/cardView/stockTransferCard.tsx";
import StockTransferSheetView, {stockTransferEditPath} from "./center/sheetView/stockTransferSheetView.tsx";
import {isStockDocumentAction} from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActions.ts";

function AllStockTransfers({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: String(resolveLanguageKey("fields.status")),
            type: COLUMN_TYPE.ENUM,
            enumValues: ["draft", "done", "cancelled"].map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.status.${value}`)),
            })),
        },
        {
            field: "fromWarehouse",
            label: String(resolveLanguageKey("fields.fromWarehouse")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/warehouse/select",
        },
    ], [resolveLanguageKey]);

    return (
        <EntityListPage<StockTransfer>
            apiUrl="/api/eCommerce/stockTransfer"
            collectionName="stockTransfers"
            accessModel="stockTransfers"
            tableConfigKey="stockTransfers"
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: (row) => row.status !== "draft"}}
            createPath="/eCommerce/stocktransfers/create"
            createIcon={<IconPlus />}
            createLanguageKey="createStockTransfer"
            buildEditPath={stockTransferEditPath}
            resolveLanguageKey={resolveLanguageKey}
            quickFilters={quickFilters}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/stockTransfers/center/sheetView/stockTransferSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(entity, bindRowAction) => (
                <StockDocumentActionItems resource="stockTransfers" entity={entity} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => isStockDocumentAction("stockTransfers", action) && (
                <StockDocumentActionDialog
                    resource="stockTransfers"
                    action={action}
                    entity={entity}
                    onClose={resetAction}
                    onSuccess={(patch) => listRef.current?.updateRow?.(entity._id, patch as Partial<StockTransfer>)}
                />
            )}
            renderCard={(entity, onDelete, onRestore) => (
                <StockTransferCard
                    entity={entity}
                    onDelete={(row: StockTransfer | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <StockTransferSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    entity={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<StockTransfer>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/stockTransfers/index.tsx"),
    withDebug(true, true, "stockTransfers"),
)(AllStockTransfers);
