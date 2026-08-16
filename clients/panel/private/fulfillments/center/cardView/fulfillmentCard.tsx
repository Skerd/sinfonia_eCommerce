import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";
import {IconTag, IconTruck} from "@tabler/icons-react";
import FulfillmentSheetView from "@eCommerceModule/clients/panel/private/fulfillments/center/sheetView/fulfillmentSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ShipFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/shipFulfillment.tsx";
import MarkDeliveredFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/markDeliveredFulfillment.tsx";
import MarkFailedFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/markFailedFulfillment.tsx";
import ShipFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/shipFulfillmentDialog.tsx";
import MarkDeliveredFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/markDeliveredFulfillmentDialog.tsx";
import MarkFailedFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/markFailedFulfillmentDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
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
            failedTitle=""
            failedDescription=""
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
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="trackingNumber" title={row.trackingNumber}>
                        <ShipFulfillment entity={row} onAction={setAction} />
                        <MarkDeliveredFulfillment entity={row} onAction={setAction} />
                        <MarkFailedFulfillment entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconTag}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="fulfillmentStatus"
                            value={row.status}
                        />
                        <DisplayRow
                            icon={IconTruck}
                            label={resolveLanguageKey("carrier")}
                            tooltip={resolveLanguageKey("carrier")}
                            path="carrier"
                            value={row.carrier}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fulfillments/center/cardView/fulfillmentCard.tsx"),
    withDebug(true, true),
)(FulfillmentCard);
