import {describe, expect, it} from "vitest";
import {lineTotal, type CartLine} from "../posTypes";

const line = (unitPrice: number, quantity: number, discountPercent = 0): CartLine =>
    ({key: "k", productId: "p", title: "Item", unitPrice, quantity, discountPercent});

describe("lineTotal (D35)", () => {
    it("rounds a line like the server's till sale, so the screen total matches the receipt", () => {
        // 3 × 19.99 = 59.97, 15 % off = 8.9955 → 9.00
        expect(lineTotal(line(19.99, 3, 15))).toBe(50.97);
        expect(lineTotal(line(0.1, 3))).toBe(0.3);
        expect(lineTotal(line(10, 1, 100))).toBe(0);
    });
});
