import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {OrderMilestone} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderMilestone/orderMilestone.dto.ts";
import OrderMilestoneSheetView from "@eCommerceModule/clients/panel/private/orderMilestones/center/sheetView/orderMilestoneSheetView.tsx";
import {IconCurrencyDollar, IconTag} from "@tabler/icons-react";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";

type OrderMilestoneCardProps = WithLanguageType & {
    milestone: OrderMilestone;
};

/** One milestone of the order's escrow on the order sheet. */
function OrderMilestoneCard({milestone, resolveLanguageKey}: OrderMilestoneCardProps) {
    return (
        <EntityCard
            resource="orderMilestones"
            entity={milestone}
            singleUrl="/api/eCommerceMarketplace/orderMilestone/single"
            hideEdit
            hideDelete
            hideRestore
            editPath={() => ""}
            Sheet={OrderMilestoneSheetView}
            sheetEntityProp="milestone"
            deleteUrl="/api/eCommerceMarketplace/orderMilestone"
            restoreUrl="/api/eCommerceMarketplace/orderMilestone/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header titlePath="name" title={row.name} />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconTag}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="orderMilestoneStatus"
                            value={row.status}
                        />
                        <EntityCardRow
                            icon={IconCurrencyDollar}
                            label={resolveLanguageKey("amount")}
                            tooltip={resolveLanguageKey("amount")}
                            path="amount"
                            type="currency"
                            value={{amount: row.amount, currency: row.currency}}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orderMilestones/center/cardView/orderMilestoneCard.tsx"),
    withDebug(true, true, "orderMilestones"),
)(OrderMilestoneCard);
