import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {Category} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.dto.ts";
import {IconCategory2, IconHash, IconTag} from "@tabler/icons-react";
import CategorySheetView from "@eCommerceModule/clients/panel/private/categories/center/sheetView/categorySheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/tenancy/systemSettings/categories";

function categoryEditPath(category: Category) {
    const params = new URLSearchParams();
    params.set("categoryId", category._id);
    if (category.name) params.set("categoryName", category.name);
    return `${LIST_BASE}/edit?${params.toString()}`;
}

type CategoryCardProps = WithLanguageType & {
    category: Category;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: Category, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    innerRef?: RefObject<WithAxiosLifecycleRef<Category> | null>;
};

function CategoryCard({
    category,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    innerRef,
}: CategoryCardProps) {
    return (
        <EntityCard
            resource="productcategories"
            entity={category}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/category/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={categoryEditPath}
            Sheet={CategorySheetView}
            sheetEntityProp="category"
            deleteUrl="/api/eCommerce/category"
            restoreUrl="/api/eCommerce/category/restore"
            failedTitle=""
            failedDescription=""
            titlePath="name"
            innerRef={innerRef}
            sheetProps={() => ({fetchId})}
        >
            {({entity}) => (
                <>
                    <EntityCard.Header titlePath="name" title={entity.name} />
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconTag}
                            label={resolveLanguageKey("slug")}
                            tooltip={resolveLanguageKey("slug")}
                            path="slug"
                            value={entity.slug}
                        />
                        <DisplayRow
                            icon={IconCategory2}
                            label={resolveLanguageKey("parentCategory")}
                            tooltip={resolveLanguageKey("parentCategory")}
                            path="parent.name"
                            value={entity.parent?.name}
                        />
                        <DisplayRow
                            icon={IconHash}
                            label={resolveLanguageKey("order")}
                            tooltip={resolveLanguageKey("order")}
                            path="order"
                            type="number"
                            value={entity.order}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/categories/center/cardView/categoryCard.tsx"),
    withDebug(true, true, "productcategories"),
)(CategoryCard);
