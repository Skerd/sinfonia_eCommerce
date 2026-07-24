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
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconActivity, IconCash, IconUser} from "@tabler/icons-react";
import PosOrderSheetView from "@eCommerceModule/clients/panel/private/posOrders/center/sheetView/posOrderSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

type PosOrderCardProps = WithLanguageType & {
    entity: PosOrder;
    onDelete?: (deleted?: PosOrder, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function PosOrderCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: PosOrderCardProps) {
    const [action, setAction] = useState<string>("");
    const [entity, setEntity] = useState<PosOrder>(entityProp);
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
            });
        }
    };

    const {read, restore} = useAccess("posOrders");

    useEffect(() => {
        setEntity(entityProp);
    }, [entityProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && entity.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const customerDisplay =
        entity.customerName ||
        [entity.customer?.name, entity.customer?.surname].filter(Boolean).join(" ") ||
        undefined;

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn("group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={entity.deletedAt} deletedBy={entity.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement showLock randomLength={0}>
                                        {read?.name && (
                                            <>
                                                {entity.name ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("name")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{entity.name}</div>
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
                                            accessModel={"posOrders"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath=""
                                            hideEdit
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("state")}
                                        icon={IconActivity}
                                        show={!!read?.state}
                                        value={entity.state ? resolveLanguageKey("orderState." + entity.state) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("customer")}
                                        icon={IconUser}
                                        show={!!(read as any)?.customerName || !!(read as any)?.customer}
                                        value={customerDisplay}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("amountTotal")}
                                        icon={IconCash}
                                        show={!!read?.amountTotal}
                                        value={entity.amountTotal != null ? String(entity.amountTotal) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("payments")}
                                        icon={IconCash}
                                        show={!!(read as any)?.payments && !!entity.payments?.length}
                                        value={entity.payments
                                            ?.map(
                                                (p) =>
                                                    `${p.paymentMethodName || p.paymentMethodLabel?.name || "—"}: ${p.amount}`,
                                            )
                                            .join(" · ")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {!!action && action === "view" && (
                <PosOrderSheetView
                    open={action === "view"}
                    onOpenChange={() => setAction("")}
                    entity={entity}
                    fetchId={entity._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/cardView/posOrderCard.tsx"),
    withDebug(true, true),
)(PosOrderCard);
