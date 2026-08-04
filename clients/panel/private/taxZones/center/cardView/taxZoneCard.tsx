import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
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
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

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
    const {action, setAction, entity: taxZone, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: taxZoneProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("taxZones");


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
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={taxZone.deletedAt} deletedBy={taxZone.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={taxZone.name ?? <ValueNotSet />}
                                showTitle={!!read?.name}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
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
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <InfoRowGroup>
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
                                </InfoRowGroup>
                                {read?.isActive && taxZone.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
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
                </EntityCardShell>
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
                                setEntity((prev) => ({...prev, ...row}) as TaxZone);
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
                                setEntity((prev) => ({...prev, isActive: true}));
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
                                setEntity((prev) => ({...prev, isActive: false}));
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
