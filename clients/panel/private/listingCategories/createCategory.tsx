import {compose} from "redux";
import {CirclePlus} from "lucide-react";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useNavigate} from "react-router-dom";
import type {CreateListingCategoryFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingCategory/listingCategory.schema-def.ts";
import type {ListingCategory} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingCategory/listingCategory.dto.ts";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import FormViewRenderer from "@coreModule/components/viewEngine/FormViewRenderer.tsx";
import {createListingCategoryFormSchema} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/listingCategory/createListingCategory.form.validator.ts";

const LIST_PATH = "/tenancy/systemSettings/listingcategories";

type CreateListingCategoryProps = WithLanguageType & WithAxiosType<ListingCategory, CreateListingCategoryFormType> & {};

function CreateListingCategory({
    resolveLanguageKey,
    loading,
    languageCode,
    innerRef,
    onFormDataChange,
}: CreateListingCategoryProps) {
    const navigate = useNavigate();
    const {create} = useAccess("listingcategories");

    const viewConfig = useViewConfig("listingcategories", "form:create");
    const formSchema = createListingCategoryFormSchema(languageCode, resolveLanguageKey("form"));

    if (!create) {
        return <HiddenElement />;
    }
    if (!viewConfig) return null;

    function onSubmit(data: CreateListingCategoryFormType) {
        const postBody: CreateListingCategoryFormType = {
            name: data.name,
            parentListingCategory: data.parentListingCategory || undefined,
            order: data.order ?? 0,
        };
        onFormDataChange(postBody);
    }

    return (
        <FormViewRenderer<CreateListingCategoryFormType>
            config={viewConfig}
            resolveLanguageKey={resolveLanguageKey}
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
    withLanguage("src/modules/eCommerce/clients/panel/private/listingCategories/createCategory.tsx"),
    withAxios(
        {
            method: "PUT",
            url: "/api/eCommerceMarketplace/listingCategory",
            data: {},
        },
        true,
    ),
    withDebug(true, true, "listingcategories"),
)(CreateListingCategory);
