import {useImperativeHandle} from "react";
import {compose} from "redux";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@coreModule/components/ui/form.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@coreModule/components/ui/dialog.tsx";
import type {PosOrder} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/posOrder.dto.ts";
import {
    recordPosOrderFiscalCodesFormSchema,
    type RecordPosOrderFiscalCodesFormType,
} from "armonia/src/modules/eCommerce/api/eCommerce/private/posOrder/resolvePosOrderFiscal.form.validator.ts";
import {Alert, AlertDescription} from "@coreModule/components/ui/alert.tsx";

/** Maestro wraps the action's return as `{ data: { order } }`. */
type RecordAxiosBody = {data: {order: PosOrder}};

type Props = WithLanguageType &
    WithAxiosType<RecordAxiosBody, RecordPosOrderFiscalCodesFormType> & {
        open: boolean;
        onClose: () => void;
        entity: Pick<PosOrder, "_id" | "name">;
        onSuccess?: (order: PosOrder) => void;
    };

const CODE_FIELDS = ["nslf", "nivf", "eic"] as const;

/** "Record CIS codes" (D98): the NSLF and NIVF (and the EIC, if any) staff found for the sale in the CIS portal. */
function RecordPosOrderFiscalCodesDialog({
    open,
    onClose,
    entity,
    resolveLanguageKey,
    languageCode,
    onFilterChange,
    innerRef,
    loading,
    onSuccess,
    error,
}: Props) {
    const form = useForm({
        resolver: zodResolver(recordPosOrderFiscalCodesFormSchema(languageCode, resolveLanguageKey("form"))),
        defaultValues: {_id: entity._id, nslf: "", nivf: "", eic: undefined},
    });

    useImperativeHandle(innerRef, () => ({
        success: ({data}: RecordAxiosBody) => {
            onSuccess?.(data.order);
            onClose();
        },
    }));

    return (
        <Dialog open={open} onOpenChange={(next) => !loading && !next && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {resolveLanguageKey("title")}
                        {entity.name ? ` — ${entity.name}` : ""}
                    </DialogTitle>
                    <DialogDescription>{resolveLanguageKey("description")}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id="record-pos-order-fiscal-codes"
                        className="flex flex-col gap-4 px-1 py-2"
                        onSubmit={form.handleSubmit((values) => onFilterChange(values))}
                    >
                        {CODE_FIELDS.map((name) => (
                            <FormField
                                key={name}
                                control={form.control}
                                name={name}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{resolveLanguageKey(`form.${name}Label`)}</FormLabel>
                                        <FormControl>
                                            <Input
                                                name={field.name}
                                                ref={field.ref}
                                                onBlur={field.onBlur}
                                                // A blank optional EIC is left out rather than sent as an empty code
                                                value={typeof field.value === "string" ? field.value : ""}
                                                onChange={(e) => field.onChange(e.target.value === "" && name === "eic" ? undefined : e.target.value)}
                                                placeholder={String(resolveLanguageKey(`${name}Placeholder`))}
                                                autoComplete="off"
                                                spellCheck={false}
                                                className="font-mono"
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormDescription>{resolveLanguageKey(`${name}Hint`)}</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </form>
                </Form>
                {error ? (
                    <Alert variant="destructive" className="mx-4 w-auto">
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                ) : null}
                <DialogFooter className="gap-2 px-4 py-4 sm:gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        {resolveLanguageKey("cancel")}
                    </Button>
                    <Button type="submit" form="record-pos-order-fiscal-codes" disabled={loading}>
                        {loading ? resolveLanguageKey("busy") : resolveLanguageKey("confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posOrders/center/dialogs/recordPosOrderFiscalCodesDialog.tsx"),
    withAxios<RecordAxiosBody, RecordPosOrderFiscalCodesFormType>(
        {url: "/api/eCommerce/posOrder/recordFiscalCodes", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true, "posOrders"),
)(RecordPosOrderFiscalCodesDialog);
