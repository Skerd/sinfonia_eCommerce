import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {DropdownMenuItem} from "@coreModule/components/ui/dropdown-menu.tsx";
import {IconPlus, IconUsers} from "@tabler/icons-react";
import type {CustomerGroup} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerGroup/customerGroup.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CustomerGroupCard from "./center/cardView/customerGroupCard.tsx";
import ManageMembersModal from "./manageMembersModal.tsx";

export function customerGroupEditPath(g: {_id: string; name?: string}) {
    const params = new URLSearchParams();
    params.set("customerGroupId", g._id);
    if (g.name) params.set("customerGroupName", encodeURIComponent(g.name));
    return `/eCommerce/customergroups/edit?${params.toString()}`;
}

function AllCustomerGroups({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<CustomerGroup>
            apiUrl="/api/eCommerce/customerGroup"
            collectionName="customerGroups"
            accessModel="customerGroups"
            tableConfigKey="customerGroups"
            createPath="/eCommerce/customergroups/create"
            createIcon={<IconPlus />}
            createLanguageKey="createCustomerGroup"
            buildEditPath={customerGroupEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerce/clients/panel/private/customerGroups/center/sheetView/customerGroupSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{allowMenuForCustomChildren: true}}
            renderCard={(customerGroup, onDelete, onRestore) => (
                <CustomerGroupCard
                    customerGroup={customerGroup}
                    onDelete={(row: CustomerGroup | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(customerGroup)}
                />
            )}
            renderActionMenuChildren={(entity, bindRowAction) => (
                <DropdownMenuItem
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        bindRowAction("manageMembers");
                    }}
                >
                    <IconUsers size={16} />
                    {String(resolveLanguageKey("manageMembers") ?? "Manage members")}
                </DropdownMenuItem>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) =>
                action === "manageMembers" ? (
                    <ManageMembersModal
                        open
                        onOpenChange={(open) => {
                            if (!open) resetAction();
                        }}
                        customerGroup={entity}
                        resolveLanguageKey={resolveLanguageKey}
                        onSuccess={() => listRef.current?.refetch()}
                    />
                ) : null
            }
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerGroups/index.tsx"),
    withDebug(true, true),
)(AllCustomerGroups);
