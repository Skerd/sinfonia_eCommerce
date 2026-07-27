import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createCmsBlockFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/createCmsBlock.form.validator.ts";
import type {CreateCmsBlockFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.schema-def.ts";

function parseConfigForSubmit(raw: unknown): Record<string, unknown> {
    if (raw == null || raw === "") return {};
    if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
    if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return {};
        return JSON.parse(trimmed) as Record<string, unknown>;
    }
    return {};
}

export default createGenericCreatePage<CreateCmsBlockFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/cmsBlocks/createCmsBlock.tsx",
    collectionName: "cmsBlocks",
    accessModel: "cmsBlocks",
    apiUrl: "/api/eCommerce/cmsBlock",
    schema: createCmsBlockFormSchema,
    defaultValues: {
        title: "",
        type: "hero_banner",
        config: "{\n  \n}",
        position: 0,
        visibility: {devices: ["desktop", "mobile", "tablet"], regions: []},
    } as unknown as CreateCmsBlockFormType,
    mapSubmitPayload: async (data) => ({
        ...data,
        config: parseConfigForSubmit((data as any).config),
    }),
    successPath: "/eCommerce/cmsblocks",
    submitIcon: <IconPlus />,
});
