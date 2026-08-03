import {compose} from "redux";
import {useRef, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Plus} from "lucide-react";
import {Button, ButtonTitle} from "@coreModule/components/ui/button.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useNavigate} from "react-router-dom";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import CategoryCard from "@eCommerceModule/clients/panel/private/categories/center/cardView/categoryCard.tsx";
import type {Category} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.dto.ts";
import type {DeletedData, TableForm, TableResponse} from "armonia/src/modules/core/types/shared.types.ts";
import CardAndTableView, {type EntityListApi} from "@coreModule/components/custom/cardAndTableView.tsx";
import CategorySheetView from "@eCommerceModule/clients/panel/private/categories/center/sheetView/categorySheetView.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";

const LIST_BASE = "/tenancy/systemSettings/categories";

function categoryEditPath(category: Category) {
    const params = new URLSearchParams();
    params.set("categoryId", category._id);
    if (category.name) params.set("categoryName", category.name);
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type AllCategoriesProps = WithLanguageType & {};

function AllCategories({resolveLanguageKey}: AllCategoriesProps) {
    const navigate = useNavigate();
    const {create, read} = useAccess("productcategories");
    const [sheetCategory, setSheetCategory] = useState<Category | null>(null);
    const [action, setAction] = useState<string>("");

    const listRef = useRef<EntityListApi<Category> | null>(null);

    const handleDelete = (category: Category, response?: DeletedData) => {
        if (response?.deletedAt != null || response?.deletedBy != null) {
            listRef.current?.updateRow?.(category._id, {
                deletedAt: response.deletedAt,
                deletedBy: response.deletedBy,
            });
            if (sheetCategory) {
                setSheetCategory({
                    ...sheetCategory,
                    deletedAt: response.deletedAt,
                    deletedBy: response.deletedBy,
                });
            }
            return;
        }
        listRef.current?.refetch?.();
    };

    const handleRestore = (category: Category) => {
        listRef.current?.updateRow?.(category._id, {
            deletedAt: undefined,
            deletedBy: undefined,
        });
        if (sheetCategory) {
            setSheetCategory({
                ...sheetCategory,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    return (
        <div className="flex-full gap-4">
            <Header title={resolveLanguageKey("title")} description={resolveLanguageKey("description")}>
                <div className="flex gap-2">
                    <HiddenElement hideAll={true}>
                        {create && (
                            <Button
                                type="button"
                                onClick={(e) => {
                                    navigate(`${LIST_BASE}/create`);
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                <ButtonTitle hideMobile={true}>{resolveLanguageKey("createCategory")}</ButtonTitle>
                            </Button>
                        )}
                    </HiddenElement>
                </div>
            </Header>

            <HiddenElement hideAll={true}>
                {read && (
                    <CardAndTableView<TableResponse<Category>, TableForm>
                        url="/api/eCommerce/category"
                        listRef={listRef}
                        tableConfigKey="productcategories"
                        access={"productcategories"}
                        tableConfigOptions={{
                            filterConfig: {
                                placeholder: resolveLanguageKey("searchPlaceholder"),
                                fields: resolveLanguageKey("fields"),
                            },
                        }}
                        configurations={{limit: 20}}
                        containersClassName={{
                            cardViewClassName: "grid grid-cols-1 gap-2 lg:gap-4 md:grid-cols-3 lg:grid-cols-4",
                            scrollRootClassName: "flex-full",
                        }}
                        renderFunctions={{
                            cardRender: (category) => (
                                <CategoryCard
                                    category={category}
                                    onDelete={(c: Category | undefined, response?: DeletedData) =>
                                        handleDelete(c ?? category, response)
                                    }
                                    onRestore={() => handleRestore(category)}
                                />
                            ),
                            action: (category) => (
                                <ActionMenu
                                    accessModel={"productcategories"}
                                    deletedData={category}
                                    onAction={(a: string) => {
                                        setAction(a);
                                        setSheetCategory(category);
                                    }}
                                    editPath={categoryEditPath(category)}
                                />
                            ),
                        }}
                    />
                )}
            </HiddenElement>

            {!!action && !!sheetCategory && (
                <>
                    {action === "view" && (
                        <CategorySheetView
                            open={action === "view"}
                            onOpenChange={() => {
                                setAction("");
                                setSheetCategory(null);
                            }}
                            category={sheetCategory}
                            onDelete={(data?: DeletedData) => handleDelete(sheetCategory, data)}
                            onRestore={() => handleRestore(sheetCategory)}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"productcategories"}
                            deleteId={sheetCategory._id}
                            openAlert={action === "delete"}
                            name={read?.name && sheetCategory.name}
                            confirmName={read?.name && sheetCategory.name}
                            onSuccess={(data: DeletedData) => handleDelete(sheetCategory, data)}
                            onCancel={() => {
                                setAction("");
                                setSheetCategory(null);
                            }}
                            url="/api/eCommerce/category"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"productcategories"}
                            deleteId={sheetCategory._id}
                            openAlert={action === "restore"}
                            name={read?.name && sheetCategory.name}
                            confirmName={read?.name && sheetCategory.name}
                            onSuccess={() => handleRestore(sheetCategory)}
                            onCancel={() => {
                                setAction("");
                                setSheetCategory(null);
                            }}
                            url="/api/eCommerce/category/restore"
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/categories/index.tsx"),
    withDebug(true, false, "productcategories"),
)(AllCategories);
