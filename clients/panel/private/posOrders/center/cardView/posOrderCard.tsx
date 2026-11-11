import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import {IconCalendarEvent, IconCash, IconPackage} from "@tabler/icons-react";
import PosOrderSheetView from "@eCommerceModule/clients/panel/private/posOrders/center/sheetView/posOrderSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReprintPosOrder from "@eCommerceModule/clients/panel/private/posOrders/center/actions/reprintPosOrder.tsx";
import ReprintPosOrderDialog from "@eCommerceModule/clients/panel/private/posOrders/center/dialogs/reprintPosOrderDialog.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";
import {getName} from "@coreModule/helpers/general/names.ts";

type PosOrderCardProps = WithLanguageType & {
    entity: PosOrder;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: PosOrder, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<PosOrder> | null>;
};

function PosOrderCard({
    entity,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: PosOrderCardProps) {
    return (
        <EntityCard
            resource="posOrders"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/posOrder/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit
            hideDelete
            hideRestore
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={PosOrderSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/posOrder"
            restoreUrl="/api/eCommerce/posOrder/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
            extraDialogs={({action, setAction, entity: row}) => (
                <>
                    {action === "reprintPosOrder" && (
                        <ReprintPosOrderDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => {
                const customerLabel = row.customerName || getName(row.customer) || String(resolveLanguageKey("walkIn"));
                return (
                    <>
                        <EntityCard.Header
                            titlePath={row.customerName ? "customerName" : "customer"}
                            title={customerLabel}
                            subtitlePath="name"
                            subtitle={row.name}
                            badgesBesideTitle
                            badges={<StatusBadge tableConfigKey="posOrders" field="state" value={row.state} label={String(resolveLanguageKey(`orderState.${row.state}`))} />}
                        >
                            <ReprintPosOrder entity={row} onAction={setAction} />
                        </EntityCard.Header>
                        {/* When → how much → how many items; the state is the badge (UX-02). */}
                        <EntityCard.Body>
                            <EntityCardRow
                                icon={IconCalendarEvent}
                                label={resolveLanguageKey("soldAt")}
                                tooltip={resolveLanguageKey("soldAt")}
                                path="createdAt"
                                type="dateTime"
                                value={row.createdAt}
                            />
                            <EntityCardRow
                                icon={IconCash}
                                label={resolveLanguageKey("total")}
                                tooltip={resolveLanguageKey("total")}
                                path="amountTotal"
                                type="currency"
                                value={{amount: row.amountTotal, currency: row.currency}}
                            />
                            {row.lines?.length ? (
                                <EntityCardRow
                                    icon={IconPackage}
                                    label={resolveLanguageKey("itemCount")}
                                    tooltip={resolveLanguageKey("itemCount")}
                                    path="lines"
                                    type="number"
                                    value={row.lines.length}
                                />
                            ) : null}
                        </EntityCard.Body>
                    </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/cardView/posOrderCard.tsx"),
    withDebug(true, true, "posOrders"),
)(PosOrderCard);
