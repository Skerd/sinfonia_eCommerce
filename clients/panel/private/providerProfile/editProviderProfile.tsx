import { Save } from "lucide-react";
import { createGenericEditPage } from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import { editProviderProfileFormSchema } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/editProviderProfile.form.validator.ts";
import type { ProviderProfile } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import type { EditProviderProfileFormType } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.schema-def.ts";

export default createGenericEditPage<ProviderProfile, EditProviderProfileFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/providerProfile/editProviderProfile.tsx",
    collectionName: "providerprofiles",
    accessModel: "providerProfiles",
    apiUrl: "/api/eCommerceMarketplace/providerProfile",
    schema: editProviderProfileFormSchema,
    buildInitialValues: (data, writeFields): Partial<EditProviderProfileFormType> => ({
        _id: data._id,
        skills: writeFields.skills ? (data.skills ?? []) : undefined,
        bio: writeFields.bio ? (data.bio ?? "") : undefined,
        portfolio: writeFields.portfolio ? (data.portfolio?.map((m) => m._id) ?? []) : undefined,
        // Keep dayOfWeek as string so #SimpleSelect option values ("0"…"6") match on edit.
        // Cast: InferEditForm embeds `_id` on array items; runtime slots have no item `_id`.
        availability: writeFields.availability
            ? ((data.availability ?? []).map((slot) => ({
                  dayOfWeek: String(slot.dayOfWeek) as unknown as number,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
              })) as EditProviderProfileFormType["availability"])
            : undefined,
    }),
    submitIcon: <Save />,
});
