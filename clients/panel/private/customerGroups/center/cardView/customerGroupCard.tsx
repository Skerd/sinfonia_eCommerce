import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
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
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

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
    const {action, setAction, entity: customerGroup, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: customerGroupProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("customerGroups");


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
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={customerGroup.deletedAt} deletedBy={customerGroup.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={customerGroup.name ?? <ValueNotSet />}
                                showTitle={!!read?.name}
                                badges={<span className="inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning/20 text-warning shrink-0">
                                            <IconStar className="w-3 h-3" />
                                            {resolveLanguageKey("default")}
                                        </span>}
                                showBadges={true}
                                hideActions={hideActions}
                                actionMenu={
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
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                {read?.description ? (
                                    customerGroup.description ? (
                                        <p className="text-xs text-muted-foreground line-clamp-2">{customerGroup.description}</p>
                                    ) : null
                                ) : (
                                    <HiddenElement showLock randomLength={8} />
                                )}
                                <InfoRowGroup>
<InfoRow
                                    label={resolveLanguageKey("memberCount")}
                                    icon={IconUsers}
                                    show={!!(read as any)?.memberCount}
                                    value={String(customerGroup.memberCount ?? 0)}
                                />
                                </InfoRowGroup>
                            </div>
                        </div>
                    </div>
                </EntityCardShell>
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
                                setEntity((prev) => ({...prev, isDefault: true, _id: groupId}));
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
                                setEntity((prev) => ({
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
                                setEntity((prev) => ({...prev, isDefault: true}));
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
