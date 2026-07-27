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
import {IconEye, IconHash, IconList, IconStack} from "@tabler/icons-react";
import ProductAttributeSheetView from "@eCommerceModule/clients/panel/private/productAttributes/center/sheetView/productAttributeSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";

const LIST_BASE = "/tenancy/systemSettings/productattributes";

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

    const values = productAttribute.values ?? [];
    const previewValues = values.slice(0, 4);
    const remainingValues = values.length - previewValues.length;

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
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("position")}
                                        icon={IconHash}
                                        show={!!read?.position}
                                        value={productAttribute.position != null ? String(productAttribute.position) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("visible")}
                                        icon={IconEye}
                                        show={!!read?.isVisibleOnProductPage}
                                        value={resolveLanguageKey(productAttribute.isVisibleOnProductPage ? "yes" : "no")}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("variants")}
                                        icon={IconStack}
                                        show={!!read?.isUsedForVariants}
                                        value={resolveLanguageKey(productAttribute.isUsedForVariants ? "yes" : "no")}
                                    />
                                </div>
                                {!!read?.values && (
                                    <div className="pt-0.5">
                                        <div className="flex items-center gap-1 text-muted-foreground mb-1.5">
                                            <IconList size={18} className="hidden md:block shrink-0" />
                                            <p className="text-sm font-medium">{resolveLanguageKey("values")}</p>
                                        </div>
                                        {previewValues.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {previewValues.map((value, index) => (
                                                    <Badge key={`${value}-${index}`} variant="outline" className="font-normal">
                                                        {value}
                                                    </Badge>
                                                ))}
                                                {remainingValues > 0 && (
                                                    <Badge variant="secondary" className="font-normal tabular-nums">
                                                        +{remainingValues}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <ValueNotSet />
                                        )}
                                    </div>
                                )}
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
