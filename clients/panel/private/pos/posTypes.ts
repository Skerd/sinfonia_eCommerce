import type {PosConfig} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/posConfig.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import {formatCurrency, formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {multiplyMoney, percentOfMoney, subtractMoney} from "armonia/src/modules/core/helpers/money.ts";

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
    terminalProtocol?: string;
    terminalHost?: string;
    terminalPort?: number;
    terminalId?: string;
    terminalPath?: string;
    cashQuickAmounts?: string;
};

export type ReceiptVatRow = {
    rate: number;
    amount: number;
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
    amountTax?: number;
    amountWithoutVat?: number;
    vatRows?: ReceiptVatRow[];
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
    fiscalIssueDateTime?: string;
    fiscalInvNum?: string;
    fiscalTcrCode?: string;
    fiscalOperatorCode?: string;
    fiscalBusinessUnitCode?: string;
    fiscalTypeOfInv?: string;
    fiscalError?: string;
    fiscalized?: boolean;
    fiscalAttempted?: boolean;
};

/** A till the picker offers: the select endpoint returns only its id and name. */
export type PosConfigChoice = Pick<PosConfig, "_id" | "name"> & Partial<Pick<PosConfig, "warehouses">>;

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

/** True when this till's fiscal config is active, so sales can be fiscalized. */
export function posFiscalizationActive(config: PosConfig | null | undefined): boolean {
    return config?.fiscalConfig?.isActive === true;
}

/**
 * Money at the till: in the till's currency at that currency's decimals (GLB-08, UX-07). A till with no currency set
 * shows plain amounts rather than pretending they are euros.
 */
export function formatMoney(value: number, currencyCode?: string, decimalPlaces = 2): string {
    const digits = {minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces};
    if (!currencyCode) return formatNumber(value, digits);
    try {
        return formatCurrency(value, currencyCode, digits);
    } catch {
        return `${formatNumber(value, digits)} ${currencyCode}`;
    }
}

/** A line after its discount, rounded like the server's till sale (D35), so screen and receipt agree. */
export function lineTotal(line: CartLine): number {
    const gross = multiplyMoney(line.unitPrice, line.quantity);
    const discount = percentOfMoney(gross, Math.min(100, Math.max(0, line.discountPercent)));
    return Math.max(0, subtractMoney(gross, discount));
}

/** A till error toast that keeps the server's reason ("Could not close session: Explain the cash difference"). */
export function withServerReason(title: string, error: unknown): string {
    const reason = error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : "";
    return reason && reason !== title ? `${title}: ${reason}` : title;
}
