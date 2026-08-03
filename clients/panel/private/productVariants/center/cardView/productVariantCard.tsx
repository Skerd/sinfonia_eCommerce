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
import type {ProductVariant} from "armonia/src/modules/eCommerce/api/eCommerce/private/productVariant/productVariant.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconBarcode, IconCurrencyDollar, IconTag} from "@tabler/icons-react";
import ProductVariantSheetView from "@eCommerceModule/clients/panel/private/productVariants/center/sheetView/productVariantSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

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
    const [action, setAction] = useState<string>("");
    const [entity, setEntity] = useState<ProductVariant>(entityProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(entity, data);
        } else {
            setEntity({...entity, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setEntity({
                ...entity,
                deletedAt: undefined,
                deletedBy: undefined,
            } as ProductVariant);
        }
    };

    const {read, restore} = useAccess("productVariants");

    useEffect(() => {
        setEntity(entityProp);
    }, [entityProp]);

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
                <Card
                    className={cn("group p-0 h-full relative transition-[box-shadow,--tw-ring-color] duration-200 hover:cursor-pointer hover:shadow-md hover:ring-primary/40")}
                    onClick={() => setAction("view")}
                >
                    <div className="flex w-full items-stretch">
                        {((read as any).deletedBy || (read as any).deletedAt) && (
                            <DeletedInfo deletedAt={(entity as any).deletedAt} deletedBy={(entity as any).deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement randomLength={10}>
                                        {(read as any)?.sku && (
                                            <>
                                                {(entity as any).sku ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("sku")}>
                                                        <div className="font-semibold text-base leading-tight truncate">{String((entity as any).sku)}</div>
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
                                            accessModel={"productVariants"}
                                            deletedData={entity}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={productVariantEditPath(entity)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("sku")}
                                        icon={IconBarcode}
                                        show={!!(read as any)?.sku}
                                        value={(entity as any).sku != null ? String((entity as any).sku) : undefined}
                                    />
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
                </Card>
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
