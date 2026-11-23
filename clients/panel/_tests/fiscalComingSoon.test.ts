import {describe, expect, it, vi} from "vitest";
import type {ReactElement} from "react";

// Fiscalization switched off, as it is until certification (D186); `eCommerceTenancyNav.test.ts` covers it switched on.
vi.mock("armonia/src/modules/finance/helpers/fiscalAvailability.ts", () => ({FISCALIZATION_AVAILABLE: false}));

import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {NavItem, NavSubItem} from "@coreModule/helpers/types/sidebarNav.types.ts";
import type {RouteConfigContribution} from "@coreModule/helpers/types/routeConfigContribution.types.ts";
import type {HomeTourStop} from "@coreModule/helpers/types/homeContribution.types.ts";
import {buildECommerceTenancySettingsSubCollapsible} from "../eCommerceTenancyNav.ts";
import sidebarContribution from "../sidebarContribution.tsx";
import routeConfigContribution from "../routeConfigContribution.tsx";
import homeContribution from "../homeContribution.tsx";
import financeRouteConfigContribution from "@financeModule/clients/panel/routeConfigContribution.tsx";

const resolve = ((key: string) => key) as ResolveLanguageKey;

function leafUrls(items: readonly (NavItem | NavSubItem)[]): string[] {
    return items.flatMap((item) => ("items" in item && item.items ? leafUrls(item.items) : "url" in item ? [String(item.url)] : []));
}

/** What a route contribution renders at `path`, as the panel shell asks for it. */
function routeAt(contribution: RouteConfigContribution, path: string) {
    const [pathname, search = ""] = path.split("?");
    const segments = pathname.split("/").filter(Boolean);
    return contribution.contributeRoutes?.({
        menu: segments[0],
        subview: segments[1],
        segments,
        searchParams: new URLSearchParams(search),
        resolveLanguageKey: resolve,
    }) as ReactElement<{feature?: string}> | undefined;
}

const TILL_PAGES = [
    "/eCommerce/pos",
    "/eCommerce/posorders",
    "/eCommerce/possessions",
    "/tenancy/systemSettings/posconfigs",
    "/tenancy/systemSettings/pospaymentmethods",
];

describe("the till and fiscalization coming soon (D186)", () => {
    it("moves both to a Coming soon section of two links, each marked Soon", () => {
        const groups = sidebarContribution.getNavGroups(resolve);
        expect(groups.map((group) => group.title)).toEqual(["menus.eCommerce.productCommerce.title", "menus.eCommerce.comingSoon.title"]);
        expect(leafUrls(groups[0].items).filter((url) => TILL_PAGES.includes(url))).toEqual([]);
        expect(groups[1].items.map((item) => [item.title, String(item.url), item.badge, item.permissions])).toEqual([
            ["menus.eCommerce.posGroup.title", "/eCommerce/pos", "menus.eCommerce.comingSoon.badge", ["posOrders", "posConfigs"]],
            ["menus.tenancy.systemSettings.fiscalconfigs.title", "/tenancy/systemSettings/fiscalconfigs", "menus.eCommerce.comingSoon.badge", ["fiscalConfigs"]],
        ]);
    });

    it("leaves the till's setup out of the shop's settings", () => {
        const urls = leafUrls(buildECommerceTenancySettingsSubCollapsible(resolve).items);
        expect(urls).toContain("/tenancy/systemSettings/giftcards");
        expect(urls.filter((url) => [...TILL_PAGES, "/tenancy/systemSettings/fiscalconfigs"].includes(url))).toEqual([]);
    });

    it("opens the coming-soon page at every till and fiscal address, bookmarks and forms included", () => {
        for (const path of [...TILL_PAGES, "/tenancy/systemSettings/posconfigs/create", "/tenancy/systemSettings/pospaymentmethods/edit?posPaymentMethodId=1"]) {
            expect(routeAt(routeConfigContribution, path)?.props.feature, path).toBe("pos");
        }
        for (const path of ["/tenancy/systemSettings/fiscalconfigs", "/tenancy/systemSettings/fiscalconfigs/edit?fiscalConfigId=1"]) {
            // Finance leaves the address to the shop while fiscalization is off
            expect(routeAt(financeRouteConfigContribution, path), path).toBeUndefined();
            expect(routeAt(routeConfigContribution, path)?.props.feature, path).toBe("fiscal");
        }
        expect(routeAt(routeConfigContribution, "/eCommerce/products")?.props.feature).toBeUndefined();
    });

    it("leaves the till and fiscal pages out of the tour", () => {
        const stops = homeContribution.getTour?.({resolveLanguageKey: resolve, company: {id: "c1", name: "Shop"}}) ?? [];
        const pages = stops.flatMap((stop: HomeTourStop) => ("page" in stop ? [stop.page] : []));
        expect(pages).toContain("/eCommerce/products");
        expect(pages.filter((page) => [...TILL_PAGES, "/tenancy/systemSettings/fiscalconfigs"].includes(page))).toEqual([]);
    });
});
