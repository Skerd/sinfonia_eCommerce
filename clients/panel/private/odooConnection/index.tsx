import {useEffect, useState, type FormEvent} from "react";
import {compose} from "redux";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Input} from "@coreModule/components/ui/input.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Card, CardContent, CardFooter} from "@coreModule/components/ui/card.tsx";
import type {OdooConnection, OdooConnectionTestResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/odooConnection/odooConnection.dto.ts";
import type {SaveOdooConnectionFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/odooConnection/odooConnection.schema-def.ts";

const CONNECTION_REQUEST: HttpRequest = {method: "GET", url: "/api/eCommerce/odooConnection"};
const SAVE_REQUEST: HttpRequest = {method: "PUT", url: "/api/eCommerce/odooConnection"};
const TEST_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/odooConnection/test"};

function OdooConnectionPage({resolveLanguageKey}: WithLanguageType) {
    const {read, write} = useAccess("odooconnections");
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const [url, setUrl] = useState("");
    const [database, setDatabase] = useState("");
    const [username, setUsername] = useState("");
    const [apiKeyEncrypted, setApiKeyEncrypted] = useState("");
    const [hasApiKey, setHasApiKey] = useState(false);
    function formBody(): SaveOdooConnectionFormType {
        return {
            url: url.trim(),
            database: database.trim(),
            username: username.trim(),
            apiKeyEncrypted: apiKeyEncrypted.trim() || undefined,
        };
    }

    const [loadCount, setLoadCount] = useState(0);
    useEffect(() => {
        if (read) setLoadCount((count) => count + 1);
    }, [read]);
    const connectionRequest = useHttpRequest<{data: OdooConnection | null}>(CONNECTION_REQUEST, {}, loadCount, true, {
        success: (response) => {
            const connection = response.data;
            if (connection) {
                setUrl(connection.url);
                setDatabase(connection.database);
                setUsername(connection.username);
                setHasApiKey(connection.hasApiKey);
            }
        },
        error: (error) => handleError(error, {showToast: true, fallbackMessage: String(resolveLanguageKey("loadError") ?? "loadError")}),
    });
    // Shows the loader until the first load settles, as before.
    const loading = loadCount === 0 || connectionRequest.loading;

    const [saveCount, setSaveCount] = useState(0);
    const {loading: saving} = useHttpRequest<{data: OdooConnection}>(SAVE_REQUEST, formBody(), saveCount, true, {
        success: (response) => {
            setHasApiKey(response.data.hasApiKey);
            setApiKeyEncrypted("");
            toast.success(rk("saved"));
        },
        error: (error) => handleError(error, {showToast: true, fallbackMessage: rk("saveError")}),
    });
    function onSave(event: FormEvent) {
        event.preventDefault();
        setSaveCount((count) => count + 1);
    }

    const [testCount, setTestCount] = useState(0);
    const {loading: testing} = useHttpRequest<OdooConnectionTestResponse>(TEST_REQUEST, formBody(), testCount, true, {
        success: () => toast.success(rk("testOk")),
        error: (error) => handleError(error, {showToast: true, fallbackMessage: rk("testError")}),
    });
    const onTest = () => setTestCount((count) => count + 1);

    if (read === false) return <Forbidden />;
    if (loading) return <Loader />;

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <Header title={rk("title")} description={rk("description")} help={readPageHelp(resolveLanguageKey)} />
            <form onSubmit={onSave}>
                <Card>
                    <CardContent className="flex flex-col gap-4 pt-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="odoo-url">{rk("form.urlLabel")}</Label>
                            <Input
                                id="odoo-url"
                                value={url}
                                onChange={(event) => setUrl(event.target.value)}
                                placeholder={rk("form.urlPlaceholder")}
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="odoo-db">{rk("form.dbLabel")}</Label>
                            <Input
                                id="odoo-db"
                                value={database}
                                onChange={(event) => setDatabase(event.target.value)}
                                placeholder={rk("form.dbPlaceholder")}
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="odoo-username">{rk("form.usernameLabel")}</Label>
                            <Input
                                id="odoo-username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder={rk("form.usernamePlaceholder")}
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="odoo-key">{rk("form.apiKeyLabel")}</Label>
                            <Input
                                id="odoo-key"
                                type="password"
                                value={apiKeyEncrypted}
                                onChange={(event) => setApiKeyEncrypted(event.target.value)}
                                placeholder={hasApiKey ? rk("form.apiKeySetPlaceholder") : rk("form.apiKeyPlaceholder")}
                                autoComplete="new-password"
                            />
                            <p className="text-xs text-muted-foreground">
                                {hasApiKey ? rk("form.apiKeySetHint") : rk("form.apiKeyHint")}
                            </p>
                        </div>
                    </CardContent>
                    {write && (
                        <CardFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={onTest} disabled={testing || saving}>
                                {rk("test")}
                            </Button>
                            <Button type="submit" disabled={saving || testing}>
                                {rk("save")}
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </form>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/odooConnection/index.tsx"),
    withDebug(true, true, "odooconnections"),
)(OdooConnectionPage);
