import {compose} from "redux";
import {CirclePlus} from "lucide-react";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import type {CreateCategoryFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/createCategory.form.type.ts";
import type {Category} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.dto.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import FormViewRenderer from "@coreModule/components/viewEngine/FormViewRenderer.tsx";
import {createCategoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/createCategory.form.validator.ts";
import type {z} from "zod";

const LIST_PATH = "/tenancy/systemSettings/categories";

type CreateCategoryProps = WithLanguageType & WithAxiosType<Category, CreateCategoryFormType> & {};

type CreateCategoryFormData = z.infer<ReturnType<typeof createCategoryFormSchema>>;

function CreateCategory({
    resolveLanguageKey,
    loading,
    languageCode,
    innerRef,
    onFormDataChange,
}: CreateCategoryProps) {
    const navigate = useNavigate();
    const {create} = useAccess("productcategories");

    const viewConfig = useViewConfig("productcategories", "form:create");
    const formSchema = createCategoryFormSchema(languageCode, resolveLanguageKey("form"));

    if (!create) {
        return <HiddenElement />;
    }
    if (!viewConfig) return null;

    function onSubmit(data: CreateCategoryFormData) {
        const postBody: CreateCategoryFormType = {
            name: data.name,
            slug: data.slug?.trim() || undefined,
            parentId: data.parentId || undefined,
            order: data.order ?? 0,
        };
        onFormDataChange(postBody);
    }

    return (
        <FormViewRenderer<CreateCategoryFormData>
            config={viewConfig}
            resolveLanguageKey={resolveLanguageKey}
            formSchema={formSchema}
            //@ts-expect-error
            defaultValues={{}}
            loading={loading}
            innerRef={innerRef}
            onSubmit={onSubmit}
            onCancel={() => navigate(LIST_PATH)}
            onSuccess={() => navigate(LIST_PATH)}
            submitIcon={<CirclePlus className="h-4 w-4" />}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/categories/createCategory.tsx"),
    withAxios(
        {
            method: "PUT",
            url: "/api/eCommerce/category",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(CreateCategory);
