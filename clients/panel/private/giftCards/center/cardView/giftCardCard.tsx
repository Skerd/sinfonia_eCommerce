import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {cn} from "@coreModule/components/lib/utils.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import GiftCardSheetView from "@eCommerceModule/clients/panel/private/giftCards/center/sheetView/giftCardSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {GiftIcon} from "lucide-react";
import EnableGiftCard from "@eCommerceModule/clients/panel/private/giftCards/center/actions/enableGiftCard.tsx";
import DisableGiftCard from "@eCommerceModule/clients/panel/private/giftCards/center/actions/disableGiftCard.tsx";
import EnableGiftCardDialog from "@eCommerceModule/clients/panel/private/giftCards/center/dialogs/enableGiftCardDialog.tsx";
import DisableGiftCardDialog from "@eCommerceModule/clients/panel/private/giftCards/center/dialogs/disableGiftCardDialog.tsx";

export type GiftCardEntity = {
    _id: string;
    code: string;
    initialBalance: number;
    balance: number;
    status: string;
    currency?: {_id?: string; symbol?: string; abbreviation?: string};
    purchasedBy?: {_id?: string; name?: string; surname?: string};
    order?: {_id: string; orderNumber?: string};
    company?: {_id: string; name?: string};
    expiresAt?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    deletedBy?: unknown;
};

type GiftCardCardProps = WithLanguageType & {
    entity: GiftCardEntity;
    onDelete?: (deleted?: GiftCardEntity, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function statusColor(status: string): string {
    switch (status) {
        case "active":
            return "text-emerald-600 bg-emerald-500";
        case "depleted":
            return "text-muted-foreground bg-muted-foreground";
        case "disabled":
            return "text-red-600 bg-red-500";
        default:
            return "text-sky-600 bg-sky-500";
    }
}

function formatMoney(amount: number, symbol: string): string {
    const n = amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return symbol ? `${symbol} ${n}` : n;
}

function GiftCardCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: GiftCardCardProps) {
    const [action, setAction] = useState<string>("");
    const [entity, setEntity] = useState<GiftCardEntity>(entityProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(entity, data);
        } else {
            setEntity({...entity, ...data} as GiftCardEntity);
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setEntity({...entity, deletedAt: undefined, deletedBy: undefined});
        }
    };

    const {read, restore} = useAccess("giftCards");

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

    const symbol = entity.currency?.symbol ?? entity.currency?.abbreviation ?? "";
    const buyerName = [entity.purchasedBy?.name, entity.purchasedBy?.surname].filter(Boolean).join(" ");
    const colors = statusColor(entity.status);
    const initial = entity.initialBalance || 0;
    const remainingPct = initial > 0 ? Math.min(100, Math.max(0, (entity.balance / initial) * 100)) : 0;

    return (
        <>
            {!sheetOnly && (
                <div
                    className={cn(
                        "group relative flex h-full w-full cursor-pointer flex-col rounded-2xl bg-card p-5 shadow-sm",
                        "border border-border/60 transition-all duration-300 hover:shadow-md",
                    )}
                    onClick={() => setAction("view")}
                >
                    {((read as any).deletedBy || (read as any).deletedAt) && (
                        <DeletedInfo deletedAt={entity.deletedAt as any} deletedBy={entity.deletedBy as any} />
                    )}

                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                                <GiftIcon className="size-4 text-muted-foreground" />
                            </div>
                            {(read as any)?.code && (
                                <span className="truncate font-mono text-sm font-semibold tracking-wide">
                                    {entity.code}
                                </span>
                            )}
                        </div>
                        {!hideActions && (
                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    accessModel={"giftCards"}
                                    deletedData={entity}
                                    onAction={(a: string) => setAction(a)}
                                    editPath=""
                                    hideEdit
                                    allowMenuForCustomChildren
                                >
                                    <EnableGiftCard entity={entity} onAction={(a: string) => setAction(a)} />
                                    <DisableGiftCard entity={entity} onAction={(a: string) => setAction(a)} />
                                </ActionMenu>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 space-y-1">
                        {(read as any)?.balance && entity.balance != null && (
                            <>
                                <p className="text-2xl font-semibold tabular-nums leading-none tracking-tight">
                                    {formatMoney(entity.balance, symbol)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {resolveLanguageKey("ofInitial").replace(
                                        "{amount}",
                                        formatMoney(entity.initialBalance, symbol),
                                    )}
                                </p>
                            </>
                        )}
                    </div>

                    {(read as any)?.balance && initial > 0 && (
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    entity.status === "active"
                                        ? "bg-emerald-500"
                                        : entity.status === "disabled"
                                          ? "bg-red-500"
                                          : "bg-muted-foreground",
                                )}
                                style={{width: `${remainingPct}%`}}
                            />
                        </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3 mt-4">
                        {(read as any)?.status && entity.status ? (
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                    colors.split(" ")[0],
                                )}
                            >
                                <span className={cn("size-1.5 shrink-0 rounded-full", colors.split(" ")[1])} />
                                {resolveLanguageKey("giftCardStatus." + entity.status)}
                            </span>
                        ) : (
                            <span />
                        )}
                        {(read as any)?.purchasedBy && buyerName ? (
                            <span className="truncate text-xs text-muted-foreground">{buyerName}</span>
                        ) : null}
                    </div>
                </div>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <GiftCardSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onSheetRowPatched={(row) => setEntity(row as GiftCardEntity)}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"giftCards"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={entity.code}
                            confirmName={entity.code}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/giftCard"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"giftCards"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={entity.code}
                            confirmName={entity.code}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/giftCard/restore"
                        />
                    )}
                    {action === "enableGiftCard" && (
                        <EnableGiftCardDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(row) => setEntity(row)}
                        />
                    )}
                    {action === "disableGiftCard" && (
                        <DisableGiftCardDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(row) => setEntity(row)}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/giftCards/center/cardView/giftCardCard.tsx"),
    withDebug(true, true),
)(GiftCardCard);
