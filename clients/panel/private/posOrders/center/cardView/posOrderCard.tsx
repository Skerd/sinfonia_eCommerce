import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import {IconCash, IconPackage, IconUser} from "@tabler/icons-react";
import PosOrderSheetView from "@eCommerceModule/clients/panel/private/posOrders/center/sheetView/posOrderSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReprintPosOrder from "@eCommerceModule/clients/panel/private/posOrders/center/actions/reprintPosOrder.tsx";
import ReprintPosOrderDialog from "@eCommerceModule/clients/panel/private/posOrders/center/dialogs/reprintPosOrderDialog.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function stateColor(state: string): string {
    switch (state) {
        case "paid":
            return "text-success bg-success";
        case "draft":
            return "text-warning bg-warning";
        case "cancel":
        case "refunded":
            return "text-destructive bg-destructive";
        default:
            return "text-info bg-info";
    }
}

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
            sheetOnly={sheetOnly}
            editPath={() => ""}
            Sheet={PosOrderSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/posOrder"
            restoreUrl="/api/eCommerce/posOrder/restore"
            failedTitle=""
            failedDescription=""
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
                const colors = stateColor(row.state);
                const customerDisplay = row.customerName
                    || [row.customer?.name, row.customer?.surname].filter(Boolean).join(" ");
                return (
                    <>
                        <EntityCard.Header titlePath="name" title={row.name}>
                            <ReprintPosOrder entity={row} onAction={setAction} />
                        </EntityCard.Header>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconUser className="h-3.5 w-3.5 shrink-0" />
                                <DisplayValue
                                    path={row.customerName ? "customerName" : "customer"}
                                    type={row.customerName ? undefined : "user"}
                                    value={row.customerName ? customerDisplay : row.customer}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
                                        colors.split(" ")[0],
                                    )}
                                >
                                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", colors.split(" ")[1])} />
                                    <DisplayValue
                                        path="state"
                                        type="enum"
                                        languageKeyCategory="orderState"
                                        value={row.state}
                                    />
                                </span>
                                <span className="ml-auto inline-flex items-center gap-1 text-base font-bold leading-none text-foreground">
                                    <IconCash className="h-3.5 w-3.5 text-muted-foreground" />
                                    <DisplayValue path="amountTotal" type="locale" value={row.amountTotal} />
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconPackage className="h-3.5 w-3.5 shrink-0" />
                                <DisplayValue path="lines" type="number" value={row.lines?.length} />
                                <span>{resolveLanguageKey("items")}</span>
                            </div>
                        </div>
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
