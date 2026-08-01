import {compose} from "redux";
import {Save} from "lucide-react";
import {useEffect, useState} from "react";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import type {EditCategoryFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/editCategory.form.type.ts";
import type {Category} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.dto.ts";
import type {SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import EditFormViewRenderer from "@coreModule/components/viewEngine/editFormViewRenderer.tsx";
import {editCategoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/editCategory.form.validator.ts";

type EditCategoryProps = WithLanguageType & WithAxiosType<Category, EditCategoryFormType> & {
    categoryId?: string;
    categoryName?: string;
};

function EditCategory({
    resolveLanguageKey,
    loading,
    languageCode,
    innerRef,
    onFormDataChange,
    categoryId,
    categoryName,
}: EditCategoryProps) {
    const navigate = useNavigate();
    const {write, read} = useAccess("productcategories");
    const writeFields = (write || {}) as Record<string, boolean | object | undefined>;
    const readFields = (read || {}) as Record<string, boolean | object | undefined>;

    const [forceReload, setForceReload] = useState(0);
    const [categoryData, setCategoryData] = useState<Category | null>(null);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [categoryError, setCategoryError] = useState(false);

    const viewConfig = useViewConfig("productcategories", "form:edit");
    const formSchema = editCategoryFormSchema(languageCode, resolveLanguageKey("form"), writeFields, readFields);

    useEffect(() => {
        if (!categoryId) {
            setCategoryError(true);
            setLoadingCategory(false);
            return;
        }

        const postBody: SingleForm = {_id: categoryId};

        apiClient
            .post<Category>(`/api/eCommerce/category/single`, postBody)
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

    function onSubmit(data: EditCategoryFormType) {
        // Mutable bag — InferEditForm from `as const` SchemaDef is readonly-mapped.
        const postBody: Record<string, unknown> = {
            _id: categoryId || "",
        };

        if (writeFields.name) postBody.name = data.name;
        if (writeFields.parent) {
            const pid = data.parent;
            if (pid === "") postBody.parent = null;
            else if (pid !== undefined) postBody.parent = pid;
        }
        if (writeFields.order) postBody.order = data.order;

        onFormDataChange(postBody as EditCategoryFormType);
    }

    if (!write) {
        return <HiddenElement />;
    }
    if (!viewConfig) return null;

    return (
        <EditFormViewRenderer<EditCategoryFormType>
            config={viewConfig}
            resolveLanguageKey={resolveLanguageKey}
            // Zod 4 schema vs @hookform/resolvers typed for Zod 3
            //@ts-expect-error
            formSchema={formSchema}
            initialValues={
                categoryData && {
                    _id: categoryData._id,
                    name: writeFields.name ? categoryData.name : undefined,
                    parent: writeFields.parent ? categoryData.parent?._id : undefined,
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
    withLanguage("src/modules/eCommerce/clients/panel/private/categories/editCategory.tsx"),
    withAxios(
        {
            method: "PATCH",
            url: "/api/eCommerce/category",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(EditCategory);
