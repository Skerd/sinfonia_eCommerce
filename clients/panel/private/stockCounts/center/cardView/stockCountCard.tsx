import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {StockCount} from "armonia/src/modules/eCommerce/api/eCommerce/private/stockCount/stockCount.dto.ts";
import {IconListNumbers} from "@tabler/icons-react";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
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
    const companyZone = useCompanyTimeZone();
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
            hideEdit={(row) => row.status !== "draft"}
            Sheet={StockCountSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/stockCount"
            restoreUrl="/api/eCommerce/stockCount/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
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
                    <EntityCard.Header
                        titlePath="warehouse.name"
                        title={[row.warehouse?.name, formatDate(row.appliedAt ?? row.createdAt, {timeZone: companyZone, format: DATE_FORMATS.mediumDate})].filter(Boolean).join(" · ")}
                        badgesBesideTitle
                        badges={<StatusBadge tableConfigKey="stockCounts" field="status" value={row.status} label={String(resolveLanguageKey(`stockCountStatus.${row.status}`))} />}
                    >
                        <StockDocumentActionItems resource="stockCounts" entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        {row.lines?.length ? (
                            <EntityCardRow
                                icon={IconListNumbers}
                                label={resolveLanguageKey("lines")}
                                tooltip={resolveLanguageKey("lines")}
                                path="lines"
                                value={row.lines.length}
                            />
                        ) : null}
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
