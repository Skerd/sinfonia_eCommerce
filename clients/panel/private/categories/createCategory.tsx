import {compose} from "redux";
import {CirclePlus} from "lucide-react";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import type {CreateCategoryFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/createCategory.form.type.ts";
import type {Category} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/category.dto.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/context/accessContext.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import FormViewRenderer from "@coreModule/components/viewEngine/FormViewRenderer.tsx";
import {createCategoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/category/createCategory.form.validator.ts";

const LIST_PATH = "/tenancy/systemSettings/categories";

type CreateCategoryProps = WithLanguageType & WithAxiosType<Category, CreateCategoryFormType> & {};

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

    function onSubmit(data: CreateCategoryFormType) {
        const postBody: CreateCategoryFormType = {
            name: data.name,
            parent: data.parent || undefined,
            order: data.order,
        };
        onFormDataChange(postBody);
    }

    return (
        <FormViewRenderer<CreateCategoryFormType>
            config={viewConfig}
            resolveLanguageKey={resolveLanguageKey}
            // Zod 4 schema vs @hookform/resolvers typed for Zod 3
            formSchema={formSchema}
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
    withDebug(true, true, "productcategories"),
)(CreateCategory);
