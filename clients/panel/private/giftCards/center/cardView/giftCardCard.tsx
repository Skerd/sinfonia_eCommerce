import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconCurrencyDollar, IconTag, IconUser} from "@tabler/icons-react";
import GiftCardSheetView from "@eCommerceModule/clients/panel/private/giftCards/center/sheetView/giftCardSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

export type GiftCardEntity = {
    _id: string;
    code: string;
    initialBalance: number;
    balance: number;
    status: string;
    currency?: {symbol?: string; abbreviation?: string};
    purchasedBy?: {name?: string; surname?: string};
    deletedAt?: string;
    deletedBy?: unknown;
};

type GiftCardCardProps = WithLanguageType & {
    entity: GiftCardEntity;
    onDelete?: (deleted?: GiftCardEntity, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
};

function GiftCardCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
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

    return (
        <>
            <Card
                className={cn("group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer")}
                onClick={() => setAction("view")}
            >
                <div className="flex w-full items-stretch">
                    {((read as any).deletedBy || (read as any).deletedAt) && (
                        <DeletedInfo deletedAt={entity.deletedAt as any} deletedBy={entity.deletedBy as any} />
                    )}
                    <div className="w-full min-w-0 py-3">
                        <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-base leading-tight truncate font-mono">{entity.code}</div>
                            </div>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel={"giftCards"}
                                        deletedData={entity}
                                        onAction={(a: string) => setAction(a)}
                                        editPath=""
                                        hideEdit
                                    />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1 text-sm px-4 pt-0">
                            <InfoRow
                                label={resolveLanguageKey("status")}
                                icon={IconTag}
                                show={!!(read as any)?.status}
                                value={entity.status ? resolveLanguageKey("giftCardStatus." + entity.status) : undefined}
                            />
                            <InfoRow
                                label={resolveLanguageKey("balance")}
                                icon={IconCurrencyDollar}
                                show={!!(read as any)?.balance}
                                value={entity.balance != null ? `${symbol} ${entity.balance.toFixed(2)} / ${entity.initialBalance.toFixed(2)}`.trim() : undefined}
                            />
                            <InfoRow
                                label={resolveLanguageKey("purchasedBy")}
                                icon={IconUser}
                                show={!!(read as any)?.purchasedBy}
                                value={buyerName || undefined}
                            />
                        </div>
                    </div>
                </div>
            </Card>

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
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/giftCards/center/cardView/giftCardCard.tsx"),
    withDebug(true, true),
)(GiftCardCard);
