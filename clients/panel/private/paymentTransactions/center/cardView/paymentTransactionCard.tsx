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
import type {PaymentTransaction} from "armonia/src/modules/eCommerce/api/eCommerce/private/paymentTransaction/paymentTransaction.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconCreditCard, IconActivity, IconCurrencyDollar, IconTag} from "@tabler/icons-react";
import PaymentTransactionSheetView from "@eCommerceModule/clients/panel/private/paymentTransactions/center/sheetView/paymentTransactionSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

const LIST_BASE = "/eCommerce/paymenttransactions";

function paymentTransactionEditPath(entity: PaymentTransaction) {
    const params = new URLSearchParams();
    params.set("paymentTransactionId", entity._id);
    if ((entity as any).gatewayTransactionId) params.set("paymentTransactionTitle", encodeURIComponent(String((entity as any).gatewayTransactionId)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type PaymentTransactionCardProps = WithLanguageType & {
    entity: PaymentTransaction;
    onDelete?: (deleted?: PaymentTransaction, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function PaymentTransactionCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: PaymentTransactionCardProps) {
    const [action, setAction] = useState<string>("");
    const [entity, setEntity] = useState<PaymentTransaction>(entityProp);
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
            } as PaymentTransaction);
        }
    };

    const {read, restore} = useAccess("paymentTransactions");

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
                                        {((read as any)?.gatewayTransactionId || (read as any)?.type) && (
                                            <>
                                                {(entity as any).displayTitle ||
                                                (entity as any).gatewayTransactionId ||
                                                (entity as any).amountDisplay ? (
                                                    <TooltipDisplayer
                                                        tooltip={resolveLanguageKey(
                                                            (entity as any).gatewayTransactionId
                                                                ? "gatewayTransactionId"
                                                                : "type",
                                                        )}
                                                    >
                                                        <div className="font-semibold text-base leading-tight truncate">
                                                            {String(
                                                                (entity as any).gatewayTransactionId ||
                                                                    [
                                                                        (() => {
                                                                            const key = `paymentTransactionType.${String((entity as any).type)}`;
                                                                            const resolved = resolveLanguageKey(key);
                                                                            return resolved !== key
                                                                                ? resolved
                                                                                : String((entity as any).type ?? "");
                                                                        })(),
                                                                        (entity as any).amountDisplay ||
                                                                            (entity as any).displayTitle,
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(" · ") ||
                                                                    (entity as any).displayTitle,
                                                            )}
                                                        </div>
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
                                            accessModel={"paymentTransactions"}
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
                                        label={resolveLanguageKey("type")}
                                        icon={IconTag}
                                        show={!!(read as any)?.type}
                                        value={
                                            (entity as any).type != null
                                                ? (() => {
                                                      const key = `paymentTransactionType.${String((entity as any).type)}`;
                                                      const resolved = resolveLanguageKey(key);
                                                      return resolved !== key ? resolved : String((entity as any).type);
                                                  })()
                                                : undefined
                                        }
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("gateway")}
                                        icon={IconCreditCard}
                                        show={!!(read as any)?.gateway}
                                        value={
                                            (entity as any).gateway != null
                                                ? (() => {
                                                      const key = `paymentTransactionGateway.${String((entity as any).gateway)}`;
                                                      const resolved = resolveLanguageKey(key);
                                                      return resolved !== key ? resolved : String((entity as any).gateway);
                                                  })()
                                                : undefined
                                        }
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("status")}
                                        icon={IconActivity}
                                        value={
                                            (entity as any).status != null
                                                ? (() => {
                                                      const key = `paymentTransactionStatus.${String((entity as any).status)}`;
                                                      const resolved = resolveLanguageKey(key);
                                                      return resolved !== key ? resolved : String((entity as any).status);
                                                  })()
                                                : undefined
                                        }
                                        show={!!(read as any)?.status}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("amount")}
                                        icon={IconCurrencyDollar}
                                        show={!!(read as any)?.amount}
                                        value={
                                            (entity as any).amountDisplay ??
                                            ((entity as any).amount != null ? String((entity as any).amount) : undefined)
                                        }
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
                        <PaymentTransactionSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/paymentTransactions/center/cardView/paymentTransactionCard.tsx"),
    withDebug(true, true),
)(PaymentTransactionCard);
