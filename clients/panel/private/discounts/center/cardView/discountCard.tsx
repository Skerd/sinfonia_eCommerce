import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
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

const LIST_BASE = "/eCommerce/discounts";

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
};

function DiscountCard({
    discount: discountProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: DiscountCardProps) {
    const [action, setAction] = useState<string>("");
    const [discount, setDiscount] = useState<Discount>(discountProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(discount, data);
        } else {
            setDiscount({...discount, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setDiscount({
                ...discount,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("discounts");

    useEffect(() => {
        setDiscount(discountProp);
    }, [discountProp]);

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
                <Card
                    className={cn("group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={discount.deletedAt} deletedBy={discount.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement showLock randomLength={0}>
                                        {read?.title && (
                                            <>
                                                {discount.title ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("title")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{discount.title}</div>
                                                    </TooltipDisplayer>
                                                ) : (
                                                    <ValueNotSet />
                                                )}
                                            </>
                                        )}
                                    </HiddenElement>
                                </div>
                                {!hideActions && (
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            accessModel={"discounts"}
                                            deletedData={discount}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={discountEditPath(discount)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
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
                                </div>
                                {read?.isActive && discount.isActive != null && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
                                            discount.isActive ? "text-emerald-600" : "text-muted-foreground",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                discount.isActive ? "bg-emerald-500" : "bg-muted-foreground/40",
                                            )}
                                        />
                                        {resolveLanguageKey(discount.isActive ? "active" : "inactive")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
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
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/discounts/center/cardView/discountCard.tsx"),
    withDebug(true, true),
)(DiscountCard);
