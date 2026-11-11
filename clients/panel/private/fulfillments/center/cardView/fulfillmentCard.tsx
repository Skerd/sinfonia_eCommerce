import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";
import {IconCalendarEvent, IconTruck} from "@tabler/icons-react";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import FulfillmentSheetView from "@eCommerceModule/clients/panel/private/fulfillments/center/sheetView/fulfillmentSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ShipFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/shipFulfillment.tsx";
import MarkDeliveredFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/markDeliveredFulfillment.tsx";
import MarkFailedFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/markFailedFulfillment.tsx";
import ShipFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/shipFulfillmentDialog.tsx";
import MarkDeliveredFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/markDeliveredFulfillmentDialog.tsx";
import MarkFailedFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/markFailedFulfillmentDialog.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/eCommerce/fulfillments";

function fulfillmentEditPath(entity: Fulfillment) {
    const params = new URLSearchParams();
    params.set("fulfillmentId", entity._id);
    if (entity.trackingNumber) params.set("fulfillmentTitle", encodeURIComponent(String(entity.trackingNumber)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type FulfillmentCardProps = WithLanguageType & {
    entity: Fulfillment;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Fulfillment, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Fulfillment> | null>;
};

function FulfillmentCard({
    entity,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: FulfillmentCardProps) {
    return (
        <EntityCard
            resource="fulfillments"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/fulfillment/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={fulfillmentEditPath}
            Sheet={FulfillmentSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/fulfillment"
            restoreUrl="/api/eCommerce/fulfillment/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="trackingNumber"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onSheetRowPatched: (patched: Partial<Fulfillment>) => {
                    setEntity({...row, ...patched});
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {action === "shipFulfillment" && (
                        <ShipFulfillmentDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={(patch: Partial<Fulfillment>) => setEntity({...row, ...patch})}
                        />
                    )}
                    {action === "markDeliveredFulfillment" && (
                        <MarkDeliveredFulfillmentDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={(patch: Partial<Fulfillment>) => setEntity({...row, ...patch})}
                        />
                    )}
                    {action === "markFailedFulfillment" && (
                        <MarkFailedFulfillmentDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={(patch: Partial<Fulfillment>) => setEntity({...row, ...patch})}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => {
                // The order it ships and the carrier; the tracking number is the subtitle (UX-01). Never an empty title.
                const name = [row.order?.orderNumber, row.carrier].filter(Boolean).join(" · ");
                const shippedOrDelivered = row.deliveredAt ?? row.shippedAt;
                return (
                    <>
                        <EntityCard.Header
                            titlePath={name ? ["order", "carrier"] : "trackingNumber"}
                            title={name || row.trackingNumber || String(resolveLanguageKey("typeLabel"))}
                            subtitlePath="trackingNumber"
                            subtitle={name ? row.trackingNumber : undefined}
                            badgesBesideTitle
                            badges={<StatusBadge tableConfigKey="fulfillments" field="status" value={row.status} label={String(resolveLanguageKey(`fulfillmentStatus.${row.status}`))} />}
                        >
                            <ShipFulfillment entity={row} onAction={setAction} />
                            <MarkDeliveredFulfillment entity={row} onAction={setAction} />
                            <MarkFailedFulfillment entity={row} onAction={setAction} />
                        </EntityCard.Header>
                        <EntityCard.Body>
                            {shippedOrDelivered ? (
                                <EntityCardRow
                                    icon={IconCalendarEvent}
                                    label={resolveLanguageKey(row.deliveredAt ? "deliveredAt" : "shippedAt")}
                                    tooltip={resolveLanguageKey(row.deliveredAt ? "deliveredAt" : "shippedAt")}
                                    path={row.deliveredAt ? "deliveredAt" : "shippedAt"}
                                    type="date"
                                    value={shippedOrDelivered}
                                />
                            ) : row.estimatedDeliveryAt ? (
                                <EntityCardRow
                                    icon={IconTruck}
                                    label={resolveLanguageKey("estimatedDeliveryAt")}
                                    tooltip={resolveLanguageKey("estimatedDeliveryAt")}
                                    path="estimatedDeliveryAt"
                                    type="date"
                                    value={row.estimatedDeliveryAt}
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
    withLanguage("src/modules/eCommerce/clients/panel/private/fulfillments/center/cardView/fulfillmentCard.tsx"),
    withDebug(true, true, "fulfillments"),
)(FulfillmentCard);
