import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconTag, IconTruck} from "@tabler/icons-react";
import FulfillmentSheetView from "@eCommerceModule/clients/panel/private/fulfillments/center/sheetView/fulfillmentSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ShipFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/shipFulfillment.tsx";
import MarkDeliveredFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/markDeliveredFulfillment.tsx";
import MarkFailedFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/center/actions/markFailedFulfillment.tsx";
import ShipFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/shipFulfillmentDialog.tsx";
import MarkDeliveredFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/markDeliveredFulfillmentDialog.tsx";
import MarkFailedFulfillmentDialog from "@eCommerceModule/clients/panel/private/fulfillments/center/dialogs/markFailedFulfillmentDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/eCommerce/fulfillments";

function fulfillmentEditPath(entity: Fulfillment) {
    const params = new URLSearchParams();
    params.set("fulfillmentId", entity._id);
    if (entity.trackingNumber) params.set("fulfillmentTitle", encodeURIComponent(String(entity.trackingNumber)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type FulfillmentCardProps = WithLanguageType & {
    entity: Fulfillment;
    onDelete?: (deleted?: Fulfillment, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function FulfillmentCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: FulfillmentCardProps) {
    const {action, setAction, entity: entity, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: entityProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("fulfillments");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && entity.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={entity.deletedAt} deletedBy={entity.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={null}
                                showTitle={true}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                            accessModel={"fulfillments"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={fulfillmentEditPath(entity)}
                                            allowMenuForCustomChildren
                                        >
                                            <ShipFulfillment entity={entity} onAction={(a: string) => setAction(a)} />
                                            <MarkDeliveredFulfillment entity={entity} onAction={(a: string) => setAction(a)} />
                                            <MarkFailedFulfillment entity={entity} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <div className="flex flex-col gap-y-1">
                                    <InfoRowGroup>
<InfoRow
                                        label={resolveLanguageKey("status")}
                                        icon={IconTag}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.status ? 0 : 6}>
                                                {!!read?.status && entity.status
                                                    ? resolveLanguageKey("fulfillmentStatus." + entity.status)
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                                </InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("carrier")}
                                        icon={IconTruck}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.carrier ? 0 : 8}>
                                                {!!read?.carrier && entity.carrier != null
                                                    ? String(entity.carrier)
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                            </div>
                        </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <FulfillmentSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onSheetRowPatched={(row: Partial<Fulfillment>) => setEntity(row as Fulfillment)}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"fulfillments"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={read?.trackingNumber && String(entity.trackingNumber ?? "")}
                            confirmName={read?.trackingNumber && String(entity.trackingNumber ?? "")}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/fulfillment"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"fulfillments"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={read?.trackingNumber && String(entity.trackingNumber ?? "")}
                            confirmName={read?.trackingNumber && String(entity.trackingNumber ?? "")}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/fulfillment/restore"
                        />
                    )}
                    {action === "shipFulfillment" && (
                        <ShipFulfillmentDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(patch: Partial<Fulfillment>) => setEntity({...entity, ...patch})}
                        />
                    )}
                    {action === "markDeliveredFulfillment" && (
                        <MarkDeliveredFulfillmentDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(patch: Partial<Fulfillment>) => setEntity({...entity, ...patch})}
                        />
                    )}
                    {action === "markFailedFulfillment" && (
                        <MarkFailedFulfillmentDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(patch: Partial<Fulfillment>) => setEntity({...entity, ...patch})}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/fulfillments/center/cardView/fulfillmentCard.tsx"),
    withDebug(true, true),
)(FulfillmentCard);
