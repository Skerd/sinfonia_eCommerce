import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {OrderMilestone} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderMilestone/orderMilestone.dto.ts";
import OrderMilestoneSheetView from "@eCommerceModule/clients/panel/private/orderMilestones/center/sheetView/orderMilestoneSheetView.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";

type OrderMilestoneCardProps = WithLanguageType & {
    milestone: OrderMilestone;
};

/** One milestone of the order's escrow on the order sheet. */
function OrderMilestoneCard({milestone}: OrderMilestoneCardProps) {
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
                    <EntityCard.Header
                        titlePath="name"
                        title={row.name}
                        badges={<DisplayValue path="status" type="enum" languageKeyCategory="orderMilestoneStatus" value={row.status} />}
                    />
                    <span className="text-base font-bold leading-none text-foreground">
                        <DisplayValue path="amount" type="currency" value={{amount: row.amount, currency: row.currency}} />
                    </span>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orderMilestones/center/cardView/orderMilestoneCard.tsx"),
    withDebug(true, true, "orderMilestones"),
)(OrderMilestoneCard);
