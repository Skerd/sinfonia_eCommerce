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
import type {PosPaymentMethod} from "armonia/src/modules/eCommerce/api/eCommerce/private/posPaymentMethod/posPaymentMethod.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconHash, IconCreditCard} from "@tabler/icons-react";
import PosPaymentMethodSheetView from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/sheetView/posPaymentMethodSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ActivatePosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/activatePosPaymentMethod.tsx";
import DeactivatePosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/deactivatePosPaymentMethod.tsx";
import TestPosTerminalConnection from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/actions/testPosTerminalConnection.tsx";
import ActivatePosPaymentMethodDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/activatePosPaymentMethodDialog.tsx";
import DeactivatePosPaymentMethodDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/deactivatePosPaymentMethodDialog.tsx";
import TestPosTerminalConnectionDialog from "@eCommerceModule/clients/panel/private/posPaymentMethods/center/dialogs/testPosTerminalConnectionDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/pospaymentmethods";

function posPaymentMethodEditPath(entity: PosPaymentMethod) {
    const params = new URLSearchParams();
    params.set("posPaymentMethodId", entity._id);
    if (entity.name) params.set("posPaymentMethodTitle", encodeURIComponent(entity.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type PosPaymentMethodCardProps = WithLanguageType & {
    entity: PosPaymentMethod;
    onDelete?: (deleted?: PosPaymentMethod, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function PosPaymentMethodCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: PosPaymentMethodCardProps) {
    const [action, setAction] = useState<string>("");
    const [entity, setEntity] = useState<PosPaymentMethod>(entityProp);
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

    const {read, restore} = useAccess("posPaymentMethods");

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
                                            accessModel={"posPaymentMethods"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={posPaymentMethodEditPath(entity)}
                                            allowMenuForCustomChildren
                                        >
                                            <TestPosTerminalConnection entity={entity} onAction={(a: string) => setAction(a)} />
                                            <ActivatePosPaymentMethod entity={entity} onAction={(a: string) => setAction(a)} />
                                            <DeactivatePosPaymentMethod entity={entity} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("type")}
                                        icon={IconCreditCard}
                                        show={!!read?.type}
                                        value={entity.type ? resolveLanguageKey("paymentType." + entity.type) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("sequence")}
                                        icon={IconHash}
                                        show={!!read?.sequence}
                                        value={entity.sequence != null ? String(entity.sequence) : undefined}
                                    />
                                </div>
                                {read?.isActive && entity.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                            entity.isActive ? "text-emerald-600" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                entity.isActive ? "bg-emerald-500" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(entity.isActive ? "active" : "inactive")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <PosPaymentMethodSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onSheetRowPatched={(row) => setEntity(row as PosPaymentMethod)}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"posPaymentMethods"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/posPaymentMethod"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"posPaymentMethods"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={read?.name && entity.name}
                            confirmName={read?.name && entity.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/posPaymentMethod/restore"
                        />
                    )}
                    {action === "activatePosPaymentMethod" && (
                        <ActivatePosPaymentMethodDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(method) => setEntity(method)}
                        />
                    )}
                    {action === "deactivatePosPaymentMethod" && (
                        <DeactivatePosPaymentMethodDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={(method) => setEntity(method)}
                        />
                    )}
                    {action === "testPosTerminalConnection" && (
                        <TestPosTerminalConnectionDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posPaymentMethods/center/cardView/posPaymentMethodCard.tsx"),
    withDebug(true, true),
)(PosPaymentMethodCard);
