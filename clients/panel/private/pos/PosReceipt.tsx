import {Check, Printer} from "lucide-react";
import {Button} from "@coreModule/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {ReceiptPayload} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: ReceiptPayload | null;
    onNewOrder: () => void;
    onPrint: () => void;
    money: (n: number) => string;
    rk: (key: string) => string;
};

export default function PosReceipt({
    open,
    onOpenChange,
    receipt,
    onNewOrder,
    onPrint,
    money,
    rk,
}: Props) {
    return (
        <>
<Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-[22rem] print:hidden">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Check className="size-5 text-success" />
                {rk("receipt.title")}
            </DialogTitle>
        </DialogHeader>
        {receipt && (
            <div className="mx-auto w-[80mm] max-w-full overflow-hidden rounded-md border border-border bg-white text-black shadow-sm">
                <div id="pos-receipt" className="pos-receipt-ticket px-3 py-3 font-mono text-2xs leading-snug">
                    <div className="flex flex-col pos-receipt-header gap-y-1 text-center">
                        <div className="text-base font-bold uppercase tracking-wide">
                            {receipt.companyName || receipt.shopName || rk("title")}
                        </div>
                        {receipt.header ? (
                            <div className="whitespace-pre-wrap text-3xs text-foreground">{receipt.header}</div>
                        ) : null}
                        {receipt.shopName && receipt.companyName && receipt.shopName !== receipt.companyName ? (
                            <div className="text-3xs font-semibold">{receipt.shopName}</div>
                        ) : null}
                    </div>

                    <div className="my-2 border-t border-dashed border-border" />

                    <div className="flex flex-col gap-y-0.5 text-3xs">
                        <div className="flex justify-between gap-2">
                            <span>{rk("receipt.order")}</span>
                            <span className="tabular-nums">{receipt.orderName}</span>
                        </div>
                        {receipt.productOrderNumber ? (
                            <div className="flex justify-between gap-2">
                                <span>{rk("receipt.ref")}</span>
                                <span className="tabular-nums">{receipt.productOrderNumber}</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between gap-2">
                            <span>{rk("receipt.date")}</span>
                            <span className="tabular-nums">
                                {receipt.paidAt
                                    ? new Date(receipt.paidAt).toLocaleString()
                                    : new Date().toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span>{rk("customerName")}</span>
                            <span className="truncate text-right">{receipt.customerName || rk("walkIn")}</span>
                        </div>
                    </div>

                    <div className="my-2 border-t border-dashed border-border" />

                    <div className="flex flex-col gap-y-1">
                        {receipt.lines.map((line, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between gap-2">
                                    <span className="min-w-0 flex-1 break-words">
                                        {line.quantity}× {line.productName}
                                        {line.discountPercent > 0 ? ` (-${line.discountPercent}%)` : ""}
                                    </span>
                                    <span className="shrink-0 tabular-nums">{money(line.priceTotal)}</span>
                                </div>
                                <div className="text-3xs tabular-nums text-muted-foreground">
                                    {money(line.unitPrice)} × {line.quantity}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="my-2 border-t border-dashed border-border" />

                    <div className="flex flex-col gap-y-0.5 tabular-nums">
                        {receipt.discountTotal > 0 && (
                            <div className="flex justify-between gap-2">
                                <span>{rk("discount")}</span>
                                <span>-{money(receipt.discountTotal)}</span>
                            </div>
                        )}
                        <div className="flex justify-between gap-2 text-sm font-bold">
                            <span>{rk("total")}</span>
                            <span>{money(receipt.amountTotal)}</span>
                        </div>
                        {receipt.payments.map((p, idx) => (
                            <div key={idx} className="flex justify-between gap-2 text-3xs">
                                <span className="min-w-0 flex-1 truncate">
                                    {p.method}
                                    {p.terminalAuthCode ? ` · ${p.terminalAuthCode}` : ""}
                                </span>
                                <span className="shrink-0">{money(p.amount)}</span>
                            </div>
                        ))}
                        {receipt.amountReturn > 0 && (
                            <div className="flex justify-between gap-2 font-semibold">
                                <span>{rk("change")}</span>
                                <span>{money(receipt.amountReturn)}</span>
                            </div>
                        )}
                    </div>

                    {(receipt.qrCodeDataUrl || receipt.qrVerifyUrl) && (
                        <div className="flex flex-col pos-receipt-fiscal mt-2 gap-y-1 text-center">
                            <div className="border-t border-dashed border-border pt-2" />
                            <img
                                src={
                                    receipt.qrCodeDataUrl ||
                                    `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(receipt.qrVerifyUrl!)}`
                                }
                                alt={rk("receipt.fiscalQr")}
                                className="mx-auto h-[120px] w-[120px] bg-white"
                            />
                            {receipt.nslf ? (
                                <div className="break-all text-3xs tabular-nums text-foreground">
                                    {rk("receipt.nslf")}: {receipt.nslf}
                                </div>
                            ) : null}
                            {receipt.nivf ? (
                                <div className="break-all text-3xs tabular-nums text-foreground">
                                    {rk("receipt.nivf")}: {receipt.nivf}
                                </div>
                            ) : (
                                <div className="text-3xs text-muted-foreground">{rk("receipt.fiscalDemo")}</div>
                            )}
                        </div>
                    )}

                    <div className="my-2 border-t border-dashed border-border" />

                    <div className="flex flex-col pos-receipt-footer gap-y-1 text-center text-3xs">
                        {receipt.footer ? (
                            <div className="whitespace-pre-wrap text-foreground">{receipt.footer}</div>
                        ) : (
                            <div className="text-muted-foreground">{rk("receipt.defaultFooter")}</div>
                        )}
                    </div>
                </div>
            </div>
        )}
        <DialogFooter>
            <Button variant="outline" onClick={onNewOrder}>
                {rk("newOrder")}
            </Button>
            <Button className="bg-success hover:bg-success" onClick={onPrint}>
                <Printer className="size-4" />
                {rk("receipt.print")}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

{receipt && (
    <div id="pos-receipt-print-root" aria-hidden className="hidden">
        <div id="pos-receipt-print" className="pos-receipt-ticket">
            <div className="pos-receipt-header">
                <div className="company">{receipt.companyName || receipt.shopName || rk("title")}</div>
                {receipt.header ? <div className="header-text">{receipt.header}</div> : null}
                {receipt.shopName && receipt.companyName && receipt.shopName !== receipt.companyName ? (
                    <div className="shop">{receipt.shopName}</div>
                ) : null}
            </div>
            <div className="rule" />
            <div className="meta">
                <div>
                    <span>{rk("receipt.order")}</span>
                    <span>{receipt.orderName}</span>
                </div>
                {receipt.productOrderNumber ? (
                    <div>
                        <span>{rk("receipt.ref")}</span>
                        <span>{receipt.productOrderNumber}</span>
                    </div>
                ) : null}
                <div>
                    <span>{rk("receipt.date")}</span>
                    <span>
                        {receipt.paidAt
                            ? new Date(receipt.paidAt).toLocaleString()
                            : new Date().toLocaleString()}
                    </span>
                </div>
                <div>
                    <span>{rk("customerName")}</span>
                    <span>{receipt.customerName || rk("walkIn")}</span>
                </div>
            </div>
            <div className="rule" />
            <div className="lines">
                {receipt.lines.map((line, idx) => (
                    <div key={idx} className="line">
                        <div className="row">
                            <span>
                                {line.quantity}× {line.productName}
                                {line.discountPercent > 0 ? ` (-${line.discountPercent}%)` : ""}
                            </span>
                            <span>{money(line.priceTotal)}</span>
                        </div>
                        <div className="unit">
                            {money(line.unitPrice)} × {line.quantity}
                        </div>
                    </div>
                ))}
            </div>
            <div className="rule" />
            <div className="totals">
                {receipt.discountTotal > 0 && (
                    <div className="row">
                        <span>{rk("discount")}</span>
                        <span>-{money(receipt.discountTotal)}</span>
                    </div>
                )}
                <div className="row total">
                    <span>{rk("total")}</span>
                    <span>{money(receipt.amountTotal)}</span>
                </div>
                {receipt.payments.map((p, idx) => (
                    <div key={idx} className="row pay">
                        <span>
                            {p.method}
                            {p.terminalAuthCode ? ` · ${p.terminalAuthCode}` : ""}
                        </span>
                        <span>{money(p.amount)}</span>
                    </div>
                ))}
                {receipt.amountReturn > 0 && (
                    <div className="row">
                        <span>{rk("change")}</span>
                        <span>{money(receipt.amountReturn)}</span>
                    </div>
                )}
            </div>
            {(receipt.qrCodeDataUrl || receipt.qrVerifyUrl) && (
                <div className="pos-receipt-fiscal">
                    <div className="rule" />
                    <img
                        src={
                            receipt.qrCodeDataUrl ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(receipt.qrVerifyUrl!)}`
                        }
                        alt={rk("receipt.fiscalQr")}
                        className="qr"
                    />
                    {receipt.nslf ? (
                        <div className="fiscal-id">
                            {rk("receipt.nslf")}: {receipt.nslf}
                        </div>
                    ) : null}
                    {receipt.nivf ? (
                        <div className="fiscal-id">
                            {rk("receipt.nivf")}: {receipt.nivf}
                        </div>
                    ) : (
                        <div className="fiscal-demo">{rk("receipt.fiscalDemo")}</div>
                    )}
                </div>
            )}
            <div className="rule" />
            <div className="pos-receipt-footer">
                {receipt.footer || rk("receipt.defaultFooter")}
            </div>
        </div>
    </div>
)}

<style>{`
    @media print {
        @page {
            size: 80mm auto;
            margin: 0;
        }
        html, body {
            width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
        }
        body * {
            visibility: hidden !important;
        }
        #pos-receipt-print-root,
        #pos-receipt-print-root * {
            visibility: visible !important;
        }
        #pos-receipt-print-root {
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
        #pos-receipt-print {
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
        #pos-receipt-print .company {
            font-size: 15px !important;
            font-weight: 700 !important;
            text-align: center !important;
            text-transform: uppercase !important;
            letter-spacing: 0.04em !important;
        }
        #pos-receipt-print .header-text,
        #pos-receipt-print .shop,
        #pos-receipt-print .pos-receipt-footer {
            text-align: center !important;
            white-space: pre-wrap !important;
            font-size: 10px !important;
        }
        #pos-receipt-print .shop {
            font-weight: 600 !important;
            margin-top: 2px !important;
        }
        #pos-receipt-print .rule {
            border-top: 1px dashed #000 !important;
            margin: 6px 0 !important;
        }
        #pos-receipt-print .meta > div,
        #pos-receipt-print .row {
            display: flex !important;
            justify-content: space-between !important;
            gap: 6px !important;
        }
        #pos-receipt-print .meta {
            font-size: 10px !important;
        }
        #pos-receipt-print .unit {
            font-size: 9px !important;
        }
        #pos-receipt-print .line {
            margin-bottom: 4px !important;
        }
        #pos-receipt-print .total {
            font-size: 13px !important;
            font-weight: 700 !important;
        }
        #pos-receipt-print .pay {
            font-size: 10px !important;
        }
        #pos-receipt-print .pos-receipt-fiscal {
            text-align: center !important;
            margin-top: 2px !important;
        }
        #pos-receipt-print .pos-receipt-fiscal .qr {
            display: block !important;
            width: 32mm !important;
            height: 32mm !important;
            margin: 2mm auto 1mm !important;
            image-rendering: pixelated !important;
        }
        #pos-receipt-print .pos-receipt-fiscal .fiscal-id,
        #pos-receipt-print .pos-receipt-fiscal .fiscal-demo {
            font-size: 8px !important;
            word-break: break-all !important;
            margin-top: 1px !important;
        }
    }
`}</style>
        </>
    );
}
