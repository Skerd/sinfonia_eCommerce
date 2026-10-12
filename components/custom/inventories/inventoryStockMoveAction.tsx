import withLanguage, {type ResolveLanguageKey, type ResolveLanguageKeyImpl, WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@coreModule/components/ui/select.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import MultiLocalFilePicker from "@coreModule/components/viewEngine/widgets/media/multiLocalFilePicker.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import {INVENTORY_MOVEMENT_RECEIPT_MAX} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventoryMovement/inventoryMovement.schema-def.ts";
import type {Inventory} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/inventory.dto.ts";
import {inventoryDeductReasons, type DeductInventoryFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/inventory/deductInventory.form.validator.ts";

function bindAxiosLanguageKey(resolveLanguageKey: ResolveLanguageKey, prefix: "restock" | "deduct"): ResolveLanguageKeyImpl {
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
    onFormDataChange,
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
    const [deductReason, setDeductReason] = useState<NonNullable<DeductInventoryFormType["reason"]>>("write_off");
    const [receiptFiles, setReceiptFiles] = useState<File[]>([]);

    const prefix = mode;
    const isRestock = mode === "restock";
    const ConfirmIcon = isRestock ? PackagePlus : PackageMinus;

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
            setDeductReason("write_off");
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
                className={
                    isRestock
                        ? "max-w-2xl sm:max-w-2xl data-[size=default]:max-w-2xl data-[size=default]:sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6"
                        : "max-w-md sm:max-w-md data-[size=default]:max-w-md data-[size=default]:sm:max-w-md max-h-[90vh] overflow-y-auto p-6"
                }
                onClick={(e) => e.stopPropagation()}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {resolveLanguageKey(`${prefix}.title`)}
                        {displayName ? ` — ${displayName}` : ""}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{resolveLanguageKey(`${prefix}.description`)}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col py-2 gap-y-3">
                    <div className="flex flex-col gap-y-1.5">
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
                    {isRestock && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-y-1.5">
                                    <Label htmlFor="stockManufacturer">{resolveLanguageKey(`${prefix}.manufacturerLabel`)}</Label>
                                    <Input
                                        id="stockManufacturer"
                                        value={manufacturer}
                                        onChange={(e) => setManufacturer(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-y-1.5">
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
                                <div className="flex flex-col gap-y-1.5">
                                    <Label htmlFor="stockOccurredAt">{resolveLanguageKey(`${prefix}.occurredAtLabel`)}</Label>
                                    <Input
                                        id="stockOccurredAt"
                                        type="datetime-local"
                                        value={occurredAt}
                                        onChange={(e) => setOccurredAt(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-y-1.5">
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
                                <div className="flex flex-col gap-y-1.5">
                                    <Label htmlFor="stockBatchLot">{resolveLanguageKey(`${prefix}.batchLotLabel`)}</Label>
                                    <Input
                                        id="stockBatchLot"
                                        value={batchLot}
                                        onChange={(e) => setBatchLot(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex flex-col gap-y-1.5">
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
                        </>
                    )}
                    {!isRestock && (
                        <div className="flex flex-col gap-y-1.5">
                            <Label>{resolveLanguageKey(`${prefix}.reasonLabel`)}</Label>
                            <Select
                                value={deductReason}
                                onValueChange={(value) => setDeductReason(value as typeof deductReason)}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {inventoryDeductReasons.map((reason) => (
                                        <SelectItem key={reason} value={reason}>
                                            {resolveLanguageKey(`${prefix}.reasons.${reason}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {!isRestock && (
                        <div className="flex flex-col gap-y-1.5">
                            <Label htmlFor="stockBatchLot">{resolveLanguageKey(`${prefix}.batchLotLabel`)}</Label>
                            <Input
                                id="stockBatchLot"
                                value={batchLot}
                                onChange={(e) => setBatchLot(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-y-1.5">
                        <Label>{resolveLanguageKey(`${prefix}.receiptsLabel`)}</Label>
                        <MultiLocalFilePicker
                            files={receiptFiles}
                            onFilesChange={setReceiptFiles}
                            resolveLanguageKey={resolveLanguageKey}
                            disabled={loading}
                            maxFiles={INVENTORY_MOVEMENT_RECEIPT_MAX}
                            accept="image/*,.pdf"
                            addFileKey="addFile"
                            filesSelectedKey="filesSelected"
                        />
                    </div>
                    <div className="flex flex-col gap-y-1.5">
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
                            const payload = isRestock
                                ? {
                                    _id: inventoryId,
                                    quantity: Number(quantity),
                                    manufacturer: manufacturer || undefined,
                                    receiptNumber: receiptNumber || undefined,
                                    occurredAt: occurredAt ? new Date(occurredAt).toISOString() : undefined,
                                    unitCost: unitCost !== "" ? Number(unitCost) : undefined,
                                    batchLot: batchLot || undefined,
                                    expiryDate: expiryDate || undefined,
                                    note: note || undefined,
                                }
                                : {
                                    _id: inventoryId,
                                    quantity: Number(quantity),
                                    reason: deductReason,
                                    batchLot: batchLot || undefined,
                                    note: note || undefined,
                                };
                            if (receiptFiles.length === 0) {
                                onFormDataChange(payload);
                                return;
                            }
                            const formData = new FormData();
                            formData.append("data", JSON.stringify(payload));
                            receiptFiles.forEach((file) => formData.append("receipts", file));
                            onFormDataChange(formData);
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
    withDebug(true, true, "inventories"),
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
    withDebug(true, true, "inventories"),
)(InventoryStockMoveActionShell);
