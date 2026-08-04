import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconMapPin, IconPhone} from "@tabler/icons-react";
import CustomerAddressSheetView from "@eCommerceModule/clients/panel/private/customerAddresses/center/sheetView/customerAddressSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import SetDefaultCustomerAddress from "@eCommerceModule/clients/panel/private/customerAddresses/center/actions/setDefaultCustomerAddress.tsx";
import SetDefaultCustomerAddressDialog from "@eCommerceModule/clients/panel/private/customerAddresses/center/dialogs/setDefaultCustomerAddressDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/eCommerce/customeraddresses";

function customerAddressEditPath(entity: CustomerAddress) {
    const params = new URLSearchParams();
    params.set("customerAddressId", entity._id);
    if (entity.firstName) params.set("customerAddressTitle", encodeURIComponent(String(entity.firstName)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type CustomerAddressCardProps = WithLanguageType & {
    entity: CustomerAddress;
    onDelete?: (deleted?: CustomerAddress, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onDefaultChanged?: (addressId: string) => void;
};

function CustomerAddressCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onDefaultChanged,
}: CustomerAddressCardProps) {
    const {action, setAction, entity: entity, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: entityProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("customerAddresses");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && entity.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const displayName = [
        read?.firstName ? entity.firstName : "",
        read?.lastName ? entity.lastName : "",
    ]
        .filter(Boolean)
        .join(" ");
    const canReadName = !!(read?.firstName || read?.lastName);

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={entity.deletedAt} deletedBy={entity.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={null}
                                showTitle={true}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                            accessModel={"customerAddresses"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={customerAddressEditPath(entity)}
                                            allowMenuForCustomChildren
                                        >
                                            <SetDefaultCustomerAddress
                                                entity={entity}
                                                onAction={(a: string) => setAction(a)}
                                            />
                                        </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("street")}
                                        icon={IconMapPin}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.street ? 0 : 10}>
                                                {!!read?.street && entity.street != null
                                                    ? String(entity.street)
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("city")}
                                        icon={IconMapPin}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.city?.keys?.name ? 0 : 8}>
                                                {!!read?.city?.keys?.name && entity.city?.name
                                                    ? entity.city.name
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("phone")}
                                        icon={IconPhone}
                                        show
                                        value={
                                            <HiddenElement randomLength={read?.phone ? 0 : 8}>
                                                {!!read?.phone && entity.phone != null
                                                    ? String(entity.phone)
                                                    : null}
                                            </HiddenElement>
                                        }
                                    />
                                </InfoRowGroup>
                                <HiddenElement randomLength={read?.isDefault ? 0 : 6}>
                                    {!!read?.isDefault && entity.isDefault != null ? (
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
                                                entity.isDefault ? "text-warning" : "text-muted-foreground",
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                                    entity.isDefault ? "bg-warning" : "bg-muted-foreground/40",
                                                )}
                                            />
                                            {resolveLanguageKey(entity.isDefault ? "defaultAddress" : "notDefault")}
                                        </span>
                                    ) : null}
                                </HiddenElement>
                            </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <CustomerAddressSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onDefaultChanged={(addressId: string) => {
                                setEntity((prev) => ({...prev, isDefault: true, _id: addressId}));
                                onDefaultChanged?.(addressId);
                            }}
                            onSheetRowPatched={(row: Partial<CustomerAddress>) => setEntity(row as CustomerAddress)}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"customerAddresses"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={canReadName && displayName}
                            confirmName={canReadName && displayName}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/customerAddress"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"customerAddresses"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={canReadName && displayName}
                            confirmName={canReadName && displayName}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/customerAddress/restore"
                        />
                    )}
                    {action === "setDefaultCustomerAddress" && (
                        <SetDefaultCustomerAddressDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isDefault: true}));
                                onDefaultChanged?.(entity._id);
                            }}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerAddresses/center/cardView/customerAddressCard.tsx"),
    withDebug(true, true),
)(CustomerAddressCard);
