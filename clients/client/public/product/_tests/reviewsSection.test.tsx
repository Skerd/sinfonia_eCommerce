import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";

vi.mock("@coreModule/helpers/hocs/withLanguage.tsx", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    default: (await import("@coreModule/components/viewEngine/_tests/harness.tsx")).fakeWithLanguage,
}));
vi.mock("@coreModule/helpers/hocs/withDebug.tsx", () => ({default: () => <T,>(Wrapped: T) => Wrapped}));
vi.mock("@coreModule/clients/portal/shared/portalSession.tsx", () => ({usePortalSession: () => ({isAuthenticated: true})}));
const ask = vi.hoisted(() => vi.fn());
// Every request goes through `useHttpRequest`, which calls `apiClient(config)`; `ask` answers it by route.
vi.mock("@coreModule/helpers/apiClient/apiClient.ts", () => ({default: Object.assign((config: {url: string}) => ask(config), {get: vi.fn(), post: vi.fn()})}));

const {default: ReviewsSection} = await import("../reviewsSection.tsx");

/* TD-F147: the form is offered for a paid order line the buyer has not reviewed yet, never for one they have. */

const PRODUCT = "aaaaaaaaaaaaaaaaaaaaaaa1";
const OTHER = "aaaaaaaaaaaaaaaaaaaaaaa2";

const order = (_id: string, paymentStatus: string, lines: {product: string; reviewed: boolean}[]) =>
    ({_id, paymentStatus, items: lines.map(({product, reviewed}) => ({product: {_id: product}, reviewed}))});

function answer(orders: ReturnType<typeof order>[]) {
    ask.mockImplementation(async (config: {url: string}) => {
        if (config.url === "/api/eCommerce/productOrder/my") return {data: {data: orders}};
        if (config.url === "/api/eCommerce/shopProductReviews") return {data: {data: [], total: 0}};
        if (config.url === "/api/eCommerce/productReview/createMine") return {data: {data: {_id: "r1"}}};
        throw new Error(`unexpected request ${config.url}`);
    });
}

const mount = () => render(<ReviewsSection productId={PRODUCT} slug="mug" />);
const ordersAsked = () => ask.mock.calls.filter(([config]) => config.url === "/api/eCommerce/productOrder/my").length;

beforeEach(() => {
    ask.mockReset();
});

describe("the shop product page's review form (TD-F147)", () => {
    it("offers the form for the paid order whose line is not reviewed yet", async () => {
        answer([
            order("o-reviewed", "paid", [{product: PRODUCT, reviewed: true}]),
            order("o-unpaid", "pending", [{product: PRODUCT, reviewed: false}]),
            order("o-open", "partially_refunded", [{product: OTHER, reviewed: false}, {product: PRODUCT, reviewed: false}]),
        ]);
        mount();

        expect(await screen.findByText("t:writeTitle")).toBeInTheDocument();
        expect(screen.queryByText("t:reviewed")).toBeNull();

        fireEvent.click(screen.getByRole("button", {name: "t:submit"}));
        await waitFor(() => expect(ask).toHaveBeenCalledWith(expect.objectContaining({url: "/api/eCommerce/productReview/createMine"})));
        const created = ask.mock.calls.find(([config]) => config.url === "/api/eCommerce/productReview/createMine")?.[0];
        expect(created.data).toMatchObject({order: "o-open", product: PRODUCT, rating: 5});
        // The orders are asked again, so the next unreviewed order, or the thanks, follows.
        await waitFor(() => expect(ordersAsked()).toBe(2));
    });

    it("says the buyer reviewed the product when every paid line with it is reviewed", async () => {
        answer([
            order("o-1", "paid", [{product: PRODUCT, reviewed: true}]),
            order("o-2", "paid", [{product: OTHER, reviewed: false}, {product: PRODUCT, reviewed: true}]),
            order("o-unpaid", "pending", [{product: PRODUCT, reviewed: false}]),
        ]);
        mount();

        expect(await screen.findByText("t:reviewed")).toBeInTheDocument();
        expect(screen.queryByText("t:writeTitle")).toBeNull();
    });

    it("shows neither to a buyer without a paid order of the product", async () => {
        answer([order("o-other", "paid", [{product: OTHER, reviewed: false}])]);
        mount();

        await waitFor(() => expect(ordersAsked()).toBe(1));
        expect(await screen.findByText("t:empty")).toBeInTheDocument();
        expect(screen.queryByText("t:writeTitle")).toBeNull();
        expect(screen.queryByText("t:reviewed")).toBeNull();
    });
});
