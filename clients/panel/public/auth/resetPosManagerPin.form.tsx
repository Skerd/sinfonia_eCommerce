import {useEffect, useImperativeHandle, useState} from "react";
import {compose} from "redux";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useNavigate, useParams} from "react-router-dom";
import {CircleCheckBig, CircleX, Loader2, ShieldAlert} from "lucide-react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@coreModule/components/ui/form.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import GoBackToLogin from "@coreModule/clients/panel/public/auth/shared/goBackToLogin.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import {resetManagerPinFormSchema} from "armonia/src/modules/eCommerce/api/eCommerce/private/posConfig/resetManagerPin.form.validator.ts";

type FormValues = {
    resetCode: string;
    pin: string;
    confirmPin: string;
};

type Props = WithLanguageType & WithAxiosType<{message?: string}, FormValues>;

function ResetPosManagerPinForm({
    onFilterChange = () => {},
    innerRef,
    languageCode,
    resolveLanguageKey,
    loading,
}: Props) {
    const navigate = useNavigate();
    const params = useParams();
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const formSchema = resetManagerPinFormSchema(languageCode, resolveLanguageKey("form"));
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {resetCode: "", pin: "", confirmPin: ""},
    });

    useEffect(() => {
        const code = params.platform;
        if (!code) {
            navigate("/authenticate/login");
            return;
        }
        setVerifying(true);
        setVerifyError(false);
        apiClient
            .post("/api/eCommerce/posConfig/openManagerPinResetLink", {resetCode: code})
            .then(() => {
                form.setValue("resetCode", code);
                setVerifying(false);
            })
            .catch(() => {
                setVerifying(false);
                setVerifyError(true);
            });
    }, [params.platform]);

    useImperativeHandle(innerRef, () => ({
        start: () => {},
        success: () => setSuccess(true),
        error: () => setError(true),
    }));

    if (verifying) {
        return (
            <Card className="gap-4 w-full h-fit">
                <CardHeader className="flex flex-col items-center justify-center text-center">
                    <ShieldAlert size={30} className="animate-pulse text-success" />
                    <CardTitle className="text-lg tracking-tight">
                        {resolveLanguageKey("verifyingTitle")}
                    </CardTitle>
                    <CardDescription>{resolveLanguageKey("verifyingDescription")}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <GoBackToLogin />
                </CardFooter>
            </Card>
        );
    }

    if (verifyError) {
        return (
            <Card className="gap-4 w-full h-fit">
                <CardHeader className="flex flex-col items-center justify-center text-center">
                    <CircleX size={30} className="text-destructive" />
                    <CardTitle className="text-lg tracking-tight">
                        {resolveLanguageKey("invalidTitle")}
                    </CardTitle>
                    <CardDescription>{resolveLanguageKey("invalidDescription")}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <GoBackToLogin />
                </CardFooter>
            </Card>
        );
    }

    if (success) {
        return (
            <Card className="gap-4 w-full h-fit">
                <CardHeader className="flex flex-col items-center justify-center text-center">
                    <CircleCheckBig size={30} className="text-success" />
                    <CardTitle className="text-lg tracking-tight">
                        {resolveLanguageKey("successTitle")}
                    </CardTitle>
                    <CardDescription>{resolveLanguageKey("successDescription")}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <GoBackToLogin />
                </CardFooter>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="gap-4 w-full h-fit">
                <CardHeader className="flex flex-col items-center justify-center text-center">
                    <CircleX size={30} className="text-destructive" />
                    <CardTitle className="text-lg tracking-tight">
                        {resolveLanguageKey("errorTitle")}
                    </CardTitle>
                    <CardDescription>{resolveLanguageKey("errorDescription")}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-2">
                    <Button type="button" variant="outline" onClick={() => setError(false)}>
                        {resolveLanguageKey("tryAgain")}
                    </Button>
                    <GoBackToLogin />
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="gap-4 w-full h-fit">
            <CardHeader>
                <CardTitle className="text-lg tracking-tight">{resolveLanguageKey("title")}</CardTitle>
                <CardDescription>{resolveLanguageKey("description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit((data) => onFilterChange(data))}
                    >
                        <FormField
                            control={form.control}
                            name="pin"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{resolveLanguageKey("form.pinLabel")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            inputMode="numeric"
                                            autoComplete="new-password"
                                            className="tracking-[0.35em]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPin"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{resolveLanguageKey("form.confirmPinLabel")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            inputMode="numeric"
                                            autoComplete="new-password"
                                            className="tracking-[0.35em]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : null}
                            {resolveLanguageKey("submit")}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter>
                <GoBackToLogin />
            </CardFooter>
        </Card>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/public/auth/resetPosManagerPin.form.tsx"),
    withAxios<{message?: string}, FormValues>(
        {url: "/api/eCommerce/posConfig/resetManagerPin", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(ResetPosManagerPinForm);
