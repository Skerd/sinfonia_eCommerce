import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconHash, IconPercentage, IconTag} from "@tabler/icons-react";
import DiscountSheetView from "@eCommerceModule/clients/panel/private/discounts/center/sheetView/discountSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ActivateDiscount from "@eCommerceModule/clients/panel/private/discounts/center/actions/activateDiscount.tsx";
import DeactivateDiscount from "@eCommerceModule/clients/panel/private/discounts/center/actions/deactivateDiscount.tsx";
import ActivateDiscountDialog from "@eCommerceModule/clients/panel/private/discounts/center/dialogs/activateDiscountDialog.tsx";
import DeactivateDiscountDialog from "@eCommerceModule/clients/panel/private/discounts/center/dialogs/deactivateDiscountDialog.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/tenancy/systemSettings/discounts";

function discountEditPath(discount: Discount) {
    const params = new URLSearchParams();
    params.set("discountId", discount._id);
    if (discount.title) params.set("discountTitle", encodeURIComponent(discount.title));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type DiscountCardProps = WithLanguageType & {
    discount: Discount;
    onDelete?: (deleted?: Discount, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    onActiveChanged?: (isActive: boolean) => void;
};

function DiscountCard({
    discount: discountProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onActiveChanged,
}: DiscountCardProps) {
    const {action, setAction, entity: discount, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: discountProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("discounts");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && discount.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={discount.deletedAt} deletedBy={discount.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={discount.title ?? <ValueNotSet />}
                                showTitle={!!read?.title}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    <ActionMenu
                                            accessModel={"discounts"}
                                            deletedData={discount}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={discountEditPath(discount)}
                                            allowMenuForCustomChildren
                                        >
                                            <ActivateDiscount entity={discount} onAction={(a: string) => setAction(a)} />
                                            <DeactivateDiscount entity={discount} onAction={(a: string) => setAction(a)} />
                                        </ActionMenu>
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("code")}
                                        icon={IconTag}
                                        show={!!read?.code}
                                        value={discount.code}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("type")}
                                        icon={IconPercentage}
                                        show={!!(read as any)?.type}
                                        value={discount.type ? resolveLanguageKey("discountType." + discount.type) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("value")}
                                        icon={IconHash}
                                        show={!!read?.value}
                                        value={discount.value != null ? String(discount.value) : undefined}
                                    />
                                </InfoRowGroup>
                                {read?.isActive && discount.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-3xs font-semibold uppercase tracking-wide",
                                            discount.isActive ? "text-success" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                discount.isActive ? "bg-success" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(discount.isActive ? "active" : "inactive")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <DiscountSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            discount={discount}
                            fetchId={discount._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onActiveChanged={(isActive: boolean) => {
                                setEntity((prev) => ({...prev, isActive}));
                                onActiveChanged?.(isActive);
                            }}
                            onSheetRowPatched={(row: Partial<Discount>) => setEntity(row as Discount)}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"discounts"}
                            deleteId={discount._id}
                            openAlert={action === "delete"}
                            name={read?.title && discount.title}
                            confirmName={read?.title && discount.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/discount"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"discounts"}
                            deleteId={discount._id}
                            openAlert={action === "restore"}
                            name={read?.title && discount.title}
                            confirmName={read?.title && discount.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/discount/restore"
                        />
                    )}
                    {action === "activateDiscount" && (
                        <ActivateDiscountDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={discount}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: true}));
                                onActiveChanged?.(true);
                            }}
                        />
                    )}
                    {action === "deactivateDiscount" && (
                        <DeactivateDiscountDialog
                            open={true}
                            onClose={() => setAction("")}
                            entity={discount}
                            onSuccess={() => {
                                setEntity((prev) => ({...prev, isActive: false}));
                                onActiveChanged?.(false);
                            }}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/discounts/center/cardView/discountCard.tsx"),
    withDebug(true, true),
)(DiscountCard);
