import {compose} from "redux";
import {useMemo} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type QuickFilterDef} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {COLUMN_TYPE} from "armonia/src/modules/core/database/filter/typeOperators.ts";
import {IconPlus} from "@tabler/icons-react";
import type {StockCount} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockCount/stockCount.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import StockDocumentActionItems from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionItems.tsx";
import StockDocumentActionDialog from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionDialog.tsx";
import StockCountCard from "./center/cardView/stockCountCard.tsx";
import StockCountSheetView, {stockCountEditPath} from "./center/sheetView/stockCountSheetView.tsx";
import {isStockDocumentAction} from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActions.ts";

function AllStockCounts({resolveLanguageKey}: WithLanguageType) {
    const quickFilters = useMemo<QuickFilterDef[]>(() => [
        {
            field: "status",
            label: String(resolveLanguageKey("fields.status")),
            type: COLUMN_TYPE.ENUM,
            enumValues: ["draft", "applied", "cancelled"].map((value) => ({
                value,
                label: String(resolveLanguageKey(`fields.!enums.status.${value}`)),
            })),
        },
        {
            field: "warehouse",
            label: String(resolveLanguageKey("fields.warehouse")),
            type: COLUMN_TYPE.OBJECT_ID,
            apiUrl: "/api/eCommerce/warehouse/select",
        },
    ], [resolveLanguageKey]);

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
            quickFilters={quickFilters}
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
