import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconPaperclip} from "@tabler/icons-react";
import type {OrderDelivery} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderDelivery/orderDelivery.dto.ts";
import OrderDeliverySheetView from "@eCommerceModule/clients/panel/private/orderDeliveries/center/sheetView/orderDeliverySheetView.tsx";
import DisplayValue from "@coreModule/components/viewEngine/widgets/display/displayValue.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";

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
                        badges={<DisplayValue path="status" type="enum" languageKeyCategory="orderDeliveryStatus" value={row.status} />}
                    />
                    <div className="flex flex-col gap-2">
                        {row.message ? (
                            <DisplayValue path="message" value={row.message}>
                                {(text) => <p className="line-clamp-3 text-xs leading-normal text-muted-foreground">{text}</p>}
                            </DisplayValue>
                        ) : null}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconPaperclip className="h-3 w-3 shrink-0" />
                            {row.attachments.length} {resolveLanguageKey("attachments")}
                        </span>
                    </div>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/orderDeliveries/center/cardView/orderDeliveryCard.tsx"),
    withDebug(true, true, "orderDeliveries"),
)(OrderDeliveryCard);
