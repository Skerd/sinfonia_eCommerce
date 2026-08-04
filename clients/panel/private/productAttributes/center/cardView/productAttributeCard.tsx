import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
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
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

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
    const {action, setAction, entity: productAttribute, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: productAttributeProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("productAttributes");


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
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="flex w-full items-stretch">
                        {(read.deletedBy || read.deletedAt) && (
                            <DeletedInfo deletedAt={productAttribute.deletedAt} deletedBy={productAttribute.deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={productAttribute.name ?? <ValueNotSet />}
                                showTitle={!!read?.name}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    undefined
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <InfoRowGroup>
<InfoRow
                                        label={resolveLanguageKey("position")}
                                        icon={IconHash}
                                        show={!!read?.position}
                                        value={productAttribute.position != null ? String(productAttribute.position) : undefined}
                                    />
                                </InfoRowGroup>
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
                                {!!read?.values ? (
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
                                ) : (
                                    <div className="pt-0.5">
                                        <div className="flex items-center gap-1 text-muted-foreground mb-1.5">
                                            <IconList size={18} className="hidden md:block shrink-0" />
                                            <p className="text-sm font-medium">{resolveLanguageKey("values")}</p>
                                        </div>
                                        <HiddenElement showLock randomLength={8} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </EntityCardShell>
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
