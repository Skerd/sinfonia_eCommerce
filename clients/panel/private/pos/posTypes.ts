import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";

export type CatalogVariant = {
    _id: string;
    sku?: string;
    barcode?: string;
    price?: number;
    label: string;
    trackInventory?: boolean;
    stockQty?: number;
};

export type CatalogProduct = {
    _id: string;
    title: string;
    sku?: string;
    barcode?: string;
    price: number;
    currency?: string;
    trackInventory?: boolean;
    type?: string;
    hasVariants?: boolean;
    shortDescription?: string;
    imageUrl?: string;
    stockQty?: number;
    variants?: CatalogVariant[];
    matchedVariantId?: string;
};

export type CatalogCategory = {
    _id: string;
    name: string;
};

export type CartLine = {
    key: string;
    productId: string;
    variantId?: string;
    title: string;
    sku?: string;
    unitPrice: number;
    quantity: number;
    discountPercent: number;
    trackInventory?: boolean;
    stockQty?: number;
};

export type PaymentLine = {
    id: string;
    paymentMethodId: string;
    name: string;
    type?: string;
    amount: number;
    label?: string;
    terminalEnabled?: boolean;
    terminalProvider?: string;
    terminalHost?: string;
    terminalPort?: number;
    terminalId?: string;
    terminalPath?: string;
    cashQuickAmounts?: string;
};

export type ReceiptPayload = {
    companyName?: string;
    header?: string;
    footer?: string;
    shopName?: string;
    orderName?: string;
    productOrderNumber?: string;
    lines: {
        productName: string;
        quantity: number;
        unitPrice: number;
        discountPercent: number;
        priceTotal: number;
    }[];
    discountTotal: number;
    amountTotal: number;
    amountPaid: number;
    amountReturn: number;
    payments: {
        method: string;
        type?: string;
        amount: number;
        terminalAuthCode?: string;
        terminalReference?: string;
        terminalId?: string;
    }[];
    customerName?: string;
    paidAt?: string;
    qrVerifyUrl?: string;
    nslf?: string;
    nivf?: string;
    qrCodeDataUrl?: string;
};

export type SessionBundle = {
    session: PosSession;
    config: PosConfig;
};

export type PosCustomerHit = {
    _id: string;
    label: string;
    name?: string;
    surname?: string;
    username?: string;
    phoneNumber?: string;
};

export const DEFAULT_CASH_QUICK_AMOUNTS = [0.1, 0.2, 0.5, 1, 5, 10, 20, 50, 100];

export function formatQuickAmount(value: number): string {
    return `+${value}`;
}

export function parseCashQuickAmounts(raw?: string | null): number[] {
    if (!raw?.trim()) return DEFAULT_CASH_QUICK_AMOUNTS;
    const parsed = raw
        .split(/[,;\s]+/)
        .map((part) => Number(part))
        .filter((n) => Number.isFinite(n) && n > 0);
    return parsed.length ? parsed : DEFAULT_CASH_QUICK_AMOUNTS;
}

export function formatMoney(value: number, currencyCode = "EUR"): string {
    try {
        return value.toLocaleString(undefined, {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 2,
        });
    } catch {
        return `${value.toFixed(2)} ${currencyCode}`;
    }
}

export function lineTotal(line: CartLine): number {
    const raw = line.unitPrice * line.quantity;
    const discount = raw * (Math.min(100, Math.max(0, line.discountPercent)) / 100);
    return Math.max(0, raw - discount);
}
