import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {IconMessage, IconPaperclip} from "@tabler/icons-react";
import type {OrderDelivery} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderDelivery/orderDelivery.dto.ts";
import OrderDeliverySheetView from "@eCommerceModule/clients/panel/private/orderDeliveries/center/sheetView/orderDeliverySheetView.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";

type OrderDeliveryCardProps = WithLanguageType & {
    delivery: OrderDelivery;
};

/** One submitted delivery on the order sheet; opens the delivery sheet with its files. */
function OrderDeliveryCard({delivery, resolveLanguageKey}: OrderDeliveryCardProps) {
    const companyZone = useCompanyTimeZone();
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
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="createdAt"
        >
            {({entity: row}) => (
                <>
                    {/* "Delivery · 16 Nov 2026" with its status in tone; the card already sits on its order (UX-01, UX-02). */}
                    <EntityCard.Header
                        titlePath="createdAt"
                        title={[String(resolveLanguageKey("delivery")), formatDate(row.createdAt, {timeZone: companyZone, format: DATE_FORMATS.mediumDate})].filter(Boolean).join(" · ")}
                        badgesBesideTitle
                        badges={<StatusBadge tableConfigKey="orderdeliveries" field="status" value={row.status} label={String(resolveLanguageKey(`orderDeliveryStatus.${row.status}`))} />}
                    />
                    <EntityCard.Body>
                        {row.message ? (
                            <EntityCardRow
                                icon={IconMessage}
                                label={resolveLanguageKey("message")}
                                tooltip={resolveLanguageKey("message")}
                                path="message"
                                value={row.message}
                            />
                        ) : null}
                        {row.attachments?.length ? (
                            <EntityCardRow
                                icon={IconPaperclip}
                                label={resolveLanguageKey("attachments")}
                                tooltip={resolveLanguageKey("attachments")}
                                path="attachments"
                                type="number"
                                value={row.attachments.length}
                            />
                        ) : null}
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
