import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {StockCount} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockCount/stockCount.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import StockDocumentActionItems from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionItems.tsx";
import StockDocumentActionDialog from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionDialog.tsx";
import StockCountCard from "./center/cardView/stockCountCard.tsx";
import StockCountSheetView, {stockCountEditPath} from "./center/sheetView/stockCountSheetView.tsx";
import {isStockDocumentAction} from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActions.ts";

function AllStockCounts({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<StockCount>
            apiUrl="/api/eCommerce/stockCount"
            collectionName="stockCounts"
            accessModel="stockCounts"
            tableConfigKey="stockCounts"
            rowActionMenu={{allowMenuForCustomChildren: true, hideEdit: (row) => row.status !== "draft"}}
            createPath="/eCommerce/stockcounts/create"
            createIcon={<IconPlus />}
            createLanguageKey="createStockCount"
            buildEditPath={stockCountEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/stockCounts/center/sheetView/stockCountSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderActionMenuChildren={(entity, bindRowAction) => (
                <StockDocumentActionItems resource="stockCounts" entity={entity} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => isStockDocumentAction("stockCounts", action) && (
                <StockDocumentActionDialog
                    resource="stockCounts"
                    action={action}
                    entity={entity}
                    onClose={resetAction}
                    onSuccess={(patch) => listRef.current?.updateRow?.(entity._id, patch as Partial<StockCount>)}
                />
            )}
            renderCard={(entity, onDelete, onRestore) => (
                <StockCountCard
                    entity={entity}
                    onDelete={(row: StockCount | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(entity)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore, listRef}) => (
                <StockCountSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    entity={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(row: Record<string, unknown>) => {
                        listRef.current?.updateRow?.(entity._id, row as Partial<StockCount>);
                    }}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/stockCounts/index.tsx"),
    withDebug(true, true, "stockCounts"),
)(AllStockCounts);
