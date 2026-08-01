import {Save} from "lucide-react";
import {createGenericEditPage} from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import {FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS} from "@coreModule/components/custom/formObjectIdChips.tsx";
import {editDiscountFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/editDiscount.form.validator.ts";
import type {EditDiscountFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.schema-def.ts";
import type {Discount} from "armonia/src/modules/eCommerce/api/eCommerce/private/discount/discount.dto.ts";

const discountChipLabelState = {
    loadedId: null as string | null,
    targetIds: {current: {} as Record<string, string>},
    customerGroups: {current: {} as Record<string, string>},
    getProductIds: {current: {} as Record<string, string>},
};

function fillLabelMap(
    map: Record<string, string>,
    labels: {_id: string; name: string}[] | undefined,
) {
    for (const item of labels ?? []) {
        if (item?._id && item.name) map[item._id] = item.name;
    }
}

/** Match discount form DateInput `valueFormat: "yyyy-MM-dd HH:mm"` (local time). */
function toFormDateTime(value: string | Date | undefined | null): string | undefined {
    if (!value) return undefined;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return undefined;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default createGenericEditPage<Discount, EditDiscountFormType>({
    languagePath: "src/modules/eCommerce/clients/panel/private/discounts/editDiscount.tsx",
    collectionName: "discounts",
    accessModel: "discounts",
    apiUrl: "/api/eCommerce/discount",
    schema: editDiscountFormSchema,
    mapEntityData: (data) => {
        const isBxgy = data.type === "buy_x_get_y";
        return {
            ...data,
            ...(isBxgy
                ? {appliesTo: "product" as const, value: 0, targetIds: []}
                : {targetIds: data.targetIds ?? data.targets?.map((t) => t._id)}),
            customerGroups: data.customerGroups ?? data.customerGroupRefs?.map((g) => g._id),
            buyXGetY: data.buyXGetY
                ? {
                      ...data.buyXGetY,
                      getProductIds: data.buyXGetY.getProductIds ?? data.buyXGetY.getProducts?.map((p) => p._id) ?? [],
                  }
                : undefined,
            startsAt: toFormDateTime(data.startsAt),
            endsAt: toFormDateTime(data.endsAt),
        };
    },
    buildFormExtras: (_entityId, _params, entity) => {
        if (entity) {
            if (discountChipLabelState.loadedId !== entity._id) {
                discountChipLabelState.loadedId = entity._id;
                discountChipLabelState.targetIds.current = {};
                discountChipLabelState.customerGroups.current = {};
                discountChipLabelState.getProductIds.current = {};
            }
            fillLabelMap(discountChipLabelState.targetIds.current, entity.targets);
            fillLabelMap(discountChipLabelState.customerGroups.current, entity.customerGroupRefs);
            fillLabelMap(discountChipLabelState.getProductIds.current, entity.buyXGetY?.getProducts);
        }

        const targetOptions =
            entity?.targets
                ?.filter((t) => !!t?._id && !!t.name)
                .map((t) => ({value: t._id, label: t.name})) ?? [];
        const customerGroupOptions =
            entity?.customerGroupRefs
                ?.filter((g) => !!g?._id && !!g.name)
                .map((g) => ({value: g._id, label: g.name})) ?? [];
        const getProductOptions =
            entity?.buyXGetY?.getProducts
                ?.filter((p) => !!p?._id && !!p.name)
                .map((p) => ({value: p._id, label: p.name})) ?? [];

        return {
            targetIds: targetOptions,
            customerGroups: customerGroupOptions,
            "buyXGetY.getProductIds": getProductOptions,
            [FORM_EXTRAS_OBJECT_ID_CHIP_LABEL_REFS]: {
                targetIds: discountChipLabelState.targetIds,
                customerGroups: discountChipLabelState.customerGroups,
                "buyXGetY.getProductIds": discountChipLabelState.getProductIds,
            },
        };
    },
    submitIcon: <Save />,
});
