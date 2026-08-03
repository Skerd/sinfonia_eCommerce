import {useCallback, useMemo, useRef} from "react";
import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {usePosKeyboard} from "@eCommerceModule/clients/panel/private/pos/usePosKeyboard.ts";
import PosConfigPicker from "@eCommerceModule/clients/panel/private/pos/PosConfigPicker.tsx";
import PosOpenSessionDialog from "@eCommerceModule/clients/panel/private/pos/PosOpenSessionDialog.tsx";
import PosTillHeader from "@eCommerceModule/clients/panel/private/pos/PosTillHeader.tsx";
import PosCatalogPanel from "@eCommerceModule/clients/panel/private/pos/PosCatalogPanel.tsx";
import PosCartPanel from "@eCommerceModule/clients/panel/private/pos/PosCartPanel.tsx";
import PosTillDialogs from "@eCommerceModule/clients/panel/private/pos/PosTillDialogs.tsx";
import {usePosManagerPin} from "@eCommerceModule/clients/panel/private/pos/usePosManagerPin.ts";
import {usePosSession} from "@eCommerceModule/clients/panel/private/pos/usePosSession.ts";
import {usePosCatalog} from "@eCommerceModule/clients/panel/private/pos/usePosCatalog.ts";
import {usePosCart} from "@eCommerceModule/clients/panel/private/pos/usePosCart.ts";
import {usePosPayments} from "@eCommerceModule/clients/panel/private/pos/usePosPayments.ts";
import {formatMoney} from "@eCommerceModule/clients/panel/private/pos/posTypes.ts";
import type {PosManagerAuth} from "@eCommerceModule/clients/panel/private/pos/usePosManagerPin.ts";

