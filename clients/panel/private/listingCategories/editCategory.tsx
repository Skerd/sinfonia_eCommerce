import {compose} from "redux";
import {Save} from "lucide-react";
import {useEffect, useState} from "react";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import type {EditListingCategoryFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingCategory/listingCategory.schema-def.ts";
import type {ListingCategory} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingCategory/listingCategory.dto.ts";
import type {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import EditFormViewRenderer from "@coreModule/components/viewEngine/editFormViewRenderer.tsx";
import {editListingCategoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingCategory/editListingCategory.form.validator.ts";
import type {z} from "zod";

type EditListingCategoryProps = WithLanguageType & WithAxiosType<ListingCategory, EditListingCategoryFormType> & {
    categoryId?: string;
    categoryName?: string;
};

type EditFormData = z.infer<ReturnType<typeof editListingCategoryFormSchema>>;

function EditListingCategory({
    resolveLanguageKey,
    loading,
    languageCode,
    innerRef,
    onFormDataChange,
    categoryId,
    categoryName,
}: EditListingCategoryProps) {
    const navigate = useNavigate();
    const {write, read} = useAccess("listingcategories");
    const writeFields = (write || {}) as Record<string, boolean | object | undefined>;
    const readFields = (read || {}) as Record<string, boolean | object | undefined>;

    const [forceReload, setForceReload] = useState(0);
    const [categoryData, setCategoryData] = useState<ListingCategory | null>(null);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [categoryError, setCategoryError] = useState(false);

    const viewConfig = useViewConfig("listingcategories", "form:edit");
    const formSchema = editListingCategoryFormSchema(languageCode, resolveLanguageKey("form"), writeFields, readFields);

    useEffect(() => {
        if (!categoryId) {
            setCategoryError(true);
            setLoadingCategory(false);
            return;
        }

        const postBody: SingleForm = {_id: categoryId};

        apiClient
            .post<ListingCategory>(`/api/eCommerceMarketplace/listingCategory/single`, postBody)
            .then((res) => {
                const data = res.data;
                if (!data?._id) {
                    setCategoryError(true);
                    setLoadingCategory(false);
                    return;
                }
                setCategoryData(data);
                setCategoryError(false);
                setLoadingCategory(false);
            })
            .catch(() => {
                setCategoryError(true);
                setLoadingCategory(false);
            });
    }, [categoryId, forceReload]);

    function onSubmit(data: EditFormData) {
        // Mutable bag — InferEditForm from `as const` SchemaDef is readonly-mapped.
        const postBody: Record<string, unknown> = {
            _id: categoryId || "",
        };

        if (writeFields.name) postBody.name = data.name;
        if (writeFields.parentListingCategory) {
            const pid = data.parentListingCategory;
            if (pid === "") postBody.parentListingCategory = null;
            else if (pid !== undefined) postBody.parentListingCategory = pid;
        }
        if (writeFields.order) postBody.order = data.order;

        onFormDataChange(postBody as EditListingCategoryFormType);
    }

    if (!write) {
        return <HiddenElement />;
    }
    if (!viewConfig) return null;

    return (
        <EditFormViewRenderer<EditFormData>
            config={viewConfig}
            resolveLanguageKey={resolveLanguageKey}
            formSchema={formSchema}
            initialValues={
                categoryData && {
                    _id: categoryData._id,
                    name: writeFields.name ? categoryData.name : undefined,
                    parentListingCategory: writeFields.parentListingCategory ? categoryData.parentListingCategory?._id : undefined,
                    order: writeFields.order ? categoryData.order : undefined,
                }
            }
            loading={loading}
            loadingData={loadingCategory}
            loadingDataError={categoryError || !categoryData}
            onForceReload={() => setForceReload((n) => n + 1)}
            loadingDataErrorTitle={"errorTitle"}
            loadingDataErrorDescription={"errorDescription"}
            innerRef={innerRef}
            onSubmit={onSubmit}
            onCancel={() => navigate(-1)}
            writeAccess={write}
            extraTitles={[categoryName]}
            submitIcon={<Save className="h-4 w-4" />}
            formExtras={{categoryId: categoryId ?? ""}}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listingCategories/editCategory.tsx"),
    withAxios(
        {
            method: "PATCH",
            url: "/api/eCommerceMarketplace/listingCategory",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "listingcategories"),
)(EditListingCategory);
