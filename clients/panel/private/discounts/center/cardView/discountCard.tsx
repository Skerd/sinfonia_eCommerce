import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";
import {IconHash, IconPercentage, IconPower, IconTag} from "@tabler/icons-react";
import DiscountSheetView from "@eCommerceModule/clients/panel/private/discounts/center/sheetView/discountSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActivateDiscount from "@eCommerceModule/clients/panel/private/discounts/center/actions/activateDiscount.tsx";
import DeactivateDiscount from "@eCommerceModule/clients/panel/private/discounts/center/actions/deactivateDiscount.tsx";
import ActivateDiscountDialog from "@eCommerceModule/clients/panel/private/discounts/center/dialogs/activateDiscountDialog.tsx";
import DeactivateDiscountDialog from "@eCommerceModule/clients/panel/private/discounts/center/dialogs/deactivateDiscountDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
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
            failedTitle=""
            failedDescription=""
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
            {({entity, setAction}) => (
                <>
                    <EntityCard.Header titlePath="title" title={entity.title}>
                        <ActivateDiscount entity={entity} onAction={setAction} />
                        <DeactivateDiscount entity={entity} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconTag}
                            label={resolveLanguageKey("code")}
                            tooltip={resolveLanguageKey("code")}
                            path="code"
                            value={entity.code}
                        />
                        <DisplayRow
                            icon={IconPercentage}
                            label={resolveLanguageKey("type")}
                            tooltip={resolveLanguageKey("type")}
                            path="type"
                            type="enum"
                            languageKeyCategory="discountType"
                            value={entity.type}
                        />
                        <DisplayRow
                            icon={IconHash}
                            label={resolveLanguageKey("value")}
                            tooltip={resolveLanguageKey("value")}
                            path="value"
                            type="number"
                            value={entity.value}
                        />
                        <DisplayRow
                            icon={IconPower}
                            label={resolveLanguageKey("active")}
                            tooltip={resolveLanguageKey("active")}
                            path="isActive"
                            type="boolean"
                            value={entity.isActive}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/discounts/center/cardView/discountCard.tsx"),
    withDebug(true, true),
)(DiscountCard);
