import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editCmsBlockFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/editCmsBlock.form.validator.ts";
import type {EditCmsBlockFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.schema-def.ts";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";

export default createGenericEditPage<CmsBlock, EditCmsBlockFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/cmsBlocks/editCmsBlock.tsx",
    collectionName: "cmsBlocks",
    accessModel: "cmsBlocks",
    apiUrl: "/api/eCommerce/cmsBlock",
    schema: editCmsBlockFormSchema,
    mapEntityData: (data) => ({
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString().split("T")[0] : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString().split("T")[0] : undefined,
    }),
    submitIcon: <Save />,
});
