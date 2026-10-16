import {useCallback, useEffect, useState} from "react";
import {compose} from "redux";
import {Link} from "react-router-dom";
import {toast} from "sonner";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {handleError} from "@coreModule/helpers/general/errors.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Checkbox} from "@coreModule/components/ui/checkbox.tsx";
import {Label} from "@coreModule/components/ui/label.tsx";
import {Switch} from "@coreModule/components/ui/switch.tsx";
import {Alert, AlertDescription, AlertTitle} from "@coreModule/components/ui/alert.tsx";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@coreModule/components/ui/card.tsx";
import type {OdooConnection} from "armonia/src/modules/eCommerce/api/eCommerce/private/odooConnection/odooConnection.dto.ts";
import {odooImportDatasets} from "armonia/src/modules/eCommerce/api/eCommerce/private/odooImport/odooImport.form.type.ts";
import type {OdooImportFormType} from "armonia/src/modules/eCommerce/api/eCommerce/private/odooImport/odooImport.form.type.ts";
import type {OdooImportCounts, OdooImportResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/odooImport/odooImport.form.response.type.ts";

const ALL_DATASETS = {
    categories: true,
    products: true,
    warehouses: true,
    inventory: true,
    stockChanges: true,
    actions: true,
    users: true,
} satisfies Record<(typeof odooImportDatasets)[number], boolean>;

function OdooImportPage({resolveLanguageKey}: WithLanguageType) {
    const {read} = useAccess("odooconnections");
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const [connection, setConnection] = useState<OdooConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [dryRun, setDryRun] = useState(true);
    const [datasets, setDatasets] = useState(ALL_DATASETS);
    const [result, setResult] = useState<OdooImportResponse | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get<{data: OdooConnection | null}>("/api/eCommerce/odooConnection");
            setConnection(response.data.data);
        } catch (error) {
            handleError(error, {showToast: true, fallbackMessage: String(resolveLanguageKey("loadError") ?? "loadError")});
        } finally {
            setLoading(false);
        }
    }, [resolveLanguageKey]);

    useEffect(() => {
        if (!read) return;
        void load();
    }, [load, read]);

    async function onRun() {
        setRunning(true);
        setResult(null);
        try {
            const body: OdooImportFormType = {...datasets, dryRun};
            const response = await apiClient.post<OdooImportResponse>("/api/eCommerce/odooImport", body);
            setResult(response.data);
            toast.success(dryRun ? rk("axios.success.dryRun") : rk("axios.success.title"));
        } catch (error) {
            handleError(error, {showToast: true, fallbackMessage: rk("axios.error.title")});
        } finally {
            setRunning(false);
        }
    }

    if (read === false) return <Forbidden />;
    if (loading) return <Loader />;

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <Header title={rk("title")} description={rk("description")} help={readPageHelp(resolveLanguageKey)} />
            {!connection ? (
                <Alert variant="warning">
                    <AlertTitle>{rk("missingConnectionTitle")}</AlertTitle>
                    <AlertDescription>
                        <p>{rk("missingConnection")}</p>
                        <Link to="/tenancy/systemSettings/odooconnection" className="font-medium">
                            {rk("openConnection")}
                        </Link>
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    <Alert variant="warning">
                        <AlertTitle>{rk("durationWarning")}</AlertTitle>
                        <AlertDescription>{rk("stockOverwriteWarning")}</AlertDescription>
                    </Alert>
                    <Card>
                        <CardHeader>
                            <CardTitle>{rk("connectionTitle")}</CardTitle>
                            <p className="text-sm text-muted-foreground">{connection.url} · {connection.database}</p>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3">
                                {odooImportDatasets.map((dataset) => (
                                    <div key={dataset} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`odoo-dataset-${dataset}`}
                                            checked={datasets[dataset]}
                                            onCheckedChange={(checked) => setDatasets((current) => ({...current, [dataset]: !!checked}))}
                                        />
                                        <Label htmlFor={`odoo-dataset-${dataset}`} className="font-normal cursor-pointer">
                                            {rk(`datasets.${dataset}`)}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch id="odoo-dry-run" checked={dryRun} onCheckedChange={setDryRun} />
                                <Label htmlFor="odoo-dry-run" className="font-normal cursor-pointer">
                                    {rk("dryRunLabel")}
                                </Label>
                            </div>
                            <p className="text-sm text-muted-foreground">{rk("dryRunDescription")}</p>
                        </CardContent>
                        <CardFooter>
                            <Button type="button" onClick={() => void onRun()} disabled={running}>
                                {rk("submit")}
                            </Button>
                        </CardFooter>
                    </Card>
                    {result && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{result.dryRun ? rk("result.dryRunTitle") : rk("result.title")}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                {odooImportDatasets.map((dataset) => {
                                    const counts: OdooImportCounts | undefined = result[dataset];
                                    if (!counts) return null;
                                    return (
                                        <p key={dataset} className="text-sm">
                                            <span className="font-medium">{rk(`datasets.${dataset}`)}:</span>{" "}
                                            {rk("result.created")} {counts.created}, {rk("result.updated")} {counts.updated}, {rk("result.skipped")} {counts.skipped}
                                        </p>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/odooImport/index.tsx"),
    withDebug(true, true, "odooconnections"),
)(OdooImportPage);
