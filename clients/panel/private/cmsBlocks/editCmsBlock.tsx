import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {editCmsBlockFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/editCmsBlock.form.validator.ts";
import type {EditCmsBlockFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.schema-def.ts";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";

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

export default createGenericEditPage<CmsBlock, EditCmsBlockFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/cmsBlocks/editCmsBlock.tsx",
    collectionName: "cmsBlocks",
    accessModel: "cmsBlocks",
    apiUrl: "/api/eCommerce/cmsBlock",
    schema: editCmsBlockFormSchema,
    mapEntityData: (data) => ({
        ...data,
        config:
            data.configText ??
            (data.config != null ? JSON.stringify(data.config, null, 2) : "{\n  \n}"),
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString().slice(0, 16).replace("T", " ") : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString().slice(0, 16).replace("T", " ") : undefined,
    }),
    mapSubmitPayload: async (data) => ({
        ...data,
        config: parseConfigForSubmit((data as any).config),
    }),
    submitIcon: <Save />,
});
