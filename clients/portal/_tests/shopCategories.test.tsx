import {render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {ComponentType} from "react";
import {MemoryRouter} from "react-router-dom";

const {apiClientMock} = vi.hoisted(() => ({apiClientMock: vi.fn()}));

vi.mock("@coreModule/helpers/apiClient/apiClient.ts", () => ({default: apiClientMock}));
vi.mock("@eCommerceModule/components/cms/useCmsBlocks.ts", () => ({useCmsBlocks: () => ({blocks: []})}));
vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", () => ({
    default: () => (Wrapped: ComponentType<Record<string, unknown>>) => (props: Record<string, unknown>) => (
        <Wrapped {...props} languageCode="en-US" resolveLanguageKey={(key: string) => key} />
    ),
}));

import ShopHome, {ShopCategoriesIntro} from "../shopHome.tsx";
import {clearResponseCache} from "@coreModule/helpers/apiClient/responseCache.ts";

const categories = [
    {_id: "c1", name: "Electronics", slug: "electronics"},
    {_id: "c2", name: "Fashion", slug: "fashion"},
    {_id: "c3", name: "Phones", slug: "phones", parent: "c1"},
];

describe("the shop's categories above the products tab", () => {
    beforeEach(() => {
        clearResponseCache();
        apiClientMock.mockReset();
        apiClientMock.mockResolvedValue({data: {data: {categories}}});
    });

    const open = (search: string) => render(<MemoryRouter initialEntries={[`/${search}`]}><ShopCategoriesIntro /></MemoryRouter>);

    it("marks the chosen category, keeps the search, and lets the visitor choose it again to see every category", async () => {
        open("?kind=product&q=bundle&f.category=fashion&page=3");

        const fashion = await screen.findByRole("link", {name: "Fashion"});
        expect(fashion).toHaveAttribute("aria-current", "true");
        expect(fashion).toHaveAttribute("href", "/?kind=product&q=bundle");

        const electronics = screen.getByRole("link", {name: "Electronics"});
        expect(electronics).not.toHaveAttribute("aria-current");
        expect(electronics).toHaveAttribute("href", "/?kind=product&q=bundle&f.category=electronics");
        // Top-level categories only.
        expect(screen.queryByRole("link", {name: "Phones"})).toBeNull();
    });

    it("leaves them off the home page, which opens on every kind (the products tab shows them)", () => {
        render(<MemoryRouter initialEntries={["/"]}><ShopHome /></MemoryRouter>);
        expect(screen.queryByText("categoriesTitle")).toBeNull();
        expect(apiClientMock).not.toHaveBeenCalled();
    });
});
