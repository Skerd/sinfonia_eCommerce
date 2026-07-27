import withLanguage, {type ResolveLanguageKey, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {type ComponentType, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {LoaderCircle, PackageMinus, PackagePlus} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@coreModule/components/ui/alert-dialog.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Textarea} from "@coreModule/components/ui/textarea.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";

function bindAxiosLanguageKey(resolveLanguageKey: ResolveLanguageKey, prefix: "restock" | "deduct"): ResolveLanguageKey {
    return (key, returnUndefinedIfNeeded = false) => {
        if (key.startsWith("axios.")) {
            return resolveLanguageKey(`${prefix}.${key}`, returnUndefinedIfNeeded);
        }
        return resolveLanguageKey(key, returnUndefinedIfNeeded);
    };
}

export type InventoryStockMoveMode = "restock" | "deduct";

type InventoryStockMoveActionPublicProps = {
    inventoryId: string;
    displayName?: string;
    mode: InventoryStockMoveMode;
    openAlert?: boolean;
    url?: string;
    resolveLanguageKey: ResolveLanguageKey;
    onSuccess?: (updated?: Inventory) => void;
    onCancel?: () => void;
};

type InventoryStockMoveActionProps = WithAxiosType<Inventory> & InventoryStockMoveActionPublicProps;

function InventoryStockMoveAction({
    inventoryId,
    displayName,
    mode,
    openAlert,
    resolveLanguageKey,
    innerRef,
    onFilterChange,
    onSuccess = () => {},
    onCancel = () => {},
    loading,
}: InventoryStockMoveActionProps) {
    const {write} = useAccess("inventories");
    const [open, setOpen] = useState<boolean>(!!openAlert);
    const [quantity, setQuantity] = useState("");
    const [manufacturer, setManufacturer] = useState("");
    const [receiptNumber, setReceiptNumber] = useState("");
    const [occurredAt, setOccurredAt] = useState("");
    const [unitCost, setUnitCost] = useState("");
    const [batchLot, setBatchLot] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [note, setNote] = useState("");
    const [receiptFiles, setReceiptFiles] = useState<File[]>([]);

    const prefix = mode;
    const ConfirmIcon = mode === "restock" ? PackagePlus : PackageMinus;

    useImperativeHandle(innerRef, () => ({
        success: (response?: Inventory) => {
            setOpen(false);
            onSuccess(response);
        },
    }));

    useEffect(() => {
        if (!write) return;
        setOpen(!!openAlert);
    }, [openAlert, write]);

    useEffect(() => {
        if (open) {
            setQuantity("");
            setManufacturer("");
            setReceiptNumber("");
            setOccurredAt(new Date().toISOString().slice(0, 16));
            setUnitCost("");
            setBatchLot("");
            setExpiryDate("");
            setNote("");
            setReceiptFiles([]);
        }
    }, [open]);

    useEffect(() => {
        if (!open) onCancel();
    }, [open, onCancel]);

    if (!write) return <HiddenElement />;

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent
                className="max-w-2xl sm:max-w-2xl data-[size=default]:max-w-2xl data-[size=default]:sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {resolveLanguageKey(`${prefix}.title`)}
                        {displayName ? ` — ${displayName}` : ""}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{resolveLanguageKey(`${prefix}.description`)}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2 space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="stockQty">{resolveLanguageKey(`${prefix}.quantityLabel`)}</Label>
                        <Input
                            id="stockQty"
                            type="number"
                            min={1}
                            step={1}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="stockManufacturer">{resolveLanguageKey(`${prefix}.manufacturerLabel`)}</Label>
                            <Input
                                id="stockManufacturer"
                                value={manufacturer}
                                onChange={(e) => setManufacturer(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="stockReceiptNumber">{resolveLanguageKey(`${prefix}.receiptNumberLabel`)}</Label>
                            <Input
                                id="stockReceiptNumber"
                                value={receiptNumber}
                                onChange={(e) => setReceiptNumber(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="stockOccurredAt">{resolveLanguageKey(`${prefix}.occurredAtLabel`)}</Label>
                            <Input
                                id="stockOccurredAt"
                                type="datetime-local"
                                value={occurredAt}
                                onChange={(e) => setOccurredAt(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="stockUnitCost">{resolveLanguageKey(`${prefix}.unitCostLabel`)}</Label>
                            <Input
                                id="stockUnitCost"
                                type="number"
                                min={0}
                                step="0.01"
                                value={unitCost}
                                onChange={(e) => setUnitCost(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="stockBatchLot">{resolveLanguageKey(`${prefix}.batchLotLabel`)}</Label>
                            <Input
                                id="stockBatchLot"
                                value={batchLot}
                                onChange={(e) => setBatchLot(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="stockExpiry">{resolveLanguageKey(`${prefix}.expiryDateLabel`)}</Label>
                            <Input
                                id="stockExpiry"
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="stockReceipts">{resolveLanguageKey(`${prefix}.receiptsLabel`)}</Label>
                        <Input
                            id="stockReceipts"
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            disabled={loading}
                            onChange={(e) => setReceiptFiles(Array.from(e.target.files ?? []))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="stockNote">{resolveLanguageKey(`${prefix}.noteLabel`)}</Label>
                        <Textarea
                            id="stockNote"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={loading}
                            rows={3}
                        />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{resolveLanguageKey("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading || !quantity || Number(quantity) <= 0}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const occurredIso = occurredAt ? new Date(occurredAt).toISOString() : undefined;
                            onFilterChange({
                                _id: inventoryId,
                                quantity: Number(quantity),
                                manufacturer: manufacturer || undefined,
                                receiptNumber: receiptNumber || undefined,
                                occurredAt: occurredIso,
                                unitCost: unitCost !== "" ? Number(unitCost) : undefined,
                                batchLot: batchLot || undefined,
                                expiryDate: expiryDate || undefined,
                                note: note || undefined,
                                receipts: receiptFiles.length ? receiptFiles : undefined,
                            });
                        }}
                    >
                        {loading ? <LoaderCircle className="size-4 animate-spin" /> : <ConfirmIcon size={16} />}
                        {resolveLanguageKey(`${prefix}.confirm`)}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const InventoryStockMoveActionWithAxios = compose(
    withAxios<Inventory, Record<string, unknown>>(
        {
            method: "POST",
            url: "toBeDeterminedByProp",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(InventoryStockMoveAction) as ComponentType<InventoryStockMoveActionPublicProps>;

type ShellProps = WithLanguageType & Omit<InventoryStockMoveActionPublicProps, "resolveLanguageKey">;

function InventoryStockMoveActionShell({resolveLanguageKey, mode, ...rest}: ShellProps) {
    const boundResolveLanguageKey = useMemo(
        () => bindAxiosLanguageKey(resolveLanguageKey, mode),
        [resolveLanguageKey, mode],
    );

    return (
        <InventoryStockMoveActionWithAxios
            {...rest}
            mode={mode}
            resolveLanguageKey={boundResolveLanguageKey}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/inventories/inventoryStockMoveAction.tsx"),
    withDebug(true, true),
)(InventoryStockMoveActionShell);
