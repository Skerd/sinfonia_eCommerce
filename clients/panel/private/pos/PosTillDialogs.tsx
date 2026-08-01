import PosPinDialog from "@eCommerceModule/clients/panel/private/pos/PosPinDialog.tsx";
import PosVariantDialog from "@eCommerceModule/clients/panel/private/pos/PosVariantDialog.tsx";
import PosRefundDialog from "@eCommerceModule/clients/panel/private/pos/PosRefundDialog.tsx";
import PosSplitDialog from "@eCommerceModule/clients/panel/private/pos/PosSplitDialog.tsx";
import PosCashMoveDialog from "@eCommerceModule/clients/panel/private/pos/PosCashMoveDialog.tsx";
import PosCloseSessionDialog from "@eCommerceModule/clients/panel/private/pos/PosCloseSessionDialog.tsx";
import PosInfoDialog from "@eCommerceModule/clients/panel/private/pos/PosInfoDialog.tsx";
import PosHeldOrdersDialog from "@eCommerceModule/clients/panel/private/pos/PosHeldOrdersDialog.tsx";
import PosSessionOrdersDialog from "@eCommerceModule/clients/panel/private/pos/PosSessionOrdersDialog.tsx";
import PosReceipt from "@eCommerceModule/clients/panel/private/pos/PosReceipt.tsx";
import type {CatalogProduct, ReceiptPayload} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosReconciliation} from "@eCommerceModule/clients/panel/private/pos/usePosSession.ts";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";

type Props = {
    rk: (key: string) => string;
    money: (n: number) => string;
    session: PosSession;

    splitOpen: boolean;
    onSplitOpenChange: (open: boolean) => void;
    splitMode: "equal" | "items";
    onSplitModeChange: (mode: "equal" | "items") => void;
    splitGuests: number;
    onSplitGuestsChange: (n: number) => void;
    equalPerPerson: number;
    total: number;
    onApplyEqualSplit: () => void;
    onStartItemsSplit: () => void;

    cashMoveOpen: "in" | "out" | null;
    onCashMoveOpenChange: (open: boolean) => void;
    cashMoveAmount: string;
    onCashMoveAmountChange: (value: string) => void;
    cashMoveReason: string;
    onCashMoveReasonChange: (value: string) => void;
    cashMoveBusy: boolean;
    onSubmitCashMove: () => void;
    onCancelCashMove: () => void;

    closeOpen: boolean;
    onCloseOpenChange: (open: boolean) => void;
    closingBalance: string;
    onClosingBalanceChange: (value: string) => void;
    closingNotes: string;
    onClosingNotesChange: (value: string) => void;
    differenceReason: string;
    onDifferenceReasonChange: (value: string) => void;
    closeBusy: boolean;
    recon: PosReconciliation | null;
    onLoadReconciliation: (closingBalance: number) => void;
    onCloseSession: () => void;

    infoOpen: boolean;
    onInfoOpenChange: (open: boolean) => void;

    heldOpen: boolean;
    onHeldOpenChange: (open: boolean) => void;
    heldBusy: boolean;
    heldOrders: PosOrder[];
    onResumeHeld: (order: PosOrder) => void;
    onDiscardHeld: (orderId: string) => void;

    ordersOpen: boolean;
    onOrdersOpenChange: (open: boolean) => void;
    ordersBusy: boolean;
    sessionOrders: PosOrder[];
    onRefundOrder: (order: PosOrder) => void;
    onReprintOrder: (orderId: string) => void;

    receiptOpen: boolean;
    onReceiptOpenChange: (open: boolean) => void;
    receipt: ReceiptPayload | null;
    onReceiptNewOrder: () => void;
    onPrintReceipt: () => void;

    pinOpen: boolean;
    pinBusy: boolean;
    pinTitle: string;
    pinManagers?: {_id: string; label: string}[];
    onPinOpenChange: (open: boolean) => void;
    onPinConfirm: (pin: string, managerId: string) => void;

    variantProduct: CatalogProduct | null;
    onVariantClose: () => void;
    onVariantPick: (
        variantId: string,
        price: number,
        label: string,
        stockQty?: number,
        trackInventory?: boolean,
    ) => void;
    allowOversell: boolean;

    refundOrder: PosOrder | null;
    requireRefundPin: boolean;
    onRequestRefundAuth?: () => Promise<{managerPin: string; managerId: string} | null>;
    onRefundOpenChange: (open: boolean) => void;
    onRefunded: () => void;
};

