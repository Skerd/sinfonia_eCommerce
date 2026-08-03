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
import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconStar, IconUsers} from "@tabler/icons-react";
import CustomerGroupSheetView from "@eCommerceModule/clients/panel/private/customerGroups/center/sheetView/customerGroupSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import CustomerGroupRowMenuExtras from "@eCommerceModule/clients/panel/private/customerGroups/center/actions/customerGroupRowMenuExtras.tsx";
import ManageMembersDialog from "@eCommerceModule/clients/panel/private/customerGroups/center/dialogs/manageMembersDialog.tsx";
import SetDefaultCustomerGroupDialog from "@eCommerceModule/clients/panel/private/customerGroups/center/dialogs/setDefaultCustomerGroupDialog.tsx";

const LIST_BASE = "/tenancy/systemSettings/customergroups";

function customerGroupEditPath(customerGroup: CustomerGroup) {
    const params = new URLSearchParams();
    params.set("customerGroupId", customerGroup._id);
    if (customerGroup.name) params.set("customerGroupName", encodeURIComponent(customerGroup.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type CustomerGroupCardProps = WithLanguageType & {
    customerGroup: CustomerGroup;
    onDelete?: (deleted?: CustomerGroup, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onMembersChanged?: (memberCountDelta: 1 | -1) => void;
    onDefaultChanged?: (groupId: string) => void;
};

function CustomerGroupCard({
    customerGroup: customerGroupProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onMembersChanged,
    onDefaultChanged,
}: CustomerGroupCardProps) {
    const [action, setAction] = useState<string>("");
    const [customerGroup, setCustomerGroup] = useState<CustomerGroup>(customerGroupProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(customerGroup, data);
        } else {
            setCustomerGroup({...customerGroup, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setCustomerGroup({
                ...customerGroup,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("customerGroups");

    useEffect(() => {
        setCustomerGroup(customerGroupProp);
    }, [customerGroupProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && customerGroup.deletedAt != null) {
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
                            <DeletedInfo deletedAt={customerGroup.deletedAt} deletedBy={customerGroup.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1 flex items-center gap-2">
                                    <HiddenElement randomLength={10}>
                                        {read?.name && (
                                            <>
                                                {customerGroup.name ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("name")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{customerGroup.name}</div>
                                                    </TooltipDisplayer>
                                                ) : (
                                                    <ValueNotSet />
                                                )}
                                            </>
                                        )}
                                    </HiddenElement>
                                    {read?.isDefault && customerGroup.isDefault && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning/20 text-warning shrink-0">
                                            <IconStar className="w-3 h-3" />
                                            {resolveLanguageKey("default")}
                                        </span>
                                    )}
                                </div>
                                {!hideActions && (
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            accessModel={"customerGroups"}
                                            deletedData={customerGroup}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={customerGroupEditPath(customerGroup)}
                                            allowMenuForCustomChildren
                                        >
                                            <CustomerGroupRowMenuExtras
                                                customerGroup={customerGroup}
                                                onAction={(a: string) => setAction(a)}
                                            />
                                        </ActionMenu>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                {read?.description ? (
                                    customerGroup.description ? (
                                        <p className="text-xs text-muted-foreground line-clamp-2">{customerGroup.description}</p>
                                    ) : null
                                ) : (
                                    <HiddenElement showLock randomLength={8} />
                                )}
                                <InfoRow
                                    label={resolveLanguageKey("memberCount")}
                                    icon={IconUsers}
                                    show={!!(read as any)?.memberCount}
                                    value={String(customerGroup.memberCount ?? 0)}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <CustomerGroupSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            customerGroup={customerGroup}
                            fetchId={customerGroup._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onMembersChanged={onMembersChanged}
                            onDefaultChanged={(groupId: string) => {
                                setCustomerGroup((prev) => ({...prev, isDefault: true, _id: groupId}));
                                onDefaultChanged?.(groupId);
                            }}
                        />
                    )}
                    {action === "manageMembers" && (
                        <ManageMembersDialog
                            open
                            onClose={() => setAction("")}
                            customerGroup={customerGroup}
                            onSuccess={(delta: 1 | -1) => {
                                setCustomerGroup((prev) => ({
                                    ...prev,
                                    memberCount: Math.max(0, (prev.memberCount ?? 0) + delta),
                                }));
                                onMembersChanged?.(delta);
                            }}
                        />
                    )}
                    {action === "setDefaultCustomerGroup" && (
                        <SetDefaultCustomerGroupDialog
                            open
                            onClose={() => setAction("")}
                            entity={customerGroup}
                            onSuccess={() => {
                                setCustomerGroup((prev) => ({...prev, isDefault: true}));
                                onDefaultChanged?.(customerGroup._id);
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"customerGroups"}
                            deleteId={customerGroup._id}
                            openAlert={action === "delete"}
                            name={read?.name && customerGroup.name}
                            confirmName={read?.name && customerGroup.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/customerGroup"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"customerGroups"}
                            deleteId={customerGroup._id}
                            openAlert={action === "restore"}
                            name={read?.name && customerGroup.name}
                            confirmName={read?.name && customerGroup.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/customerGroup/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerGroups/center/cardView/customerGroupCard.tsx"),
    withDebug(true, true),
)(CustomerGroupCard);
