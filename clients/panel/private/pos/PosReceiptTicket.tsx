import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import type {ReceiptPayload} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

type TicketRk = (key: string) => string;

type TicketBodyProps = {
    receipt: ReceiptPayload;
    money: (n: number) => string;
    rk: TicketRk;
    shopFallback: string;
};

function formatVatRate(rate: number): string {
    const rounded = Math.round(rate);
    if (Math.abs(rate - rounded) < 0.001) return String(rounded);
    return String(rate);
}

function formatFiscalDateTime(value?: string): string {
    if (!value) return "";
    return value.replace("T", " ").replace(/[+-]\d{2}:\d{2}$/, "").replace(/Z$/, "");
}

function FiscalLine({label, value}: {label: string; value?: string}) {
    if (!value) return null;
    return (
        <div className="fiscal-line">
            {label}: {value}
        </div>
    );
}

export function PosReceiptTicketBody({receipt, money, rk, shopFallback}: TicketBodyProps) {
    const amountTax = receipt.amountTax ?? 0;
    const amountTotal = receipt.amountTotal ?? 0;
    const amountWithoutVat = receipt.amountWithoutVat ?? amountTotal - amountTax;
    const vatRows = receipt.vatRows?.length ? receipt.vatRows : [{rate: 0, amount: amountTax}];
    const lines = Array.isArray(receipt.lines) ? receipt.lines : [];
    const payments = Array.isArray(receipt.payments) ? receipt.payments : [];
    const fiscalized = receipt.fiscalized === true || Boolean(receipt.nivf);
    const fiscalAttempted = receipt.fiscalAttempted === true || fiscalized || Boolean(receipt.fiscalError);
    const paidAtLabel = receipt.paidAt
        ? formatDate(receipt.paidAt, {format: DATE_FORMATS.dateTime})
        : formatDate(new Date(), {format: DATE_FORMATS.dateTime});
    const issueDate = formatFiscalDateTime(receipt.fiscalIssueDateTime) || paidAtLabel;

    return (
        <>
            <div className="pos-receipt-header flex flex-col gap-y-1 text-center">
                <div className="company text-base font-bold uppercase tracking-wide">
                    {receipt.companyName || receipt.shopName || shopFallback}
                </div>
                {receipt.header ? (
                    <div className="header-text whitespace-pre-wrap text-3xs">{receipt.header}</div>
                ) : null}
                {receipt.shopName && receipt.companyName && receipt.shopName !== receipt.companyName ? (
                    <div className="shop text-3xs font-semibold">{receipt.shopName}</div>
                ) : null}
            </div>
            <div className="rule my-2 border-t border-dashed border-border" />
            <div className="meta flex flex-col gap-y-0.5 text-3xs">
                <div className="flex justify-between gap-2">
                    <span>{rk("order")}</span>
                    <span className="tabular-nums">{receipt.orderName}</span>
                </div>
                {receipt.productOrderNumber ? (
                    <div className="flex justify-between gap-2">
                        <span>{rk("ref")}</span>
                        <span className="tabular-nums">{receipt.productOrderNumber}</span>
                    </div>
                ) : null}
                <div className="flex justify-between gap-2">
                    <span>{rk("date")}</span>
                    <span className="tabular-nums">{paidAtLabel}</span>
                </div>
                <div className="flex justify-between gap-2">
                    <span>{rk("customer")}</span>
                    <span className="truncate text-right">{receipt.customerName || rk("walkIn")}</span>
                </div>
            </div>
            <div className="rule my-2 border-t border-dashed border-border" />
            <div className="lines flex flex-col gap-y-1">
                {lines.map((line, idx) => (
                    <div key={idx} className="line">
                        <div className="row flex justify-between gap-2">
                            <span className="min-w-0 flex-1 break-words">
                                {line.quantity}× {line.productName}
                                {line.discountPercent > 0 ? ` (-${line.discountPercent}%)` : ""}
                            </span>
                            <span className="shrink-0 tabular-nums">{money(line.priceTotal)}</span>
                        </div>
                        <div className="unit text-3xs tabular-nums text-muted-foreground">
                            {money(line.unitPrice)} × {line.quantity}
                        </div>
                    </div>
                ))}
            </div>
            <div className="rule my-2 border-t border-dashed border-border" />
            <div className="totals flex flex-col gap-y-0.5 tabular-nums">
                {(receipt.discountTotal ?? 0) > 0 && (
                    <div className="row flex justify-between gap-2">
                        <span>{rk("discount")}</span>
                        <span>-{money(receipt.discountTotal)}</span>
                    </div>
                )}
                <div className="row total flex justify-between gap-2 text-sm font-bold">
                    <span>{rk("total")}</span>
                    <span>{money(amountTotal)}</span>
                </div>
                {payments.map((p, idx) => (
                    <div key={idx} className="row pay flex justify-between gap-2 text-3xs">
                        <span className="min-w-0 flex-1 truncate">
                            {p.method}
                            {p.terminalAuthCode ? ` · ${p.terminalAuthCode}` : ""}
                        </span>
                        <span className="shrink-0">{money(p.amount)}</span>
                    </div>
                ))}
                {(receipt.amountReturn ?? 0) > 0 && (
                    <div className="row flex justify-between gap-2 font-semibold">
                        <span>{rk("change")}</span>
                        <span>{money(receipt.amountReturn)}</span>
                    </div>
                )}
                <div className="row vat flex justify-between gap-2 text-3xs">
                    <span>{rk("totalWithoutVat")}</span>
                    <span>{money(amountWithoutVat)}</span>
                </div>
                {vatRows.map((row) => (
                    <div key={row.rate} className="row vat flex justify-between gap-2 text-3xs">
                        <span>{rk("vatRate").replace("{rate}", formatVatRate(row.rate))}</span>
                        <span>{money(row.amount)}</span>
                    </div>
                ))}
                <div className="row vat flex justify-between gap-2 text-3xs">
                    <span>{rk("totalVat")}</span>
                    <span>{money(amountTax)}</span>
                </div>
            </div>
            {fiscalAttempted ? (
                <div className="pos-receipt-fiscal mt-2">
                    <div className="rule my-2 border-t border-dashed border-border" />
                    {!fiscalized ? (
                        <div className="not-fiscalized mb-1 text-center text-3xs font-bold uppercase">
                            {rk("notFiscalized")}
                            {receipt.fiscalError ? (
                                <div className="fiscal-error mt-0.5 text-3xs font-normal normal-case break-words">
                                    {receipt.fiscalError}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                    <div className="fiscal-block break-all text-3xs">
                        <FiscalLine label={rk("issueDate")} value={issueDate} />
                        <FiscalLine label={rk("fiscalNumber")} value={receipt.fiscalInvNum} />
                        <FiscalLine label={rk("tcrCode")} value={receipt.fiscalTcrCode} />
                        <FiscalLine label={rk("nivf")} value={receipt.nivf} />
                        <FiscalLine label={rk("nslf")} value={receipt.nslf} />
                        <FiscalLine label={rk("invoiceType")} value={receipt.fiscalTypeOfInv} />
                        <FiscalLine label={rk("operatorCode")} value={receipt.fiscalOperatorCode} />
                        <FiscalLine
                            label={rk("businessUnitCode")}
                            value={receipt.fiscalBusinessUnitCode}
                        />
                    </div>
                    {receipt.qrCodeDataUrl ? (
                        <img
                            src={receipt.qrCodeDataUrl}
                            alt={rk("fiscalQr")}
                            className="qr mx-auto mt-2 h-[120px] w-[120px] bg-white"
                        />
                    ) : null}
                </div>
            ) : null}
            <div className="rule my-2 border-t border-dashed border-border" />
            <div className="pos-receipt-footer text-center text-3xs whitespace-pre-wrap">
                {receipt.footer || rk("defaultFooter")}
            </div>
        </>
    );
}

export function PosReceiptPreview({receipt, money, rk, shopFallback}: TicketBodyProps) {
    return (
        <div className="mx-auto w-[80mm] max-w-full overflow-hidden rounded-md border border-border bg-white text-black shadow-sm">
            <div className="pos-receipt-ticket px-3 py-3 font-mono text-2xs leading-snug">
                <PosReceiptTicketBody
                    receipt={receipt}
                    money={money}
                    rk={rk}
                    shopFallback={shopFallback}
                />
            </div>
        </div>
    );
}

export function PosReceiptPrintRoot({
    receipt,
    money,
    rk,
    shopFallback,
    rootId,
    innerId,
}: TicketBodyProps & {rootId: string; innerId: string}) {
    return (
        <>
            <div id={rootId} aria-hidden className="hidden">
                <div id={innerId} className="pos-receipt-ticket">
                    <PosReceiptTicketBody
                        receipt={receipt}
                        money={money}
                        rk={rk}
                        shopFallback={shopFallback}
                    />
                </div>
            </div>
            <style>{posReceiptPrintCss(rootId, innerId)}</style>
        </>
    );
}

function posReceiptPrintCss(rootId: string, innerId: string): string {
    return `
        .pos-receipt-ticket .company {
            font-size: 15px;
            font-weight: 700;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .pos-receipt-ticket .header-text,
        .pos-receipt-ticket .shop,
        .pos-receipt-ticket .pos-receipt-footer {
            text-align: center;
            white-space: pre-wrap;
            font-size: 10px;
        }
        .pos-receipt-ticket .shop { font-weight: 600; margin-top: 2px; }
        .pos-receipt-ticket .rule {
            border-top: 1px dashed currentColor;
            margin: 6px 0;
        }
        .pos-receipt-ticket .meta > div,
        .pos-receipt-ticket .row {
            display: flex;
            justify-content: space-between;
            gap: 6px;
        }
        .pos-receipt-ticket .meta { font-size: 10px; }
        .pos-receipt-ticket .unit { font-size: 9px; }
        .pos-receipt-ticket .line { margin-bottom: 4px; }
        .pos-receipt-ticket .total { font-size: 13px; font-weight: 700; }
        .pos-receipt-ticket .pay,
        .pos-receipt-ticket .vat { font-size: 10px; }
        .pos-receipt-ticket .pos-receipt-fiscal { text-align: left; margin-top: 2px; }
        .pos-receipt-ticket .not-fiscalized {
            text-align: center;
            font-weight: 700;
            font-size: 11px;
            margin-bottom: 4px;
            text-transform: uppercase;
        }
        .pos-receipt-ticket .fiscal-error {
            font-weight: 400;
            font-size: 9px;
            text-transform: none;
            word-break: break-word;
            margin-top: 2px;
        }
        .pos-receipt-ticket .fiscal-block {
            font-size: 8px;
            word-break: break-all;
            margin-bottom: 4px;
        }
        .pos-receipt-ticket .fiscal-line { margin-top: 1px; }
        .pos-receipt-ticket .qr {
            display: block;
            width: 32mm;
            height: 32mm;
            margin: 2mm auto 1mm;
            image-rendering: pixelated;
        }
        @media print {
            @page { size: 80mm auto; margin: 0; }
            html, body {
                width: 80mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
            }
            body * { visibility: hidden !important; }
            #${rootId},
            #${rootId} * { visibility: visible !important; }
            #${rootId} {
                display: block !important;
                position: fixed !important;
                inset: 0 auto auto 0 !important;
                width: 80mm !important;
                max-width: 80mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                color: #000 !important;
                z-index: 99999 !important;
            }
            #${innerId} {
                width: 76mm !important;
                max-width: 76mm !important;
                margin: 0 auto !important;
                padding: 2mm 2mm 4mm !important;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                font-size: 11px !important;
                line-height: 1.3 !important;
                color: #000 !important;
                background: #fff !important;
            }
        }
    `;
}
