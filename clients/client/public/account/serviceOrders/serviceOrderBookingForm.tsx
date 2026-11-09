import {useState} from "react";
import {compose} from "redux";
import {useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {toast} from "sonner";
import dayjs from "dayjs";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import type {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {DateInput} from "@coreModule/components/custom/inputs/dateInput.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@coreModule/components/ui/form.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {createBookingFormSchema} from "armonia/src/modules/eCommerce/api/eCommerceMarketplace/private/booking/createBooking.form.validator.ts";

const LANGUAGE_PATH = "src/modules/eCommerce/clients/client/public/account/serviceOrders/serviceOrderBookingForm.tsx";

const BOOK_REQUEST: HttpRequest = {method: "PUT", url: "/api/eCommerceMarketplace/booking/createMine"};
/** With a time token, DateInput emits ISO instants for the wall clock picked in `timeZone`. */
const VALUE_FORMAT = "YYYY-MM-DD[T]HH:mm";

type ServiceOrderBookingFormProps = WithLanguageType & {
    orderId: string;
    onBooked: () => void;
    onCancel: () => void;
};

/** The buyer schedules the session of their own active services order; the server checks the order's state. */
function ServiceOrderBookingForm({orderId, onBooked, onCancel, languageCode, resolveLanguageKey, resolveLanguageValue}: ServiceOrderBookingFormProps) {
    const profileTimeZone = useSelector((state: RootState) => state.authentication.user?.timezone);
    const timeZone = profileTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formSchema = createBookingFormSchema(languageCode, resolveLanguageValue("form"));
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {order: orderId, startAt: "", endAt: "", timezone: timeZone},
    });
    const [startAt, endAt] = form.watch(["startAt", "endAt"]);
    const today = dayjs().format("YYYY-MM-DD");

    const [submission, setSubmission] = useState<{body: Record<string, unknown>; count: number}>({body: {}, count: 0});
    const {loading} = useHttpRequest(BOOK_REQUEST, submission.body, submission.count, true, {
        success: () => {
            toast.success(resolveLanguageKey("booked"));
            onBooked();
        },
        error: (err) => handleError(err, {context: "ServiceOrderBooking", showToast: true, fallbackMessage: resolveLanguageKey("bookError")}),
    });

    const submit = form.handleSubmit((values) => setSubmission((current) => ({body: values, count: current.count + 1})));

    return (
        <Form {...form}>
            <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl bg-muted p-5" aria-labelledby="shop-service-booking">
                <p id="shop-service-booking" className="font-semibold">{resolveLanguageKey("title")}</p>
                <p className="text-sm text-muted-foreground">{resolveLanguageKey("message").replace("{zone}", timeZone)}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                    {(["startAt", "endAt"] as const).map((name) => (
                        <FormField
                            key={name}
                            control={form.control}
                            name={name}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{resolveLanguageKey(`form.${name}Label`)}</FormLabel>
                                    <FormControl>
                                        <DateInput
                                            valueFormat={VALUE_FORMAT}
                                            timeZone={timeZone}
                                            minDate={today}
                                            value={typeof field.value === "string" ? field.value : ""}
                                            onChange={field.onChange}
                                            placeholder={resolveLanguageKey(`form.${name}Placeholder`)}
                                            disabled={loading}
                                            className="bg-card"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button size="lg" type="submit" disabled={loading || !startAt || !endAt}>
                        {resolveLanguageKey(loading ? "working" : "submit")}
                    </Button>
                    <Button variant="outline" size="lg" type="button" disabled={loading} onClick={onCancel}>
                        {resolveLanguageKey("back")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default compose(
    withLanguage(LANGUAGE_PATH),
    withDebug(true, true),
)(ServiceOrderBookingForm);
