import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto.ts";
import {IconStar, IconUsers} from "@tabler/icons-react";
import CustomerGroupSheetView from "@eCommerceModule/clients/panel/private/customerGroups/center/sheetView/customerGroupSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CustomerGroupRowMenuExtras from "@eCommerceModule/clients/panel/private/customerGroups/center/actions/customerGroupRowMenuExtras.tsx";
import ManageMembersDialog from "@eCommerceModule/clients/panel/private/customerGroups/center/dialogs/manageMembersDialog.tsx";
import SetDefaultCustomerGroupDialog from "@eCommerceModule/clients/panel/private/customerGroups/center/dialogs/setDefaultCustomerGroupDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import DisplayValue from "@coreModule/components/custom/displayValue/displayValue.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {ReactNode, RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/customergroups";

function customerGroupEditPath(customerGroup: CustomerGroup) {
    const params = new URLSearchParams();
    params.set("customerGroupId", customerGroup._id);
    if (customerGroup.name) params.set("customerGroupName", encodeURIComponent(customerGroup.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type CustomerGroupCardProps = WithLanguageType & {
    customerGroup: CustomerGroup;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: CustomerGroup, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onMembersChanged?: (memberCountDelta: 1 | -1) => void;
    onDefaultChanged?: (groupId: string) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<CustomerGroup> | null>;
};

function CustomerGroupCard({
    customerGroup,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onMembersChanged,
    onDefaultChanged,
    innerRef,
}: CustomerGroupCardProps) {
    return (
        <EntityCard
            resource="customerGroups"
            entity={customerGroup}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/customerGroup/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={customerGroupEditPath}
            Sheet={CustomerGroupSheetView}
            sheetEntityProp="customerGroup"
            deleteUrl="/api/eCommerce/customerGroup"
            restoreUrl="/api/eCommerce/customerGroup/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onMembersChanged,
                onDefaultChanged: (groupId: string) => {
                    setEntity({...entity, isDefault: true, _id: groupId});
                    onDefaultChanged?.(groupId);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "manageMembers" && (
                        <ManageMembersDialog
                            open
                            onClose={() => setAction("")}
                            customerGroup={entity}
                            onSuccess={(delta: 1 | -1) => {
                                setEntity({
                                    ...entity,
                                    memberCount: Math.max(0, (entity.memberCount ?? 0) + delta),
                                });
                                onMembersChanged?.(delta);
                            }}
                        />
                    )}
                    {action === "setDefaultCustomerGroup" && (
                        <SetDefaultCustomerGroupDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isDefault: true});
                                onDefaultChanged?.(entity._id);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header
                        titlePath="name"
                        title={entity.name}
                        badges={
                            entity.isDefault ? (
                                <DisplayValue path="isDefault" value={resolveLanguageKey("default")}>
                                    {(formatted: ReactNode) => (
                                        <span className="inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-warning/20 text-warning shrink-0">
                                            <IconStar className="w-3 h-3" />
                                            {formatted}
                                        </span>
                                    )}
                                </DisplayValue>
                            ) : undefined
                        }
                    >
                        <CustomerGroupRowMenuExtras customerGroup={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            label={resolveLanguageKey("description")}
                            tooltip={resolveLanguageKey("description")}
                            path="description"
                            type="longText"
                            value={entity.description}
                        />
                        <DisplayRow
                            icon={IconUsers}
                            label={resolveLanguageKey("memberCount")}
                            tooltip={resolveLanguageKey("memberCount")}
                            path="memberCount"
                            type="number"
                            value={entity.memberCount}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerGroups/center/cardView/customerGroupCard.tsx"),
    withDebug(true, true, "customerGroups"),
)(CustomerGroupCard);
