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
    const [action, setAction] = useState<string>("");
    const [entity, setEntity] = useState<CustomerAddress>(entityProp);
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
            } as CustomerAddress);
        }
    };

    const {read, restore} = useAccess("customerAddresses");

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

    const displayName = [entity.firstName, entity.lastName].filter(Boolean).join(" ");

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
                                        {read?.firstName && (
                                            <>
                                                {displayName ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("firstName")}>
                                                        <div className="font-semibold text-base leading-tight truncate">
                                                            {displayName}
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
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("street")}
                                        icon={IconMapPin}
                                        show={!!read?.street}
                                        value={entity.street != null ? String(entity.street) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("city")}
                                        icon={IconMapPin}
                                        show={!!read?.city}
                                        value={entity.city?.name}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("phone")}
                                        icon={IconPhone}
                                        show={!!read?.phone}
                                        value={entity.phone != null ? String(entity.phone) : undefined}
                                    />
                                </div>
                                {read?.isDefault && entity.isDefault != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                            entity.isDefault ? "text-amber-600" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                entity.isDefault ? "bg-amber-500" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(entity.isDefault ? "defaultAddress" : "notDefault")}
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
                        <CustomerAddressSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onDefaultChanged={(addressId) => {
                                setEntity((prev) => ({...prev, isDefault: true, _id: addressId}));
                                onDefaultChanged?.(addressId);
                            }}
                            onSheetRowPatched={(row) => setEntity(row as CustomerAddress)}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"customerAddresses"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={read?.firstName && displayName}
                            confirmName={read?.firstName && displayName}
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
                            name={read?.firstName && displayName}
                            confirmName={read?.firstName && displayName}
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
