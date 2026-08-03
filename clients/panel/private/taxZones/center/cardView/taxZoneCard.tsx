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
import type {TaxZone} from "armonia/src/modules/eCommerce/api/eCommerce/private/taxZone/taxZone.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconHash, IconMapPin, IconReceiptTax} from "@tabler/icons-react";
import TaxZoneSheetView from "@eCommerceModule/clients/panel/private/taxZones/center/sheetView/taxZoneSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ActivateTaxZone from "@eCommerceModule/clients/panel/private/taxZones/center/actions/activateTaxZone.tsx";
import DeactivateTaxZone from "@eCommerceModule/clients/panel/private/taxZones/center/actions/deactivateTaxZone.tsx";
import ActivateTaxZoneDialog from "@eCommerceModule/clients/panel/private/taxZones/center/dialogs/activateTaxZoneDialog.tsx";
import DeactivateTaxZoneDialog from "@eCommerceModule/clients/panel/private/taxZones/center/dialogs/deactivateTaxZoneDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/taxzones";

function taxZoneEditPath(taxZone: TaxZone) {
    const params = new URLSearchParams();
    params.set("taxZoneId", taxZone._id);
    if (taxZone.name) params.set("taxZoneName", encodeURIComponent(taxZone.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type TaxZoneCardProps = WithLanguageType & {
    taxZone: TaxZone;
    onDelete?: (deleted?: TaxZone, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
};

function TaxZoneCard({
    taxZone: taxZoneProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onActiveChanged,
}: TaxZoneCardProps) {
    const [action, setAction] = useState<string>("");
    const [taxZone, setTaxZone] = useState<TaxZone>(taxZoneProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(taxZone, data);
        } else {
            setTaxZone({...taxZone, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setTaxZone({
                ...taxZone,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("taxZones");

    useEffect(() => {
        setTaxZone(taxZoneProp);
    }, [taxZoneProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && taxZone.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn("group p-0 h-full relative transition-[box-shadow,--tw-ring-color] duration-200 hover:cursor-pointer hover:shadow-md hover:ring-primary/40")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={taxZone.deletedAt} deletedBy={taxZone.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement randomLength={10}>
                                        {read?.name && (
                                            <>
                                                {taxZone.name ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("name")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{taxZone.name}</div>
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
                                            accessModel={"taxZones"}
                                            deletedData={taxZone}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={taxZoneEditPath(taxZone)}
                                            allowMenuForCustomChildren
                                        >
                                            <ActivateTaxZone entity={taxZone} onAction={(a: string) => setAction(a)} />
                                            <DeactivateTaxZone entity={taxZone} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("country")}
                                        icon={IconMapPin}
                                        show={!!read?.country}
                                        value={
                                            taxZone.country ?
                                            <HiddenElement randomLength={6}>
                                                {
                                                    read?.country?.keys?.name ?
                                                    <p>{taxZone.country.name}</p>
                                                    :
                                                    null
                                                }
                                            </HiddenElement>
                                            :
                                            undefined
                                        }
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("rates")}
                                        icon={IconReceiptTax}
                                        show={!!(read as any)?.rates}
                                        value={String(taxZone.rates?.length ?? 0)}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("priority")}
                                        icon={IconHash}
                                        show={!!read?.priority}
                                        value={taxZone.priority != null ? String(taxZone.priority) : undefined}
                                    />
                                </div>
                                {read?.isActive && taxZone.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                            taxZone.isActive ? "text-success" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                taxZone.isActive ? "bg-success" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(taxZone.isActive ? "active" : "inactive")}
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
                        <TaxZoneSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            taxZone={taxZone}
                            fetchId={taxZone._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onSheetRowPatched={(row: Partial<TaxZone>) => {
                                setTaxZone((prev) => ({...prev, ...row}) as TaxZone);
                                if (typeof row.isActive === "boolean") {
                                    onActiveChanged?.(row.isActive);
                                }
                            }}
                        />
                    )}
                    {action === "activateTaxZone" && (
                        <ActivateTaxZoneDialog
                            open
                            onClose={() => setAction("")}
                            entity={taxZone}
                            onSuccess={() => {
                                setTaxZone((prev) => ({...prev, isActive: true}));
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateTaxZone" && (
                        <DeactivateTaxZoneDialog
                            open
                            onClose={() => setAction("")}
                            entity={taxZone}
                            onSuccess={() => {
                                setTaxZone((prev) => ({...prev, isActive: false}));
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"taxZones"}
                            deleteId={taxZone._id}
                            openAlert={action === "delete"}
                            name={read?.name && taxZone.name}
                            confirmName={read?.name && taxZone.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/taxZone"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"taxZones"}
                            deleteId={taxZone._id}
                            openAlert={action === "restore"}
                            name={read?.name && taxZone.name}
                            confirmName={read?.name && taxZone.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/taxZone/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/taxZones/center/cardView/taxZoneCard.tsx"),
    withDebug(true, true),
)(TaxZoneCard);
