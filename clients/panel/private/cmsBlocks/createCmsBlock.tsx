import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createCmsBlockFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/createCmsBlock.form.validator.ts";
import type {CreateCmsBlockFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.schema-def.ts";

export default createGenericCreatePage<CreateCmsBlockFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/cmsBlocks/createCmsBlock.tsx",
    collectionName: "cmsBlocks",
    accessModel: "cmsBlocks",
    apiUrl: "/api/eCommerce/cmsBlock",
    schema: createCmsBlockFormSchema,
    defaultValues: {
        title: "",
        type: "hero_banner",
        config: {},
        isActive: true,
        position: 0,
    } as unknown as CreateCmsBlockFormType,
    successPath: "/eCommerce/cmsblocks",
    submitIcon: <IconPlus />,
});