function PosTill({resolveLanguageKey}: WithLanguageType) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const barcodeRef = useRef<HTMLInputElement>(null);
    const focusBarcode = useCallback(() => barcodeRef.current?.focus(), []);

    const clearPaymentsRef = useRef(() => {});
    const disarmPayRef = useRef(() => {});
    const clearOrderRef = useRef(() => {});
    const abortTerminalRef = useRef(() => {});

    const pinResolverRef = useRef<
        (needed: boolean, titleKey: string) => Promise<PosManagerAuth | null | undefined>
    >(async () => undefined);
    const resetPinRef = useRef(() => {});

    const sessionApi = usePosSession({
        resolveLanguageKey,
        resolveManagerPin: (needed, titleKey) => pinResolverRef.current(needed, titleKey),
        resetManagerPin: () => resetPinRef.current(),
        onSessionClosed: () => clearOrderRef.current(),
        onKillSwitch: () => abortTerminalRef.current(),
    });

    const pin = usePosManagerPin(sessionApi.configId, sessionApi.config?.managers, resolveLanguageKey);
    pinResolverRef.current = pin.resolveManagerPin;
    resetPinRef.current = pin.resetManagerPin;

    const cartApi = usePosCart({
        session: sessionApi.session,
        config: sessionApi.config,
        resolveLanguageKey,
        resolveManagerPin: pin.resolveManagerPin,
        isDiscountUnlocked: pin.isDiscountUnlocked,
        markDiscountUnlocked: pin.markDiscountUnlocked,
        focusBarcode,
        onClearPayments: () => clearPaymentsRef.current(),
        onDisarmPay: () => disarmPayRef.current(),
    });

    const catalogApi = usePosCatalog({
        configId: sessionApi.configId,
        session: sessionApi.session,
        config: sessionApi.config,
        barcodeRef,
        resolveLanguageKey,
        onAddCartLine: cartApi.addCartLine,
    });

    const currencyCode = sessionApi.config?.currency?.abbreviation || "EUR";
    const money = useMemo(() => (n: number) => formatMoney(n, currencyCode), [currencyCode]);

    const paymentsApi = usePosPayments({
        session: sessionApi.session,
        config: sessionApi.config,
        cart: cartApi.cart,
        setCart: cartApi.setCart,
        orderDiscountPercent: cartApi.orderDiscountPercent,
        customerId: cartApi.customerId,
        customerName: cartApi.customerName,
        showCustomer: cartApi.showCustomer,
        heldOrderId: cartApi.heldOrderId,
        currencyCode,
        resolveLanguageKey,
        resolveManagerPin: pin.resolveManagerPin,
        clearOrder: () => clearOrderRef.current(),
        showReceipt: sessionApi.showReceipt,
        setSession: sessionApi.setSession,
    });

    clearPaymentsRef.current = paymentsApi.clearPayments;
    disarmPayRef.current = paymentsApi.disarmPay;
    clearOrderRef.current = cartApi.clearOrder;
    abortTerminalRef.current = paymentsApi.abortTerminalCharges;

    const tillPaused = !!sessionApi.isPaused;

    usePosKeyboard({
        enabled: !!sessionApi.session && !sessionApi.bootLoading && !tillPaused,
        onPay: () => {
            if (!tillPaused && !paymentsApi.paying) paymentsApi.requestPay();
        },
        onHold: () => {
            if (!tillPaused && cartApi.cart.length && !cartApi.holdBusy) void cartApi.holdCart();
        },
        onClear: cartApi.clearOrder,
        onFocusBarcode: focusBarcode,
        onOpenHeld: () => void cartApi.openHeldList(),
        onOpenOrders: () => void sessionApi.openSessionOrders(),
        onOpenInfo: () => sessionApi.setInfoOpen(true),
        onQtyDelta: cartApi.bumpSelectedQty,
        onRemoveSelected: () => {
            if (cartApi.selectedLineKey) cartApi.removeLine(cartApi.selectedLineKey);
        },
        onTogglePayment: () => {
            if (!tillPaused) paymentsApi.setShowPayment((v) => !v);
        },
    });

    if (sessionApi.bootLoading) {
        return (
            <div className="flex h-full min-h-0 items-center justify-center bg-background">
                <Loader />
            </div>
        );
    }

    if (!sessionApi.configId) {
        return <PosConfigPicker configs={sessionApi.configs} rk={rk} onSelect={sessionApi.selectConfig} />;
    }

    if (!sessionApi.session) {
        if (sessionApi.config && sessionApi.config.isActive === false) {
            return (
                <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 bg-background px-6 text-center">
                    <div className="max-w-md text-sm font-semibold text-muted-foreground">
                        {rk("inactive.banner")}
                    </div>
                    <button
                        type="button"
                        className="text-sm text-primary underline"
                        onClick={() => sessionApi.navigate("/tenancy/systemSettings/posconfigs")}
                    >
                        {rk("backToConfigs")}
                    </button>
                </div>
            );
        }
        if (sessionApi.config?.isPaused || sessionApi.isPaused) {
            const companyPaused = !!sessionApi.config?.isCompanyPaused;
            const reason = companyPaused
                ? sessionApi.config?.companyPauseReason
                : sessionApi.config?.pauseReason;
            return (
                <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 bg-background px-6 text-center">
                    <div
                        className={
                            companyPaused
                                ? "max-w-md text-sm font-semibold text-destructive"
                                : "max-w-md text-sm font-semibold text-warning"
                        }
                    >
                        {companyPaused ? rk("paused.companyBanner") : rk("paused.banner")}
                    </div>
                    {reason ? <div className="text-xs text-muted-foreground">{reason}</div> : null}
                    <button
                        type="button"
                        className="text-sm text-primary underline"
                        onClick={() => sessionApi.navigate("/tenancy/systemSettings/posconfigs")}
                    >
                        {rk("backToConfigs")}
                    </button>
                </div>
            );
        }
        return (
            <PosOpenSessionDialog
                open={sessionApi.openSessionOpen}
                configName={sessionApi.config?.name}
                openingBalance={sessionApi.openingBalance}
                openingNotes={sessionApi.openingNotes}
                openingBusy={sessionApi.openingBusy}
                rk={rk}
                onOpeningBalanceChange={sessionApi.setOpeningBalance}
                onOpeningNotesChange={sessionApi.setOpeningNotes}
                onSubmit={() => void sessionApi.openSession()}
                onCancel={() => sessionApi.navigate("/tenancy/systemSettings/posconfigs")}
            />
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
            <PosTillHeader
                config={sessionApi.config}
                session={sessionApi.session}
                money={money}
                rk={rk}
                ifaceCashControl={!!sessionApi.config?.ifaceCashControl}
                isPaused={tillPaused}
                onInfo={() => sessionApi.setInfoOpen(true)}
                onHeld={() => void cartApi.openHeldList()}
                onOrders={() => void sessionApi.openSessionOrders()}
                onCashIn={() => sessionApi.setCashMoveOpen("in")}
                onCashOut={() => sessionApi.setCashMoveOpen("out")}
                onCloseSession={sessionApi.openCloseSession}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row print:hidden">
                <PosCatalogPanel
                    search={catalogApi.search}
                    barcode={catalogApi.barcode}
                    barcodeRef={barcodeRef}
                    categories={catalogApi.categories}
                    categoryId={catalogApi.categoryId}
                    catalog={catalogApi.catalog}
                    catalogLoading={catalogApi.catalogLoading}
                    cart={cartApi.cart}
                    flashKey={cartApi.flashKey}
                    config={sessionApi.config}
                    money={money}
                    rk={rk}
                    onSearchChange={catalogApi.setSearch}
                    onBarcodeChange={catalogApi.setBarcode}
                    onBarcodeEnter={() => void catalogApi.handleBarcodeEnter()}
                    onCategoryChange={catalogApi.setCategoryId}
                    onPickProduct={catalogApi.pickProduct}
                />

                <PosCartPanel
                    cart={cartApi.cart}
                    cartScrollRef={cartApi.cartScrollRef}
                    heldOrderId={cartApi.heldOrderId}
                    itemCount={cartApi.itemCount}
                    total={cartApi.total}
                    subtotal={cartApi.subtotal}
                    orderDiscountPercent={cartApi.orderDiscountPercent}
                    orderDiscountAmount={cartApi.orderDiscountAmount}
                    shareTotal={paymentsApi.shareTotal}
                    itemsSplitActive={paymentsApi.itemsSplitActive}
                    splitSelection={paymentsApi.splitSelection}
                    selectedLineKey={cartApi.selectedLineKey}
                    showLineDiscount={cartApi.showLineDiscount}
                    showCustomer={cartApi.showCustomer}
                    showPayment={paymentsApi.showPayment}
                    customerName={cartApi.customerName}
                    customerId={cartApi.customerId}
                    payments={paymentsApi.payments}
                    paymentMethods={paymentsApi.paymentMethods}
                    activePaymentId={paymentsApi.activePaymentId}
                    activePayment={paymentsApi.activePayment}
                    cashQuickAmounts={paymentsApi.cashQuickAmounts}
                    remaining={paymentsApi.remaining}
                    change={paymentsApi.change}
                    canPay={!tillPaused && paymentsApi.canPay}
                    paying={paymentsApi.paying}
                    payArmed={paymentsApi.payArmed}
                    payArmSecondsLeft={paymentsApi.payArmSecondsLeft}
                    usesTerminal={paymentsApi.usesTerminal}
                    payableTotal={paymentsApi.payableTotal}
                    holdBusy={cartApi.holdBusy || tillPaused}
                    allowDiscount={!tillPaused && !!sessionApi.config?.allowDiscount}
                    allowQuantityChange={!tillPaused && sessionApi.config?.allowQuantityChange !== false}
                    money={money}
                    rk={rk}
                    onToggleLineDiscount={() => !tillPaused && void cartApi.toggleLineDiscount()}
                    onToggleCustomer={() => cartApi.setShowCustomer((v) => !v)}
                    onTogglePayment={() => !tillPaused && paymentsApi.setShowPayment((v) => !v)}
                    onOpenSplit={() => !tillPaused && paymentsApi.setSplitOpen(true)}
                    onHold={() => !tillPaused && void cartApi.holdCart()}
                    onClearOrder={cartApi.clearOrder}
                    onCancelItemsSplit={paymentsApi.cancelItemsSplit}
                    onSelectLine={cartApi.setSelectedLineKey}
                    onBumpSplitQty={paymentsApi.bumpSplitQty}
                    onUpdateLineQty={cartApi.updateLineQty}
                    onSetLineQty={cartApi.setLineQty}
                    onSetLineDiscount={(key, n) => void cartApi.setLineDiscount(key, n)}
                    onRemoveLine={cartApi.removeLine}
                    onCustomerLabelChange={cartApi.setCustomerName}
                    onCustomerSelect={(hit) => {
                        if (!hit) {
                            cartApi.setCustomerId(null);
                            return;
                        }
                        cartApi.setCustomerId(hit._id);
                        cartApi.setCustomerName(hit.label);
                    }}
                    onOrderDiscountChange={(n) => void cartApi.setOrderDiscount(n)}
                    onAddPaymentMethod={paymentsApi.addPaymentMethod}
                    onActivePaymentIdChange={paymentsApi.setActivePaymentId}
                    onUpdatePaymentAmount={paymentsApi.updatePaymentAmount}
                    onRemovePayment={paymentsApi.removePayment}
                    onBumpPaymentAmount={paymentsApi.bumpPaymentAmount}
                    onSetExactPayment={paymentsApi.setExactPayment}
                    onRequestPay={() => !tillPaused && paymentsApi.requestPay()}
                />
            </div>

            <PosTillDialogs
                rk={rk}
                money={money}
                session={sessionApi.session}
                splitOpen={paymentsApi.splitOpen}
                onSplitOpenChange={paymentsApi.setSplitOpen}
                splitMode={paymentsApi.splitMode}
                onSplitModeChange={paymentsApi.setSplitMode}
                splitGuests={paymentsApi.splitGuests}
                onSplitGuestsChange={paymentsApi.setSplitGuests}
                equalPerPerson={paymentsApi.equalPerPerson}
                total={cartApi.total}
                onApplyEqualSplit={paymentsApi.applyEqualSplit}
                onStartItemsSplit={paymentsApi.startItemsSplit}
                cashMoveOpen={sessionApi.cashMoveOpen}
                onCashMoveOpenChange={(open) => !open && sessionApi.setCashMoveOpen(null)}
                cashMoveAmount={sessionApi.cashMoveAmount}
                onCashMoveAmountChange={sessionApi.setCashMoveAmount}
                cashMoveReason={sessionApi.cashMoveReason}
                onCashMoveReasonChange={sessionApi.setCashMoveReason}
                cashMoveBusy={sessionApi.cashMoveBusy}
                onSubmitCashMove={() => void sessionApi.submitCashMove()}
                onCancelCashMove={() => sessionApi.setCashMoveOpen(null)}
                closeOpen={sessionApi.closeOpen}
                onCloseOpenChange={sessionApi.setCloseOpen}
                closingBalance={sessionApi.closingBalance}
                onClosingBalanceChange={sessionApi.setClosingBalance}
                closingNotes={sessionApi.closingNotes}
                onClosingNotesChange={sessionApi.setClosingNotes}
                differenceReason={sessionApi.differenceReason}
                onDifferenceReasonChange={sessionApi.setDifferenceReason}
                closeBusy={sessionApi.closeBusy}
                recon={sessionApi.recon}
                onLoadReconciliation={(n) => void sessionApi.loadReconciliation(n)}
                onCloseSession={() => void sessionApi.closeSession()}
                infoOpen={sessionApi.infoOpen}
                onInfoOpenChange={sessionApi.setInfoOpen}
                heldOpen={cartApi.heldOpen}
                onHeldOpenChange={cartApi.setHeldOpen}
                heldBusy={cartApi.heldBusy}
                heldOrders={cartApi.heldOrders}
                onResumeHeld={cartApi.resumeHeld}
                onDiscardHeld={(id) => void cartApi.discardHeld(id)}
                ordersOpen={sessionApi.ordersOpen}
                onOrdersOpenChange={sessionApi.setOrdersOpen}
                ordersBusy={sessionApi.ordersBusy}
                sessionOrders={sessionApi.sessionOrders}
                onRefundOrder={(order) => {
                    sessionApi.setRefundOrder(order);
                    sessionApi.setOrdersOpen(false);
                }}
                onReprintOrder={(id) => void sessionApi.reprintOrder(id)}
                receiptOpen={sessionApi.receiptOpen}
                onReceiptOpenChange={sessionApi.setReceiptOpen}
                receipt={sessionApi.receipt}
                onReceiptNewOrder={() => {
                    sessionApi.setReceiptOpen(false);
                    focusBarcode();
                }}
                onPrintReceipt={sessionApi.printReceipt}
                pinOpen={pin.pinOpen}
                pinBusy={pin.pinBusy}
                pinTitle={pin.pinTitle}
                pinManagers={pin.pinManagers}
                onPinOpenChange={pin.onPinDialogOpenChange}
                onPinConfirm={pin.onPinConfirm}
                variantProduct={catalogApi.variantProduct}
                onVariantClose={() => catalogApi.setVariantProduct(null)}
                allowOversell={!!sessionApi.config?.allowOversell}
                onVariantPick={(variantId, price, label, stockQty, trackInventory) => {
                    if (!catalogApi.variantProduct) return;
                    const variant = (catalogApi.variantProduct.variants ?? []).find((v) => v._id === variantId);
                    cartApi.addCartLine(catalogApi.variantProduct, 1, {
                        _id: variantId,
                        label,
                        price,
                        sku: variant?.sku,
                        barcode: variant?.barcode,
                        stockQty: stockQty ?? variant?.stockQty,
                        trackInventory: trackInventory ?? variant?.trackInventory,
                    });
                    catalogApi.setVariantProduct(null);
                }}
                refundOrder={sessionApi.refundOrder}
                requireRefundPin={!!sessionApi.config?.pinForRefund && !!sessionApi.config?.hasManagerPin}
                onRequestRefundAuth={async () => {
                    const auth = await pin.resolveManagerPin(true, "pin.refund");
                    if (!auth) return null;
                    return {managerPin: auth.pin, managerId: auth.managerId};
                }}
                onRefundOpenChange={(open) => {
                    if (!open) sessionApi.setRefundOrder(null);
                }}
                onRefunded={() => {
                    sessionApi.setRefundOrder(null);
                    void sessionApi.openSessionOrders();
                }}
            />
        </div>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/pos/index.tsx"),
    withDebug(true, true),
)(PosTill);
