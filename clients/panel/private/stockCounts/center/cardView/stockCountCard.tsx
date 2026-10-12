import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {StockCount} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockCount/stockCount.dto.ts";
import {IconListNumbers, IconTag} from "@tabler/icons-react";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import StockDocumentActionItems from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionItems.tsx";
import StockDocumentActionDialog from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActionDialog.tsx";
import StockCountSheetView, {stockCountEditPath} from "@eCommerceModule/clients/panel/private/stockCounts/center/sheetView/stockCountSheetView.tsx";
import {isStockDocumentAction} from "@eCommerceModule/components/custom/stockDocuments/stockDocumentActions.ts";

type StockCountCardProps = WithLanguageType & {
    entity: StockCount;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: StockCount, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
};

function StockCountCard({entity, resolveLanguageKey, fetchId, hideActions = false, onDelete, onRestore, sheetOnly = false}: StockCountCardProps) {
    return (
        <EntityCard
            resource="stockCounts"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/stockCount/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={stockCountEditPath}
            Sheet={StockCountSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/stockCount"
            restoreUrl="/api/eCommerce/stockCount/restore"
            failedTitle=""
            failedDescription=""
            titlePath="warehouse.name"
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patched: Partial<StockCount>) => setEntity({...row, ...patched}),
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => isStockDocumentAction("stockCounts", action) ? (
                <StockDocumentActionDialog
                    resource="stockCounts"
                    action={action}
                    entity={row}
                    onClose={() => setAction("")}
                    onSuccess={(patch) => setEntity({...row, ...patch} as StockCount)}
                />
            ) : null}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="warehouse.name" title={row.warehouse?.name}>
                        <StockDocumentActionItems resource="stockCounts" entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconTag}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="stockCountStatus"
                            value={row.status}
                        />
                        <EntityCardRow
                            icon={IconListNumbers}
                            label={resolveLanguageKey("lines")}
                            tooltip={resolveLanguageKey("lines")}
                            path="lines"
                            value={row.lines?.length}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/stockCounts/center/cardView/stockCountCard.tsx"),
    withDebug(true, true, "stockCounts"),
)(StockCountCard);
