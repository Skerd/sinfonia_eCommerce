import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/inputs/objectIdChipsInput.tsx";
import {editCmsBlockFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/editCmsBlock.form.validator.ts";
import type {EditCmsBlockFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.schema-def.ts";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";
import type {CategorySimple} from "armonia/src/modules/eCommerce/dto/category.dto.ts";

const cmsBlockChipLabelState = {
    loadedId: null as string | null,
    categoryIds: {current: {} as Record<string, string>},
};

function fillCategoryLabelMap(map: Record<string, string>, categories: CategorySimple[] | undefined) {
    for (const category of categories ?? []) {
        if (category._id && category.name) map[category._id] = category.name;
    }
}

export default createGenericEditPage<CmsBlock, EditCmsBlockFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/cmsBlocks/editCmsBlock.tsx",
    collectionName: "cmsBlocks",
    accessModel: "cmsBlocks",
    apiUrl: "/api/eCommerce/cmsBlock",
    schema: editCmsBlockFormSchema,
    mapEntityData: (data) => ({
        ...data,
        config: {
            ...data.config,
            collectionId: data.config?.collectionId?._id,
            categoryIds: data.config?.categoryIds?.map((category) => category._id),
        },
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString().slice(0, 16).replace("T", " ") : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString().slice(0, 16).replace("T", " ") : undefined,
    }),
    buildFormExtras: (_entityId, _params, entity) => {
        if (entity) {
            if (cmsBlockChipLabelState.loadedId !== entity._id) {
                cmsBlockChipLabelState.loadedId = entity._id;
                cmsBlockChipLabelState.categoryIds.current = {};
            }
            fillCategoryLabelMap(cmsBlockChipLabelState.categoryIds.current, entity.config?.categoryIds);
        }

        const categoryOptions =
            entity?.config?.categoryIds
                ?.filter((category) => !!category._id && !!category.name)
                .map((category) => ({value: category._id, label: category.name})) ?? [];

        return {
            "config.categoryIds": categoryOptions,
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {
                "config.categoryIds": cmsBlockChipLabelState.categoryIds,
            },
        };
    },
    submitIcon: <Save />,
});
