import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {OrderRevision} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderRevision/orderRevision.dto.ts";
import OrderRevisionSheetView from "@eCommerceModule/clients/panel/private/orderRevisions/center/sheetView/orderRevisionSheetView.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";

type OrderRevisionCardProps = WithLanguageType & {
    revision: OrderRevision;
};

/** One revision the customer asked for, on the order sheet. */
function OrderRevisionCard({revision}: OrderRevisionCardProps) {
    return (
        <EntityCard
            resource="orderRevisions"
            entity={revision}
            singleUrl="/api/eCommerceMarketplace/orderRevision/single"
            hideEdit
            hideDelete
            hideRestore
            editPath={() => ""}
            Sheet={OrderRevisionSheetView}
            sheetEntityProp="revision"
            deleteUrl="/api/eCommerceMarketplace/orderRevision"
            restoreUrl="/api/eCommerceMarketplace/orderRevision/restore"
            failedTitle=""
            failedDescription=""
            titlePath="createdAt"
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header
                        titlePath="createdAt"
                        title={<DisplayValue path="createdAt" type="dateTime" value={row.createdAt} />}
                        badges={<DisplayValue path="status" type="enum" languageKeyCategory="orderRevisionStatus" value={row.status} />}
                    />
                    <div className="flex flex-col gap-2">
                        <DisplayValue path="reason" value={row.reason}>
                            {(text) => <p className="line-clamp-3 text-xs leading-normal text-muted-foreground">{text}</p>}
                        </DisplayValue>
                        <DisplayValue path="requestedBy" type="user" value={row.requestedBy} />
                    </div>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orderRevisions/center/cardView/orderRevisionCard.tsx"),
    withDebug(true, true, "orderRevisions"),
)(OrderRevisionCard);
