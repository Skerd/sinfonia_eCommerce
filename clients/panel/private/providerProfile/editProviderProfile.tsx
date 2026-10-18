import { Save } from "lucide-react";
import { createGenericEditPage } from "@coreModule/components/entityPage/pages/createGenericEditPage.tsx";
import { editProviderProfileFormSchema } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/editProviderProfile.form.validator.ts";
import type { ProviderProfile } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import type { EditProviderProfileFormType } from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/providerProfile/providerProfile.schema-def.ts";

/** Form values for a profile, limited to the fields the caller may write. Shared with the account sections. */
export function providerProfileInitialValues(
    data: ProviderProfile,
    writeFields: Record<string, unknown>,
): Partial<EditProviderProfileFormType> {
    return {
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
    };
}

export default createGenericEditPage<ProviderProfile, EditProviderProfileFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/providerProfile/editProviderProfile.tsx",
    collectionName: "providerprofiles",
    accessModel: "providerProfiles",
    apiUrl: "/api/eCommerceMarketplace/providerProfile",
    schema: editProviderProfileFormSchema,
    buildInitialValues: providerProfileInitialValues,
    submitIcon: <Save />,
});
