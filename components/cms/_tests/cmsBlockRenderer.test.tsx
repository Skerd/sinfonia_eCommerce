import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {MemoryRouter, Route, Routes, useLocation} from "react-router-dom";
import CmsBlockRenderer from "@eCommerceModule/components/cms/CmsBlockRenderer.tsx";
import type {CmsBlock} from "armonia/src/modules/eCommerce/api/eCommerce/private/cmsBlock/cmsBlock.dto.ts";

function block(type: string, config: CmsBlock["config"]): CmsBlock {
    return {_id: `block-${type}`, type, title: `${type} title`, isActive: true, position: 0, config} as CmsBlock;
}

function CurrentPath() {
    return <p data-testid="path">{useLocation().pathname}</p>;
}

function renderBlock(cmsBlock: CmsBlock) {
    return render(
        <MemoryRouter initialEntries={["/"]}>
            <CurrentPath />
            <Routes>
                <Route path="*" element={<CmsBlockRenderer block={cmsBlock} />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("CmsBlockRenderer", () => {
    it("follows site links inside merchant HTML in-app instead of reloading the page", () => {
        renderBlock(block("custom_html", {html: '<p>See <a href="/products">all products</a></p>'}));

        const link = screen.getByRole("link", {name: "all products"});
        const notPrevented = fireEvent.click(link);

        expect(notPrevented).toBe(false);
        expect(screen.getByTestId("path")).toHaveTextContent("/products");
    });

    it("leaves external links in merchant HTML to the browser", () => {
        renderBlock(block("custom_html", {html: '<a href="https://example.com/">partner</a>'}));

        const notPrevented = fireEvent.click(screen.getByRole("link", {name: "partner"}));

        expect(notPrevented).toBe(true);
        expect(screen.getByTestId("path")).toHaveTextContent("/");
    });

    it("renders nothing for a block type it doesn't know, instead of the raw type", () => {
        const {container} = renderBlock(block("loyalty_widget", {}));

        expect(container.querySelector("section")).toBeEmptyDOMElement();
        expect(screen.queryByText("loyalty_widget")).not.toBeInTheDocument();
    });

    it("heads the page with the hero when asked to", () => {
        render(
            <MemoryRouter>
                <CmsBlockRenderer block={block("hero_banner", {headline: "Summer drop"})} headingLevel="h1" />
            </MemoryRouter>,
        );

        expect(screen.getByRole("heading", {level: 1, name: "Summer drop"})).toBeInTheDocument();
    });
});
