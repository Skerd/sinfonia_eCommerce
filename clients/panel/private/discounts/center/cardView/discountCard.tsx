import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";
import {IconCalendar, IconCashBanknote, IconPercentage, IconShoppingCart, IconTag} from "@tabler/icons-react";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";
import DiscountSheetView from "@eCommerceModule/clients/panel/private/discounts/center/sheetView/discountSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateDiscount from "@eCommerceModule/clients/panel/private/discounts/center/actions/activateDiscount.tsx";
import DeactivateDiscount from "@eCommerceModule/clients/panel/private/discounts/center/actions/deactivateDiscount.tsx";
import ActivateDiscountDialog from "@eCommerceModule/clients/panel/private/discounts/center/dialogs/activateDiscountDialog.tsx";
import DeactivateDiscountDialog from "@eCommerceModule/clients/panel/private/discounts/center/dialogs/deactivateDiscountDialog.tsx";
import {accessFieldPathExists} from "@coreModule/helpers/context/accessContext.tsx";
import EntityCardRow from "@coreModule/components/entityPage/list/card/entityCardRow.tsx";
import EntityCard from "@coreModule/components/entityPage/list/card/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/discounts";

function discountEditPath(discount: Discount) {
    const params = new URLSearchParams();
    params.set("discountId", discount._id);
    if (discount.title) params.set("discountTitle", encodeURIComponent(discount.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type DiscountCardProps = WithLanguageType & {
    discount: Discount;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Discount, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<Discount> | null>;
};

function DiscountCard({
    discount,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onActiveChanged,
    innerRef,
}: DiscountCardProps) {
    // Validity is read on the company calendar (GLB-09).
    const companyZone = useCompanyTimeZone();
    const day = (value: string) => formatDate(value, {timeZone: companyZone, format: DATE_FORMATS.mediumDate});
    return (
        <EntityCard
            resource="discounts"
            entity={discount}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/discount/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={discountEditPath}
            Sheet={DiscountSheetView}
            sheetEntityProp="discount"
            deleteUrl="/api/eCommerce/discount"
            restoreUrl="/api/eCommerce/discount/restore"
            failedTitle={resolveLanguageKey("failedTitle")}
            failedDescription={resolveLanguageKey("failedDescription")}
            titlePath="title"
            innerRef={innerRef}
            sheetProps={({entity, setEntity}) => ({
                fetchId,
                onActiveChanged: (isActive: boolean) => {
                    setEntity({...entity, isActive});
                    onActiveChanged?.(isActive);
                },
                onSheetRowPatched: (row: Partial<Discount>) => {
                    setEntity({...entity, ...row});
                    if (typeof row.isActive === "boolean") onActiveChanged?.(row.isActive);
                },
            })}
            extraDialogs={({action, setAction, entity, setEntity}) => (
                <>
                    {action === "activateDiscount" && (
                        <ActivateDiscountDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: true});
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateDiscount" && (
                        <DeactivateDiscountDialog
                            open
                            onClose={() => setAction("")}
                            entity={entity}
                            onSuccess={() => {
                                setEntity({...entity, isActive: false});
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity, read, setAction}) => {
                const canReadType = accessFieldPathExists(read, "type");
                const percentage = canReadType && entity.type === "percentage";
                const currency = accessFieldPathExists(read, "currency") ? entity.currency : undefined;
                return (
                <>
                    {/* The code is what shoppers type and staff know it by; the title is the subtitle (UX-01). */}
                    <EntityCard.Header
                        titlePath={entity.code ? "code" : "title"}
                        title={entity.code || entity.title}
                        subtitlePath="title"
                        subtitle={entity.code ? entity.title : undefined}
                        badgesBesideTitle
                        badges={entity.isActive === false ? <Badge variant="outline" className="text-xs">{String(resolveLanguageKey("inactive"))}</Badge> : null}
                    >
                        <ActivateDiscount entity={entity} onAction={setAction} />
                        <DeactivateDiscount entity={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <EntityCardRow
                            icon={IconTag}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="discountType"
                            value={entity.type}
                        />
                        {entity.startsAt ? (
                            <EntityCardRow
                                icon={IconCalendar}
                                label={resolveLanguageKey("valid")}
                                tooltip={resolveLanguageKey("valid")}
                                path="startsAt"
                                value={entity.endsAt ? `${day(entity.startsAt)} – ${day(entity.endsAt)}` : `${day(entity.startsAt)} –`}
                            />
                        ) : null}
                        {!canReadType || entity.type === "percentage" || entity.type === "fixed" ? (
                            <EntityCardRow
                                icon={percentage ? IconPercentage : IconCashBanknote}
                                label={resolveLanguageKey("value")}
                                tooltip={resolveLanguageKey("value")}
                                path="value"
                                type={percentage ? undefined : "currency"}
                                value={percentage ? `${formatNumber(entity.value)}%` : {amount: entity.value, currency}}
                            />
                        ) : null}
                        {entity.minimumOrderAmount ? (
                            <EntityCardRow
                                icon={IconShoppingCart}
                                label={resolveLanguageKey("minimumOrderAmount")}
                                tooltip={resolveLanguageKey("minimumOrderAmount")}
                                path="minimumOrderAmount"
                                type="currency"
                                value={{amount: entity.minimumOrderAmount, currency}}
                            />
                        ) : null}
                    </EntityCard.Body>
                </>
                );
            }}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/discounts/center/cardView/discountCard.tsx"),
    withDebug(true, true, "discounts"),
)(DiscountCard);
