import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {type EntityListRefs} from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CustomerGroupCard from "./center/cardView/customerGroupCard.tsx";
import CustomerGroupRowMenuExtras from "./center/actions/customerGroupRowMenuExtras.tsx";
import ManageMembersDialog from "./center/dialogs/manageMembersDialog.tsx";
import SetDefaultCustomerGroupDialog from "./center/dialogs/setDefaultCustomerGroupDialog.tsx";

export function customerGroupEditPath(g: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("customerGroupId", g._id);
    if (g.name) params.set("customerGroupName", encodeURIComponent(g.name));
    return `/tenancy/systemSettings/customergroups/edit?${params.toString()}`;
}

function applySetDefaultToList(
    listRef: EntityListRefs<CustomerGroup> | null | undefined,
    defaultGroupId: string,
) {
    listRef?.current?.mapRows?.((row) => {
        if (row._id === defaultGroupId) return {isDefault: true};
        if (row.isDefault) return {isDefault: false};
    });
}

function applyMemberCountDelta(
    listRef: EntityListRefs<CustomerGroup> | null | undefined,
    groupId: string,
    delta: number,
) {
    listRef?.current?.mapRows?.((row) => {
        if (row._id !== groupId) return;
        return {memberCount: Math.max(0, (row.memberCount ?? 0) + delta)};
    });
}

function AllCustomerGroups({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<CustomerGroup>
            apiUrl="/api/eCommerce/customerGroup"
            collectionName="customerGroups"
            accessModel="customerGroups"
            tableConfigKey="customerGroups"
            createPath="/tenancy/systemSettings/customergroups/create"
            createIcon={<IconPlus />}
            createLanguageKey="createCustomerGroup"
            buildEditPath={customerGroupEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/customerGroups/center/sheetView/customerGroupSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderCard={(customerGroup, onDelete, onRestore, listRef) => (
                <CustomerGroupCard
                    customerGroup={customerGroup}
                    onDelete={(row: CustomerGroup | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(customerGroup)}
                    onMembersChanged={(delta: 1 | -1) => applyMemberCountDelta(listRef, customerGroup._id, delta)}
                    onDefaultChanged={(groupId: string) => applySetDefaultToList(listRef, groupId)}
                />
            )}
            renderActionMenuChildren={(entity, bindRowAction) => (
                <CustomerGroupRowMenuExtras customerGroup={entity} onAction={bindRowAction} />
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "manageMembers") {
                    return (
                        <ManageMembersDialog
                            open
                            onClose={resetAction}
                            customerGroup={entity}
                            onSuccess={(delta: 1 | -1) => applyMemberCountDelta(listRef, entity._id, delta)}
                        />
                    );
                }
                if (action === "setDefaultCustomerGroup") {
                    return (
                        <SetDefaultCustomerGroupDialog
                            open
                            onClose={resetAction}
                            entity={entity}
                            onSuccess={() => applySetDefaultToList(listRef, entity._id)}
                        />
                    );
                }
                return null;
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerGroups/index.tsx"),
    withDebug(true, true, "customerGroups"),
)(AllCustomerGroups);
