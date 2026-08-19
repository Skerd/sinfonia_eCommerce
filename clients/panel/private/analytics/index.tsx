import {useCallback, useEffect, useMemo, useState} from "react";
import {formatNumber} from "@coreModule/helpers/general";
import {GRID_KPI} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {compose} from "redux";
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";
import type {AnalyticsPeriod} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.period.validator.ts";
import type {AnalyticsRevenueResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.revenue.response.type.ts";
import type {AnalyticsOrdersResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.orders.response.type.ts";
import type {AnalyticsInventoryResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.inventory.response.type.ts";
import type {AnalyticsProductsResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.products.response.type.ts";
import type {AnalyticsCartsResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.carts.response.type.ts";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/axiosClients/apiClient.ts";
import Header from "@coreModule/components/custom/header.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Tabs, TabsList, TabsTrigger} from "@coreModule/components/ui/tabs.tsx";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@coreModule/components/ui/chart.tsx";
import {chartTooltipValueFormatter} from "@coreModule/components/custom/chartTooltipFormatter.tsx";
import {
    IconCoin,
    IconPackage,
    IconShoppingCart,
    IconTrendingUp,
    IconUsers,
    IconAlertTriangle,
} from "@tabler/icons-react";

const PERIODS: AnalyticsPeriod[] = ["7d", "30d", "90d", "1y"];

type AnalyticsData = {
    revenue: AnalyticsRevenueResponse | null;
    orders: AnalyticsOrdersResponse | null;
    inventory: AnalyticsInventoryResponse | null;
    products: AnalyticsProductsResponse | null;
    carts: AnalyticsCartsResponse | null;
};

const EMPTY_DATA: AnalyticsData = {
    revenue: null,
    orders: null,
    inventory: null,
    products: null,
    carts: null,
};

function formatMoney(value: number): string {
    return value.toLocaleString(undefined, {style: "currency", currency: "EUR", maximumFractionDigits: 0});
}

function ECommerceAnalytics({resolveLanguageKey}: WithLanguageType) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
    const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const query = {params: {period}};
            const [revenueRes, ordersRes, inventoryRes, productsRes, cartsRes] = await Promise.all([
                apiClient.get<{data: AnalyticsRevenueResponse}>("/api/eCommerce/analytics/revenue", query),
                apiClient.get<{data: AnalyticsOrdersResponse}>("/api/eCommerce/analytics/orders", query),
                apiClient.get<{data: AnalyticsInventoryResponse}>("/api/eCommerce/analytics/inventory"),
                apiClient.get<{data: AnalyticsProductsResponse}>("/api/eCommerce/analytics/products", query),
                apiClient.get<{data: AnalyticsCartsResponse}>("/api/eCommerce/analytics/carts"),
            ]);
            setData({
                revenue: revenueRes.data.data ?? null,
                orders: ordersRes.data.data ?? null,
                inventory: inventoryRes.data.data ?? null,
                products: productsRes.data.data ?? null,
                carts: cartsRes.data.data ?? null,
            });
        } catch {
            setError(true);
            setData(EMPTY_DATA);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        void fetchAnalytics();
    }, [fetchAnalytics]);

    const chartData = useMemo(
        () =>
            (data.revenue?.daily ?? []).map((day) => ({
                date: day._id,
                revenue: day.revenue ?? 0,
                orders: day.orders ?? 0,
            })),
        [data.revenue?.daily],
    );

    const totalOrders = useMemo(
        () => Object.values(data.orders?.byStatus ?? {}).reduce((sum, count) => sum + count, 0),
        [data.orders?.byStatus],
    );

    const totalProducts = useMemo(
        () => Object.values(data.products?.byStatus ?? {}).reduce((sum, count) => sum + count, 0),
        [data.products?.byStatus],
    );

    const chartConfig = useMemo(
        () => ({revenue: {label: rk("chart.revenue"), color: "var(--chart-1)"}}) satisfies ChartConfig,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [resolveLanguageKey],
    );

    if (loading && !data.revenue) return <Loader />;

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <Header title={rk("title")} description={rk("description")}>
                <div className="flex items-center gap-2">
                    <Tabs value={period} onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}>
                        <TabsList>
                            {PERIODS.map((p) => (
                                <TabsTrigger key={p} value={p}>
                                    {rk(`period.${p}`)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <Button type="button" variant="outline" size="sm" onClick={() => void fetchAnalytics()} disabled={loading}>
                        {rk("refresh")}
                    </Button>
                </div>
            </Header>

            {error && (
                <ErrorView
                    title={rk("errorTitle")}
                    description={rk("errorDescription")}
                    onClick={() => void fetchAnalytics()}
                />
            )}

            {!error && (
                <>
                    <div className={GRID_KPI}>
                        <KpiCard
                            compact
                            title={rk("kpi.totalRevenue")}
                            value={formatMoney(data.revenue?.totalRevenue ?? 0)}
                            subtitle={rk("kpi.totalRevenueDesc")}
                            icon={IconCoin as never}
                            variant="primary"
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.orderCount")}
                            value={(data.revenue?.orderCount ?? totalOrders).toLocaleString()}
                            subtitle={rk("kpi.orderCountDesc")}
                            icon={IconShoppingCart as never}
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.averageOrderValue")}
                            value={formatMoney(data.revenue?.averageOrderValue ?? 0)}
                            subtitle={rk("kpi.averageOrderValueDesc")}
                            icon={IconTrendingUp as never}
                            variant="success"
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.abandonedCarts")}
                            value={(data.carts?.abandonedCarts ?? 0).toLocaleString()}
                            subtitle={rk("kpi.abandonedCartsDesc")}
                            icon={IconUsers as never}
                            variant="warning"
                        />
                    </div>

                    <div className={GRID_KPI}>
                        <KpiCard
                            compact
                            title={rk("kpi.lowStock")}
                            value={(data.inventory?.lowStockCount ?? 0).toLocaleString()}
                            subtitle={rk("kpi.lowStockDesc")}
                            icon={IconAlertTriangle as never}
                            variant="warning"
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.outOfStock")}
                            value={(data.inventory?.outOfStockCount ?? 0).toLocaleString()}
                            subtitle={rk("kpi.outOfStockDesc")}
                            icon={IconPackage as never}
                            variant="danger"
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.totalOnHand")}
                            value={(data.inventory?.totalOnHand ?? 0).toLocaleString()}
                            subtitle={rk("kpi.totalOnHandDesc")}
                            icon={IconPackage as never}
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.activeProducts")}
                            value={formatNumber(totalProducts)}
                            subtitle={rk("kpi.activeProductsDesc")}
                            icon={IconPackage as never}
                        />
                    </div>

                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="mb-4 text-sm font-medium">{rk("revenueChartTitle")}</h3>
                        {chartData.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{rk("noChartData")}</p>
                        ) : (
                            <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
                                <BarChart data={chartData} margin={{top: 8, right: 8, left: 0, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                    <XAxis dataKey="date" tick={{fontSize: 11}} />
                                    <YAxis tick={{fontSize: 11}} tickFormatter={(v) => formatMoney(Number(v))} />
                                    <ChartTooltip
                                        cursor={{fill: "var(--muted)", fillOpacity: 0.4}}
                                        content={
                                            <ChartTooltipContent
                                                formatter={chartTooltipValueFormatter(chartConfig, formatMoney)}
                                            />
                                        }
                                    />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/analytics/index.tsx"),
    withDebug(true, true, ["products", "productOrders"]),
)(ECommerceAnalytics);
