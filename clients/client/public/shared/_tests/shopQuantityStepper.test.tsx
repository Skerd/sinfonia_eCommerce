import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {Provider} from "react-redux";
import {combineReducers, configureStore} from "@reduxjs/toolkit";
import languageReducer from "@coreModule/helpers/redux/slices/languageSlice.ts";
import ShopQuantityStepper from "@eCommerceModule/clients/client/public/shared/shopQuantityStepper.tsx";
import {shopDiscountPercent} from "@eCommerceModule/clients/client/public/shared/shopProductCard.tsx";

const store = configureStore({reducer: combineReducers({language: languageReducer})});

async function renderStepper(props: {value: number; min: number; step: number; max?: number; removeBelowMin?: boolean}) {
    const onChange = vi.fn();
    render(
        <Provider store={store}>
            <ShopQuantityStepper itemLabel="Tee" onChange={onChange} {...props} />
        </Provider>,
    );
    // The buttons are named from the stepper's dictionary once it has loaded
    await waitFor(() => expect(screen.getByRole("button", {name: /increase quantity of tee/i})).toBeInTheDocument());
    const [down, up] = screen.getAllByRole("button");
    return {onChange, down, up};
}

describe("ShopQuantityStepper", () => {
    it("steps by the product's step and stops at its maximum", async () => {
        const {onChange, down, up} = await renderStepper({value: 4, min: 2, step: 2, max: 6});
        fireEvent.click(up);
        expect(onChange).toHaveBeenLastCalledWith(6);
        fireEvent.click(down);
        expect(onChange).toHaveBeenLastCalledWith(2);
    });

    it("won't offer a quantity above the maximum", async () => {
        const {up} = await renderStepper({value: 6, min: 2, step: 2, max: 6});
        expect(up).toBeDisabled();
    });

    it("stops at the minimum on the product page", async () => {
        const {down} = await renderStepper({value: 2, min: 2, step: 2});
        expect(down).toBeDisabled();
        expect(down).toHaveAccessibleName(/decrease quantity of tee/i);
    });

    it("asks to remove the line when stepping below the minimum in the cart", async () => {
        const {onChange, down} = await renderStepper({value: 2, min: 2, step: 2, removeBelowMin: true});
        expect(down).toHaveAccessibleName(/remove tee/i);
        fireEvent.click(down);
        expect(onChange).toHaveBeenLastCalledWith(0);
    });
});

describe("shopDiscountPercent", () => {
    it("rounds the real saving", () => {
        expect(shopDiscountPercent(199, 231)).toBe(14);
    });

    it("is null when there is no saving to show", () => {
        expect(shopDiscountPercent(50, 50)).toBeNull();
        expect(shopDiscountPercent(60, 50)).toBeNull();
        expect(shopDiscountPercent(50, undefined)).toBeNull();
        expect(shopDiscountPercent(undefined, 50)).toBeNull();
    });
});
