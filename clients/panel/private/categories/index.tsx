import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage, {EntityListCreateButton, EntityListHeader} from "@coreModule/components/entityPage/pages/entityListPage.tsx";
import {useCallback} from "react";
import {useSearchParams} from "react-router-dom";
import {IconHierarchy2, IconList, IconPlus} from "@tabler/icons-react";
import {ToggleGroup, ToggleGroupItem} from "@coreModule/components/ui/toggle-group.tsx";
import CategoryHierarchy from "@eCommerceModule/clients/panel/private/categories/center/hierarchy/categoryHierarchy.tsx";
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

type CategoriesView = "list" | "hierarchy";

/** Switches the page between the categories' list and their tree (D195). */
function CategoriesViewSwitch({view, onChange, resolveLanguageKey}: {view: CategoriesView; onChange: (next: string) => void} & Pick<WithLanguageType, "resolveLanguageKey">) {
    return (
        <ToggleGroup type="single" spacing={0} variant="outline" size="sm" value={view} onValueChange={onChange} aria-label={resolveLanguageKey("views.label")}>
            <ToggleGroupItem value="list" className="gap-1.5 px-2.5">
                <IconList aria-hidden />
                {resolveLanguageKey("views.list")}
            </ToggleGroupItem>
            <ToggleGroupItem value="hierarchy" className="gap-1.5 px-2.5">
                <IconHierarchy2 aria-hidden />
                {resolveLanguageKey("views.hierarchy")}
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

function AllCategories({resolveLanguageKey}: WithLanguageType) {
    const [searchParams, setSearchParams] = useSearchParams();
    const view: CategoriesView = searchParams.get("view") === "hierarchy" ? "hierarchy" : "list";
    const setView = useCallback((next: string) => {
        // Radix clears the value when the active item is pressed again; the page always shows one view.
        if (next !== "list" && next !== "hierarchy") return;
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (next === "hierarchy") params.set("view", "hierarchy");
            else params.delete("view");
            return params;
        }, {replace: true});
    }, [setSearchParams]);
    const viewSwitch = <CategoriesViewSwitch view={view} onChange={setView} resolveLanguageKey={resolveLanguageKey} />;

    if (view === "hierarchy") {
        return (
            <div className="min-w-0 flex-full gap-4">
                <EntityListHeader ctx={{resolveLanguageKey, canCreate: false, canRequest: false}}>{viewSwitch}</EntityListHeader>
                <CategoryHierarchy />
            </div>
        );
    }

    return (
        <EntityListPage<Category>
            apiUrl="/api/eCommerce/category"
            collectionName="productcategories"
            accessModel="productcategories"
            tableConfigKey="productcategories"
            header={(ctx) => (
                <EntityListHeader ctx={ctx}>
                    {viewSwitch}
                    <EntityListCreateButton
                        ctx={ctx}
                        path={`${LIST_BASE}/create`}
                        icon={<IconPlus />}
                        labelKey="createCategory"
                    />
                </EntityListHeader>
            )}
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
