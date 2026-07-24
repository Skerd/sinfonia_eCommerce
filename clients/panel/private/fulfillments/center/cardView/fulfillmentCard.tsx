import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Fulfillment} from "armonia/src/modules/eCommerce/api/eCommerce/private/fulfillment/fulfillment.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconTag, IconTruck, IconHash} from "@tabler/icons-react";
import FulfillmentSheetView from "@eCommerceModule/clients/panel/private/fulfillments/center/sheetView/fulfillmentSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

const LIST_BASE = "/eCommerce/fulfillments";

function fulfillmentEditPath(entity: Fulfillment) {
    const params = new URLSearchParams();
    params.set("fulfillmentId", entity._id);
    if ((entity as any).trackingNumber) params.set("fulfillmentTitle", encodeURIComponent(String((entity as any).trackingNumber)));
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
    const [action, setAction] = useState<string>("");
    const [entity, setEntity] = useState<Fulfillment>(entityProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(entity, data);
        } else {
            setEntity({...entity, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setEntity({
                ...entity,
                deletedAt: undefined,
                deletedBy: undefined,
            } as Fulfillment);
        }
    };

    const {read, restore} = useAccess("fulfillments");

    useEffect(() => {
        setEntity(entityProp);
    }, [entityProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && (entity as any).deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn("group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {((read as any).deletedBy || (read as any).deletedAt) && (
                            <DeletedInfo deletedAt={(entity as any).deletedAt} deletedBy={(entity as any).deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement showLock randomLength={0}>
                                        {(read as any)?.trackingNumber && (
                                            <>
                                                {(entity as any).trackingNumber ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("trackingNumber")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{String((entity as any).trackingNumber)}</div>
                                                    </TooltipDisplayer>
                                                ) : (
                                                    <ValueNotSet />
                                                )}
                                            </>
                                        )}
                                    </HiddenElement>
                                </div>
                                {!hideActions && (
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            accessModel={"fulfillments"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={fulfillmentEditPath(entity)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("status")}
                                        icon={IconTag}
                                        show={!!(read as any)?.status}
                                        value={(entity as any).status ? resolveLanguageKey("fulfillmentStatus." + (entity as any).status) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("carrier")}
                                        icon={IconTruck}
                                        show={!!(read as any)?.carrier}
                                        value={(entity as any).carrier != null ? String((entity as any).carrier) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("trackingNumber")}
                                        icon={IconHash}
                                        show={!!(read as any)?.trackingNumber}
                                        value={(entity as any).trackingNumber != null ? String((entity as any).trackingNumber) : undefined}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
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
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"fulfillments"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={(read as any)?.trackingNumber && String((entity as any).trackingNumber ?? "")}
                            confirmName={(read as any)?.trackingNumber && String((entity as any).trackingNumber ?? "")}
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
                            name={(read as any)?.trackingNumber && String((entity as any).trackingNumber ?? "")}
                            confirmName={(read as any)?.trackingNumber && String((entity as any).trackingNumber ?? "")}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/fulfillment/restore"
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
