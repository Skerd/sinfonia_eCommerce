import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Category} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import CategoryCard from "@eCommerceModule/clients/panel/private/categories/center/cardView/categoryCard.tsx";
import CategorySheetView from "@eCommerceModule/clients/panel/private/categories/center/sheetView/categorySheetView.tsx";

const LIST_BASE = "/tenancy/systemSettings/categories";

function categoryEditPath(category: Category) {
    const params = new URLSearchParams();
    params.set("categoryId", category._id);
    if (category.name) params.set("categoryName", category.name);
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function AllCategories({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Category>
            apiUrl="/api/eCommerce/category"
            collectionName="productcategories"
            accessModel="productcategories"
            tableConfigKey="productcategories"
            createPath={`${LIST_BASE}/create`}
            createIcon={<IconPlus />}
            createLanguageKey="createCategory"
            buildEditPath={categoryEditPath}
            resolveLanguageKey={resolveLanguageKey}
            configurations={{limit: 20}}
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(category, onDelete, onRestore) => (
                <CategoryCard
                    category={category}
                    onDelete={(row: Category | undefined, response?: DeletedData) => onDelete(row, response)}
                    onRestore={() => onRestore(category)}
                />
            )}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore}) => (
                <CategorySheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) onOpenChange();
                    }}
                    category={entity}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/categories/index.tsx"),
    withDebug(true, true, "productcategories"),
)(AllCategories);