export default function PosTillDialogs(props: Props) {
    const {
        rk,
        money,
        session,
        splitOpen,
        onSplitOpenChange,
        splitMode,
        onSplitModeChange,
        splitGuests,
        onSplitGuestsChange,
        equalPerPerson,
        total,
        onApplyEqualSplit,
        onStartItemsSplit,
        cashMoveOpen,
        onCashMoveOpenChange,
        cashMoveAmount,
        onCashMoveAmountChange,
        cashMoveReason,
        onCashMoveReasonChange,
        cashMoveBusy,
        onSubmitCashMove,
        onCancelCashMove,
        closeOpen,
        onCloseOpenChange,
        closingBalance,
        onClosingBalanceChange,
        closingNotes,
        onClosingNotesChange,
        differenceReason,
        onDifferenceReasonChange,
        closeBusy,
        recon,
        onLoadReconciliation,
        onCloseSession,
        infoOpen,
        onInfoOpenChange,
        heldOpen,
        onHeldOpenChange,
        heldBusy,
        heldOrders,
        onResumeHeld,
        onDiscardHeld,
        ordersOpen,
        onOrdersOpenChange,
        ordersBusy,
        sessionOrders,
        onRefundOrder,
        onReprintOrder,
        receiptOpen,
        onReceiptOpenChange,
        receipt,
        onReceiptNewOrder,
        onPrintReceipt,
        pinOpen,
        pinBusy,
        pinTitle,
        pinManagers,
        onPinOpenChange,
        onPinConfirm,
        variantProduct,
        onVariantClose,
        onVariantPick,
        allowOversell,
        refundOrder,
        requireRefundPin,
        onRequestRefundAuth,
        onRefundOpenChange,
        onRefunded,
    } = props;

    return (
        <>
            <PosPinDialog
                open={pinOpen}
                onOpenChange={onPinOpenChange}
                title={pinTitle || rk("pin.title")}
                description={
                    pinManagers && pinManagers.length > 1
                        ? rk("pin.selectThenEnter")
                        : rk("pin.description")
                }
                managers={pinManagers}
                rk={rk}
                busy={pinBusy}
                onConfirm={onPinConfirm}
            />

            <PosVariantDialog
                product={variantProduct}
                open={!!variantProduct}
                onClose={onVariantClose}
                money={money}
                rk={rk}
                allowOversell={allowOversell}
                onPick={onVariantPick}
            />

            <PosRefundDialog
                order={refundOrder}
                open={!!refundOrder}
                requirePin={requireRefundPin}
                requestManagerAuth={onRequestRefundAuth}
                money={money}
                rk={rk}
                onOpenChange={onRefundOpenChange}
                onRefunded={onRefunded}
            />

            <PosSplitDialog
                open={splitOpen}
                onOpenChange={onSplitOpenChange}
                splitMode={splitMode}
                onSplitModeChange={onSplitModeChange}
                splitGuests={splitGuests}
                onSplitGuestsChange={onSplitGuestsChange}
                equalPerPerson={equalPerPerson}
                total={total}
                onApplyEqualSplit={onApplyEqualSplit}
                onStartItemsSplit={onStartItemsSplit}
                money={money}
                rk={rk}
            />

            <PosCashMoveDialog
                cashMoveOpen={cashMoveOpen}
                onOpenChange={onCashMoveOpenChange}
                cashMoveAmount={cashMoveAmount}
                onCashMoveAmountChange={onCashMoveAmountChange}
                cashMoveReason={cashMoveReason}
                onCashMoveReasonChange={onCashMoveReasonChange}
                cashMoveBusy={cashMoveBusy}
                onSubmit={onSubmitCashMove}
                onCancel={onCancelCashMove}
                rk={rk}
            />

            <PosCloseSessionDialog
                open={closeOpen}
                onOpenChange={onCloseOpenChange}
                session={session}
                closingBalance={closingBalance}
                onClosingBalanceChange={onClosingBalanceChange}
                closingNotes={closingNotes}
                onClosingNotesChange={onClosingNotesChange}
                differenceReason={differenceReason}
                onDifferenceReasonChange={onDifferenceReasonChange}
                closeBusy={closeBusy}
                recon={recon}
                onLoadReconciliation={onLoadReconciliation}
                onCloseSession={onCloseSession}
                money={money}
                rk={rk}
            />

            <PosInfoDialog open={infoOpen} onOpenChange={onInfoOpenChange} rk={rk} />

            <PosHeldOrdersDialog
                open={heldOpen}
                onOpenChange={onHeldOpenChange}
                heldBusy={heldBusy}
                heldOrders={heldOrders}
                onResumeHeld={onResumeHeld}
                onDiscardHeld={onDiscardHeld}
                money={money}
                rk={rk}
            />

            <PosSessionOrdersDialog
                open={ordersOpen}
                onOpenChange={onOrdersOpenChange}
                ordersBusy={ordersBusy}
                sessionOrders={sessionOrders}
                onRefundOrder={onRefundOrder}
                onReprintOrder={onReprintOrder}
                money={money}
                rk={rk}
            />

            <PosReceipt
                open={receiptOpen}
                onOpenChange={onReceiptOpenChange}
                receipt={receipt}
                onNewOrder={onReceiptNewOrder}
                onPrint={onPrintReceipt}
                money={money}
                rk={rk}
            />
        </>
    );
}
