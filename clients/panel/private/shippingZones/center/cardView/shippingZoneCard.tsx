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
import type {ShippingZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/shippingZone/shippingZone.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconMapPin, IconTruckDelivery} from "@tabler/icons-react";
import ShippingZoneSheetView from "@eCommerceModule/clients/panel/private/shippingZones/center/sheetView/shippingZoneSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

const LIST_BASE = "/eCommerce/shippingzones";

function shippingZoneEditPath(shippingZone: ShippingZone) {
    const params = new URLSearchParams();
    params.set("shippingZoneId", shippingZone._id);
    if (shippingZone.name) params.set("shippingZoneName", encodeURIComponent(shippingZone.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ShippingZoneCardProps = WithLanguageType & {
    shippingZone: ShippingZone;
    onDelete?: (deleted?: ShippingZone, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ShippingZoneCard({
    shippingZone: shippingZoneProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ShippingZoneCardProps) {
    const [action, setAction] = useState<string>("");
    const [shippingZone, setShippingZone] = useState<ShippingZone>(shippingZoneProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(shippingZone, data);
        } else {
            setShippingZone({...shippingZone, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setShippingZone({
                ...shippingZone,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("shippingZones");

    useEffect(() => {
        setShippingZone(shippingZoneProp);
    }, [shippingZoneProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && shippingZone.deletedAt != null) {
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
                            <DeletedInfo deletedAt={shippingZone.deletedAt} deletedBy={shippingZone.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement showLock randomLength={0}>
                                        {read?.name && (
                                            <>
                                                {shippingZone.name ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("name")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{shippingZone.name}</div>
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
                                            accessModel={"shippingZones"}
                                            deletedData={shippingZone}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={shippingZoneEditPath(shippingZone)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("countries")}
                                        icon={IconMapPin}
                                        show={!!read?.countries}
                                        value={String(shippingZone.countries?.length ?? 0)}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("rates")}
                                        icon={IconTruckDelivery}
                                        show={!!(read as any)?.rates}
                                        value={String(shippingZone.rates?.length ?? 0)}
                                    />
                                </div>
                                {read?.isActive && shippingZone.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                            shippingZone.isActive ? "text-emerald-600" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                shippingZone.isActive ? "bg-emerald-500" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(shippingZone.isActive ? "active" : "inactive")}
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
                        <ShippingZoneSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            shippingZone={shippingZone}
                            fetchId={shippingZone._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"shippingZones"}
                            deleteId={shippingZone._id}
                            openAlert={action === "delete"}
                            name={read?.name && shippingZone.name}
                            confirmName={read?.name && shippingZone.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/shippingZone"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"shippingZones"}
                            deleteId={shippingZone._id}
                            openAlert={action === "restore"}
                            name={read?.name && shippingZone.name}
                            confirmName={read?.name && shippingZone.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/shippingZone/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/shippingZones/center/cardView/shippingZoneCard.tsx"),
    withDebug(true, true),
)(ShippingZoneCard);
