import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
import TooltipDisplayer from "@coreModule/components/custom/tooltipDisplayer.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {ProductVariant} from "armonia/src/modules/eCommerce/api/eCommerce/private/productVariant/productVariant.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconBarcode, IconCurrencyDollar, IconTag} from "@tabler/icons-react";
import ProductVariantSheetView from "@eCommerceModule/clients/panel/private/productVariants/center/sheetView/productVariantSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

const LIST_BASE = "/tenancy/systemSettings/productvariants";

function productVariantEditPath(entity: ProductVariant) {
    const params = new URLSearchParams();
    params.set("productVariantId", entity._id);
    if ((entity as any).sku) params.set("productVariantTitle", encodeURIComponent(String((entity as any).sku)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type ProductVariantCardProps = WithLanguageType & {
    entity: ProductVariant;
    onDelete?: (deleted?: ProductVariant, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ProductVariantCard({
    entity: entityProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ProductVariantCardProps) {
    const {action, setAction, entity: entity, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: entityProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("productVariants");


    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && (entity as any).deletedAt != null) {
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
                        {((read as any).deletedBy || (read as any).deletedAt) && (
                            <DeletedInfo deletedAt={(entity as any).deletedAt} deletedBy={(entity as any).deletedBy} />
                        )}
                        <div className="w-full min-w-0">
                            <EntityTextCardHeader
                                title={null}
                                showTitle={true}
                                badges={undefined}
                                showBadges={false}
                                hideActions={hideActions}
                                actionMenu={
                                    undefined
                                }
                            />
                            <div className={CARD_BODY_CLASS}>
                                <Separator />
                                <div className="flex flex-col gap-y-1">
                                    <InfoRowGroup>
<InfoRow
                                        label={resolveLanguageKey("sku")}
                                        icon={IconBarcode}
                                        show={!!(read as any)?.sku}
                                        value={(entity as any).sku != null ? String((entity as any).sku) : undefined}
                                    />
                                </InfoRowGroup>
                                    <InfoRow
                                        label={resolveLanguageKey("price")}
                                        icon={IconCurrencyDollar}
                                        show={!!(read as any)?.price}
                                        value={(entity as any).price != null ? String((entity as any).price) : undefined}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("status")}
                                        icon={IconTag}
                                        show={!!(read as any)?.status}
                                        value={(entity as any).status ? resolveLanguageKey("variantStatus." + (entity as any).status) : undefined}
                                    />
                            </div>
                        </div>
                        </div>
                    </div>
                </EntityCardShell>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <ProductVariantSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={entity._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"productVariants"}
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={(read as any)?.sku && String((entity as any).sku ?? "")}
                            confirmName={(read as any)?.sku && String((entity as any).sku ?? "")}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/productVariant"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"productVariants"}
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={(read as any)?.sku && String((entity as any).sku ?? "")}
                            confirmName={(read as any)?.sku && String((entity as any).sku ?? "")}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/productVariant/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/productVariants/center/cardView/productVariantCard.tsx"),
    withDebug(true, true),
)(ProductVariantCard);
