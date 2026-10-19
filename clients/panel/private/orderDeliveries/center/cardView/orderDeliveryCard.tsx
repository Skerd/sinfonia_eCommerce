import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconMessage, IconPaperclip, IconTag} from "@tabler/icons-react";
import type {OrderDelivery} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderDelivery/orderDelivery.dto.ts";
import OrderDeliverySheetView from "@eCommerceModule/clients/panel/private/orderDeliveries/center/sheetView/orderDeliverySheetView.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";

type OrderDeliveryCardProps = WithLanguageType & {
    delivery: OrderDelivery;
};

/** One submitted delivery on the order sheet; opens the delivery sheet with its files. */
function OrderDeliveryCard({delivery, resolveLanguageKey}: OrderDeliveryCardProps) {
    return (
        <EntityCard
            resource="orderDeliveries"
            entity={delivery}
            singleUrl="/api/eCommerceMarketplace/orderDelivery/single"
            hideEdit
            hideDelete
            hideRestore
            editPath={() => ""}
            Sheet={OrderDeliverySheetView}
            sheetEntityProp="delivery"
            deleteUrl="/api/eCommerceMarketplace/orderDelivery"
            restoreUrl="/api/eCommerceMarketplace/orderDelivery/restore"
            failedTitle=""
            failedDescription=""
            titlePath="createdAt"
        >
            {({entity: row}) => (
                <>
                    <EntityCard.Header
                        titlePath="createdAt"
                        title={<DisplayValue path="createdAt" type="dateTime" value={row.createdAt} />}
                    />
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconTag}
                            label={resolveLanguageKey("status")}
                            tooltip={resolveLanguageKey("status")}
                            path="status"
                            type="enum"
                            languageKeyCategory="orderDeliveryStatus"
                            value={row.status}
                        />
                        <EntityCardRow
                            icon={IconMessage}
                            label={resolveLanguageKey("message")}
                            tooltip={resolveLanguageKey("message")}
                            path="message"
                            value={row.message}
                        />
                        <EntityCardRow
                            icon={IconPaperclip}
                            label={resolveLanguageKey("attachments")}
                            tooltip={resolveLanguageKey("attachments")}
                            path="attachments"
                            type="number"
                            value={row.attachments.length}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orderDeliveries/center/cardView/orderDeliveryCard.tsx"),
    withDebug(true, true, "orderDeliveries"),
)(OrderDeliveryCard);
