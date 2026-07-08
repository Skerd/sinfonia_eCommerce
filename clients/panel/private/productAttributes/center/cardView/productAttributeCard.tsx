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
import type {ProductAttribute} from "armonia/src/modules/eCommerce/api/eCommerce/private/productAttribute/productAttribute.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconHash, IconList, IconTag} from "@tabler/icons-react";
import ProductAttributeSheetView from "@eCommerceModule/clients/panel/private/productAttributes/center/sheetView/productAttributeSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

const LIST_BASE = "/eCommerce/productattributes";

function productAttributeEditPath(attribute: ProductAttribute) {
    const params = new URLSearchParams();
    params.set("attributeId", attribute._id);
    if (attribute.name) params.set("attributeName", encodeURIComponent(attribute.name));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ProductAttributeCardProps = WithLanguageType & {
    productAttribute: ProductAttribute;
    onDelete?: (deleted?: ProductAttribute, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ProductAttributeCard({
    productAttribute: productAttributeProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ProductAttributeCardProps) {
    const [action, setAction] = useState<string>("");
    const [productAttribute, setProductAttribute] = useState<ProductAttribute>(productAttributeProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(productAttribute, data);
        } else {
            setProductAttribute({...productAttribute, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setProductAttribute({
                ...productAttribute,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("productAttributes");

    useEffect(() => {
        setProductAttribute(productAttributeProp);
    }, [productAttributeProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && productAttribute.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const valuesCount = productAttribute.values?.length ?? 0;

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn("group p-0 h-full relative transition-all duration-300 hover:shadow-md hover:cursor-pointer")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={productAttribute.deletedAt} deletedBy={productAttribute.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement showLock randomLength={0}>
                                        {read?.name && (
                                            <>
                                                {productAttribute.name ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("name")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{productAttribute.name}</div>
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
                                            accessModel={"productAttributes"}
                                            deletedData={productAttribute}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={productAttributeEditPath(productAttribute)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("values")}
                                        icon={IconList}
                                        show={!!read?.values}
                                        value={String(valuesCount)}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("position")}
                                        icon={IconHash}
                                        show={!!read?.position}
                                        value={productAttribute.position != null ? String(productAttribute.position) : undefined}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {read?.isVisibleOnProductPage && productAttribute.isVisibleOnProductPage && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-700">
                                            <IconTag className="w-3 h-3" />
                                            {resolveLanguageKey("visibleOnProductPage")}
                                        </span>
                                    )}
                                    {read?.isUsedForVariants && productAttribute.isUsedForVariants && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-400/20 text-violet-700">
                                            {resolveLanguageKey("usedForVariants")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <ProductAttributeSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            productAttribute={productAttribute}
                            fetchId={productAttribute._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"productAttributes"}
                            deleteId={productAttribute._id}
                            openAlert={action === "delete"}
                            name={read?.name && productAttribute.name}
                            confirmName={read?.name && productAttribute.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/productAttribute"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"productAttributes"}
                            deleteId={productAttribute._id}
                            openAlert={action === "restore"}
                            name={read?.name && productAttribute.name}
                            confirmName={read?.name && productAttribute.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/productAttribute/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productAttributes/center/cardView/productAttributeCard.tsx"),
    withDebug(true, true),
)(ProductAttributeCard);
