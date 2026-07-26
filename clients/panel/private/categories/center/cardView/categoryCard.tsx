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
import type {Category} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import {IconCategory2, IconHash, IconTag} from "@tabler/icons-react";
import CategorySheetView from "@eCommerceModule/clients/panel/private/categories/center/sheetView/categorySheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";

const LIST_BASE = "/tenancy/systemSettings/categories";

function categoryEditPath(category: Category) {
    const params = new URLSearchParams();
    params.set("categoryId", category._id);
    if (category.name) params.set("categoryName", category.name);
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type CategoryCardProps = WithLanguageType & {
    category: Category;
    onDelete?: (deleted?: Category, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function CategoryCard({
    category: categoryProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: CategoryCardProps) {
    const [action, setAction] = useState<string>("");
    const [category, setCategory] = useState<Category>(categoryProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(category, data);
        } else {
            setCategory({...category, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setCategory({
                ...category,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("productcategories");

    useEffect(() => {
        setCategory(categoryProp);
    }, [categoryProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && category.deletedAt != null) {
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
                            <DeletedInfo deletedAt={category.deletedAt} deletedBy={category.deletedBy} />
                        )}
                        <div className="w-full min-w-0 py-3">
                            <div className="flex justify-between items-center ps-4 pe-2 pb-2 gap-2">
                                <div className="min-w-0 flex-1">
                                    <HiddenElement showLock randomLength={0}>
                                        {read?.name && (
                                            <>
                                                {category.name ? (
                                                    <TooltipDisplayer tooltip={resolveLanguageKey("name")}>
                                                        <div className="font-semibold text-base leading-tight">{category.name}</div>
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
                                            accessModel={"productcategories"}
                                            deletedData={category}
                                            onAction={(a: string) => setAction(a)}
                                            editPath={categoryEditPath(category)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm px-4 pt-0">
                                <div className="flex flex-col space-y-1">
                                    <InfoRow
                                        label={resolveLanguageKey("slug")}
                                        icon={IconTag}
                                        show={!!read?.slug}
                                        value={category.slug}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("parentCategory")}
                                        icon={IconCategory2}
                                        show={!!read?.parent}
                                        value={category.parent?.name}
                                    />
                                    <InfoRow
                                        label={resolveLanguageKey("order")}
                                        icon={IconHash}
                                        show={!!read?.order}
                                        value={category.order != null ? String(category.order) : undefined}
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
                        <CategorySheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            category={category}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"productcategories"}
                            deleteId={category._id}
                            openAlert={action === "delete"}
                            name={read?.name && category.name}
                            confirmName={read?.name && category.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/category"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"productcategories"}
                            deleteId={category._id}
                            openAlert={action === "restore"}
                            name={read?.name && category.name}
                            confirmName={read?.name && category.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerce/category/restore"
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/categories/center/cardView/categoryCard.tsx"),
    withDebug(true, true),
)(CategoryCard);
