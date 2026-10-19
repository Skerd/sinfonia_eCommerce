import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Flag, Tag, User} from "lucide-react";
import type {ListingFlag} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ListingFlagSheetView from "@eCommerceModule/clients/panel/private/listingFlags/center/sheetView/listingFlagSheetView.tsx";
import ResolveListingFlagDropdown from "@eCommerceModule/clients/panel/private/listingFlags/center/actions/resolveListingFlagDropdown.tsx";
import DismissListingFlagDropdown from "@eCommerceModule/clients/panel/private/listingFlags/center/actions/dismissListingFlagDropdown.tsx";
import ChangeListingFlagLifecycleAction, {
    type ListingFlagLifecycleVerb,
} from "@eCommerceModule/components/custom/listingFlags/changeListingFlagLifecycleAction.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

function listingFlagEditPath(flag: ListingFlag) {
    const params = new URLSearchParams();
    params.set("listingFlagId", flag._id);
    return `/eCommerceMarketplace/listingflags/edit?${params.toString()}`;
}

type ListingFlagCardProps = WithLanguageType & {
    listingFlag: ListingFlag;
    fetchId?: string;
    onDelete?: (deleted?: ListingFlag, response?: DeletedData) => void;
    onRestore?: () => void;
    onLifecyclePatched?: (patch: Partial<ListingFlag>) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<ListingFlag> | null>;
};

function ListingFlagCard({
    listingFlag,
    fetchId,
    onDelete,
    onRestore,
    onLifecyclePatched,
    resolveLanguageKey,
    hideActions = false,
    sheetOnly = false,
    innerRef,
}: ListingFlagCardProps) {
    return (
        <EntityCard
            resource="listingflags"
            entity={listingFlag}
            fetchId={fetchId}
            singleUrl="/api/eCommerceMarketplace/listingFlag/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            hideEdit={(row) => row.status !== "pending"}
            sheetOnly={sheetOnly}
            editPath={listingFlagEditPath}
            Sheet={ListingFlagSheetView}
            sheetEntityProp="listingFlag"
            deleteUrl="/api/eCommerceMarketplace/listingFlag"
            restoreUrl="/api/eCommerceMarketplace/listingFlag/restore"
            failedTitle=""
            failedDescription=""
            titlePath="listing.title"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onListLifecyclePatched: (patch: Partial<ListingFlag>) => {
                    setEntity({...row, ...patch});
                    onLifecyclePatched?.(patch);
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {(action === "resolve" || action === "dismiss") && (
                        <ChangeListingFlagLifecycleAction
                            listingFlagId={row._id}
                            listingFlagTitle={row.listing?.title}
                            verb={action as ListingFlagLifecycleVerb}
                            openAlert
                            url={`/api/eCommerceMarketplace/listingFlag/${action}`}
                            onSuccess={(patch: Partial<ListingFlag>) => {
                                setEntity({...row, ...patch});
                                onLifecyclePatched?.(patch);
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="listing.title" title={row.listing?.title}>
                        <ResolveListingFlagDropdown listingFlag={row} onAction={setAction} />
                        <DismissListingFlagDropdown listingFlag={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={Tag}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="status_values"
                            value={row.status}
                        />
                        <EntityCardRow
                            icon={Flag}
                            label={resolveLanguageKey("reason")}
                            tooltip={resolveLanguageKey("reason")}
                            path="reason"
                            type="enum"
                            languageKeyCategory="reason_values"
                            value={row.reason}
                        />
                        <EntityCardRow
                            icon={User}
                            label={resolveLanguageKey("reporter")}
                            tooltip={resolveLanguageKey("reporter")}
                            path="user"
                            type="user"
                            value={row.user}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listingFlags/center/cardView/listingFlagCard.tsx"),
    withDebug(true, true, "listingflags"),
)(ListingFlagCard);
