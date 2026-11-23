import {describe, expect, it} from "vitest";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {NavLinkItem, NavSubCollapsible, NavSubItem} from "@coreModule/helpers/types/sidebarNav.types.ts";
import {buildECommerceTenancySettingsSubCollapsible} from "../eCommerceTenancyNav.ts";

/* TD-F151: each POS settings link asks for the permission of the page it opens. TD-F153: the shop lists gift cards and
   fiscal configs (finance's pages, used by shops only), so other businesses with finance no longer see them. */

const resolve = ((key: string) => key) as ResolveLanguageKey;

function isGroup(item: NavSubItem): item is NavSubCollapsible {
    return "items" in item;
}

function findLink(items: readonly NavSubItem[], url: string): NavLinkItem | undefined {
    for (const item of items) {
        if (isGroup(item)) {
            const found = findLink(item.items, url);
            if (found) return found;
        } else if (item.url === url) return item;
    }
    return undefined;
}

describe("shop settings navigation (TD-F151)", () => {
    it("guards POS configs and POS payment methods with their own permissions", () => {
        const {items} = buildECommerceTenancySettingsSubCollapsible(resolve);
        expect(findLink(items, "/tenancy/systemSettings/posconfigs")?.permissions).toEqual(["posConfigs"]);
        expect(findLink(items, "/tenancy/systemSettings/pospaymentmethods")?.permissions).toEqual(["posPaymentMethods"]);
    });

    it("lists gift cards and the till's fiscal configs among the shop's settings (TD-F153)", () => {
        const {items} = buildECommerceTenancySettingsSubCollapsible(resolve);
        expect(findLink(items, "/tenancy/systemSettings/giftcards")?.permissions).toEqual(["giftCards"]);
        expect(findLink(items, "/tenancy/systemSettings/fiscalconfigs")?.permissions).toEqual(["fiscalConfigs"]);
    });
});
