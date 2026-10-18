import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {compose} from "redux";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {LoaderCircle, Milestone} from "lucide-react";
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
import type {ActionMessage} from "armonia/src/modules/core/types/shared.types.ts";
import type {CreateOrderMilestoneFormType} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/orderMilestone/orderMilestone.schema-def.ts";

type CreateMilestoneActionProps = WithLanguageType & WithAxiosType<ActionMessage, CreateOrderMilestoneFormType> & {
    orderId: string;
    displayName?: string;
    onSuccess: () => void;
    onCancel: () => void;
};

/** The customer splits an accepted order's escrow into a named milestone (in the order's currency). */
function CreateMilestoneAction({
    orderId,
    displayName,
    resolveLanguageKey,
    innerRef,
    onPost,
    onSuccess,
    onCancel,
    loading,
}: CreateMilestoneActionProps) {
    const [open, setOpen] = useState(true);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");

    useImperativeHandle(innerRef, () => ({
        success: () => {
            setOpen(false);
            onSuccess();
        },
    }));

    useEffect(() => {
        if (!open) onCancel();
    }, [open, onCancel]);

    const amountNum = Number(amount);
    const canSubmit = name.trim().length > 0 && amount !== "" && Number.isFinite(amountNum) && amountNum > 0;

    return (
        <AlertDialog open={open} onOpenChange={(next) => !loading && setOpen(next)}>
            <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {resolveLanguageKey("title")}
                        {displayName ? ` — ${displayName}` : ""}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{resolveLanguageKey("description")}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-y-4 py-4">
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="milestoneName">{resolveLanguageKey("nameLabel")}</Label>
                        <Input id="milestoneName" value={name} maxLength={200} onChange={(e) => setName(e.target.value)} disabled={loading} />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <Label htmlFor="milestoneAmount">{resolveLanguageKey("amountLabel")}</Label>
                        <Input id="milestoneAmount" type="number" min={0} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={loading} />
                        <p className="text-xs text-muted-foreground">{resolveLanguageKey("amountHint")}</p>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{resolveLanguageKey("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading || !canSubmit}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onPost({order: orderId, name: name.trim(), amount: amountNum});
                        }}
                    >
                        {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Milestone size={16} className="text-primary" />}
                        {resolveLanguageKey("confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/components/custom/orders/createMilestoneAction.tsx"),
    withAxios({method: "post", url: "/api/eCommerceMarketplace/order/createMilestone", data: {}}, true),
    withDebug(true, true, "orders"),
)(CreateMilestoneAction);
