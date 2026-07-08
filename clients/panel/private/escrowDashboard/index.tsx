import { useEffect, useState } from "react";
import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import type { EscrowSummary, EscrowSummaryByCurrency } from "armonia/src/modules/eCommerce/api/eCommerce/private/escrowTransaction/escrowSummary.form.response.type.ts";

function EscrowDashboard({ resolveLanguageKey }: WithLanguageType) {
    const [summary, setSummary] = useState<EscrowSummaryByCurrency[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        apiClient
            .post<EscrowSummary>("/api/eCommerce/escrowTransaction/summary", {})
            .then((res) => {
                setSummary(res.data.byCurrency ?? []);
            })
            .catch(() => {
                setError("Failed to load escrow summary.");
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 flex flex-col gap-6">
            <h2 className="text-xl font-semibold">{resolveLanguageKey("title")}</h2>

            {loading && <p className="text-muted-foreground">{resolveLanguageKey("loading")}</p>}
            {error && <p className="text-destructive">{error}</p>}

            {!loading && !error && summary.length === 0 && (
                <p className="text-muted-foreground">{resolveLanguageKey("noData")}</p>
            )}

            {!loading && summary.length > 0 && (
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2 text-left">{resolveLanguageKey("currency")}</th>
                                <th className="px-4 py-2 text-right">{resolveLanguageKey("holds")}</th>
                                <th className="px-4 py-2 text-right">{resolveLanguageKey("releases")}</th>
                                <th className="px-4 py-2 text-right">{resolveLanguageKey("refunds")}</th>
                                <th className="px-4 py-2 text-right">{resolveLanguageKey("fees")}</th>
                                <th className="px-4 py-2 text-right">{resolveLanguageKey("net")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((row) => {
                                const symbol = row.currencySymbol || row.currencyId;
                                const net = row.releases - row.holds - row.refunds;
                                return (
                                    <tr key={row.currencyId} className="border-t hover:bg-muted/40">
                                        <td className="px-4 py-2 font-medium">{symbol}</td>
                                        <td className="px-4 py-2 text-right">{row.holds.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-green-600">{row.releases.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-red-500">{row.refunds.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-muted-foreground">{row.fees.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right font-semibold">{net.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/escrowDashboard/index.tsx"),
    withDebug(true, true),
)(EscrowDashboard);
