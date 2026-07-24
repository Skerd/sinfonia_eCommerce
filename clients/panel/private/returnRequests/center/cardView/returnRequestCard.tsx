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
import type {ReturnRequest} from "armonia/src/modules/eCommerce/api/eCommerce/private/returnRequest/returnRequest.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconRefresh, IconTag, IconCurrencyDollar} from "@tabler/icons-react";
import ReturnRequestSheetView from "@eCommerceModule/clients/panel/private/returnRequests/center/sheetView/returnRequestSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

const LIST_BASE = "/eCommerce/returnrequests";

function returnRequestEditPath(entity: ReturnRequest) {
    const params = new URLSearchParams();
    params.set("returnRequestId", entity._id);
    if ((entity as any).type) params.set("returnRequestTitle", encodeURIComponent(String((entity as any).type)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ReturnRequestCardProps = WithLanguageType & {
    entity: ReturnRequest;
    onDelete?: (deleted?: ReturnRequest, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ReturnRequestCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ReturnRequestCardProps) {
    const [action, setAction] = useState<string>("");
    const [entity, setEntity] = useState<ReturnRequest>(entityProp);
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
            } as ReturnRequest);
        }
    };

    const {read, restore} = useAccess("returnRequests");

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
                                        {(read as any)?.type && (
                                            <>
                                                {(entity as any).type ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("type")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{String((entity as any).type)}</div>
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
                                            accessModel={"returnRequests"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={returnRequestEditPath(entity)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("type")}
                                        icon={IconRefresh}
                                        show={!!(read as any)?.type}
                                        value={(entity as any).type ? resolveLanguageKey("returnType." + (entity as any).type) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("status")}
                                        icon={IconTag}
                                        show={!!(read as any)?.status}
                                        value={(entity as any).status ? resolveLanguageKey("returnStatus." + (entity as any).status) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("refundAmount")}
                                        icon={IconCurrencyDollar}
                                        show={!!(read as any)?.refundAmount}
                                        value={(entity as any).refundAmount != null ? String((entity as any).refundAmount) : undefined}
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
                        <ReturnRequestSheetView
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
                            accessModel={"returnRequests"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={(read as any)?.type && String((entity as any).type ?? "")}
                            confirmName={(read as any)?.type && String((entity as any).type ?? "")}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/returnRequest"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"returnRequests"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={(read as any)?.type && String((entity as any).type ?? "")}
                            confirmName={(read as any)?.type && String((entity as any).type ?? "")}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/returnRequest/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/returnRequests/center/cardView/returnRequestCard.tsx"),
    withDebug(true, true),
)(ReturnRequestCard);
