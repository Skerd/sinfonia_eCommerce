import {useCallback, useEffect, useMemo, useState} from "react";
import {formatCurrency, formatNumber} from "@coreModule/helpers/general/numbers.ts";
import {GRID_KPI} from "@coreModule/components/entityPage/list/entityCard.constants.ts";
import {compose} from "redux";
import type {AnalyticsPeriod} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.period.validator.ts";
import type {AnalyticsRevenueResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.revenue.response.type.ts";
import type {AnalyticsOrdersResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.orders.response.type.ts";
import type {AnalyticsInventoryResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.inventory.response.type.ts";
import type {AnalyticsProductsResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.products.response.type.ts";
import type {AnalyticsCartsResponse} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.carts.response.type.ts";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import apiClient from "@coreModule/helpers/apiClient/apiClient.ts";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import Forbidden from "@coreModule/components/custom/pages/forbidden.tsx";
import Header from "@coreModule/components/custom/header.tsx";
import {readPageHelp} from "@coreModule/components/custom/pageHelp.tsx";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errors/errorView.tsx";
import {KpiCard} from "@coreModule/components/custom/kpiCard.tsx";
import {Button} from "@coreModule/components/ui/button.tsx";
import {Tabs, TabsList, TabsTrigger} from "@coreModule/components/ui/tabs.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@coreModule/components/ui/select.tsx";
import {RevenueOrdersChart} from "@eCommerceModule/components/custom/analytics/RevenueOrdersChart.tsx";
import {StatusBreakdownChart} from "@eCommerceModule/components/custom/analytics/StatusBreakdownChart.tsx";
import {TopProductsChart} from "@eCommerceModule/components/custom/analytics/TopProductsChart.tsx";
import {TopProductsTable} from "@eCommerceModule/components/custom/analytics/TopProductsTable.tsx";
import {
    IconCoin,
    IconPackage,
    IconReceiptTax,
    IconShoppingCart,
    IconTruckDelivery,
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

function percentTrend(current: number, previous: number) {
    if (previous === 0) {
        if (current === 0) return undefined;
        return {value: 100, isPositive: current > 0};
    }
    const value = Math.round(((current - previous) / previous) * 100);
    return {value, isPositive: value >= 0};
}

function ECommerceAnalytics({resolveLanguageKey}: WithLanguageType) {
    const reads = [
        useAccess("productOrders").read,
        useAccess("products").read,
        useAccess("inventories").read,
        useAccess("carts").read,
    ];
    const read = reads.some((granted) => granted === false) ? false
        : reads.some((granted) => granted === null) ? null
        : true;
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
    const [currencyId, setCurrencyId] = useState("");
    const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const params: {period: AnalyticsPeriod; currency?: string} = {period};
            if (currencyId) params.currency = currencyId;
            const query = {params};
            const [revenueRes, ordersRes, inventoryRes, productsRes, cartsRes] = await Promise.all([
                apiClient.get<{data: AnalyticsRevenueResponse}>("/api/eCommerce/analytics/revenue", query),
                apiClient.get<{data: AnalyticsOrdersResponse}>("/api/eCommerce/analytics/orders", {params: {period}}),
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
    }, [period, currencyId]);

    useEffect(() => {
        if (!read) return;
        void fetchAnalytics();
    }, [fetchAnalytics, read]);

    const totalProducts = useMemo(
        () => Object.values(data.products?.byStatus ?? {}).reduce((sum, count) => sum + count, 0),
        [data.products?.byStatus],
    );

    const revenue = data.revenue;
    const selectedCurrency = currencyId || revenue?.currency?._id || "";
    const currencies = revenue?.currencies ?? [];

    const labelOrderStatus = useCallback(
        (status: string) => {
            const key = `orderStatus.${status}`;
            const labeled = resolveLanguageKey(key);
            return labeled != null && labeled !== key ? String(labeled) : status;
        },
        [resolveLanguageKey],
    );

    const labelProductStatus = useCallback(
        (status: string) => {
            const key = `productStatus.${status}`;
            const labeled = resolveLanguageKey(key);
            return labeled != null && labeled !== key ? String(labeled) : status;
        },
        [resolveLanguageKey],
    );

    if (read === false) return <Forbidden />;
    if (loading && !data.revenue) return <Loader />;

    return (
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <Header title={rk("title")} description={rk("description")} help={readPageHelp(resolveLanguageKey)}>
                <div className="flex flex-wrap items-center gap-2">
                    <Tabs value={period} onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}>
                        <TabsList>
                            {PERIODS.map((p) => (
                                <TabsTrigger key={p} value={p}>
                                    {rk(`period.${p}`)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    {currencies.length > 1 && (
                        <Select
                            value={selectedCurrency}
                            onValueChange={(value) => setCurrencyId(value)}
                        >
                            <SelectTrigger className="w-[8.5rem]" aria-label={rk("currency")}>
                                <SelectValue placeholder={rk("currency")} />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map((currency) => (
                                    <SelectItem key={currency._id} value={currency._id}>
                                        {currency.abbreviation ?? currency._id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
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
                            value={formatCurrency(revenue?.totalRevenue ?? 0)}
                            subtitle={rk("kpi.totalRevenueDesc")}
                            icon={IconCoin}
                            variant="primary"
                            trend={
                                revenue
                                    ? percentTrend(revenue.totalRevenue, revenue.previousTotalRevenue)
                                    : undefined
                            }
                            href="/eCommerce/productorders"
                            linkLabel={rk("kpi.viewOrders")}
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.orderCount")}
                            value={formatNumber(revenue?.orderCount ?? 0)}
                            subtitle={rk("kpi.orderCountDesc")}
                            icon={IconShoppingCart}
                            trend={
                                revenue
                                    ? percentTrend(revenue.orderCount, revenue.previousOrderCount)
                                    : undefined
                            }
                            href="/eCommerce/productorders"
                            linkLabel={rk("kpi.viewOrders")}
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.averageOrderValue")}
                            value={formatCurrency(revenue?.averageOrderValue ?? 0)}
                            subtitle={rk("kpi.averageOrderValueDesc")}
                            icon={IconTrendingUp}
                            variant="success"
                            trend={
                                revenue
                                    ? percentTrend(revenue.averageOrderValue, revenue.previousAverageOrderValue)
                                    : undefined
                            }
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.totalTax")}
                            value={formatCurrency(revenue?.totalTax ?? 0)}
                            subtitle={rk("kpi.totalTaxDesc")}
                            icon={IconReceiptTax}
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.totalShipping")}
                            value={formatCurrency(revenue?.totalShipping ?? 0)}
                            subtitle={rk("kpi.totalShippingDesc")}
                            icon={IconTruckDelivery}
                        />
                    </div>

                    <div className={GRID_KPI}>
                        <KpiCard
                            compact
                            title={rk("kpi.abandonedCarts")}
                            value={formatNumber(data.carts?.abandonedCarts ?? 0)}
                            subtitle={rk("kpi.abandonedCartsDesc")}
                            icon={IconUsers}
                            variant="warning"
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.activeCarts")}
                            value={formatNumber(data.carts?.activeCarts ?? 0)}
                            subtitle={rk("kpi.activeCartsDesc")}
                            icon={IconShoppingCart}
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.averageCartValue")}
                            value={formatCurrency(data.carts?.averageCartValue ?? 0)}
                            subtitle={rk("kpi.averageCartValueDesc")}
                            icon={IconCoin}
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.activeProducts")}
                            value={formatNumber(totalProducts)}
                            subtitle={rk("kpi.activeProductsDesc")}
                            icon={IconPackage}
                            href="/eCommerce/products"
                            linkLabel={rk("kpi.viewProducts")}
                        />
                    </div>

                    <div className={GRID_KPI}>
                        <KpiCard
                            compact
                            title={rk("kpi.lowStock")}
                            value={formatNumber(data.inventory?.lowStockCount ?? 0)}
                            subtitle={rk("kpi.lowStockDesc")}
                            icon={IconAlertTriangle}
                            variant="warning"
                            href="/eCommerce/inventories"
                            linkLabel={rk("kpi.viewInventories")}
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.outOfStock")}
                            value={formatNumber(data.inventory?.outOfStockCount ?? 0)}
                            subtitle={rk("kpi.outOfStockDesc")}
                            icon={IconPackage}
                            variant="danger"
                            href="/eCommerce/inventories"
                            linkLabel={rk("kpi.viewInventories")}
                        />
                        <KpiCard
                            compact
                            title={rk("kpi.totalOnHand")}
                            value={formatNumber(data.inventory?.totalOnHand ?? 0)}
                            subtitle={rk("kpi.totalOnHandDesc")}
                            icon={IconPackage}
                            href="/eCommerce/inventories"
                            linkLabel={rk("kpi.viewInventories")}
                        />
                    </div>

                    <RevenueOrdersChart
                        series={revenue?.daily ?? []}
                        title={rk("revenueChartTitle")}
                        emptyMessage={rk("noChartData")}
                        revenueLabel={rk("chart.revenue")}
                        ordersLabel={rk("chart.orders")}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <StatusBreakdownChart
                            byStatus={data.orders?.byStatus ?? {}}
                            title={rk("orderStatusChartTitle")}
                            emptyMessage={rk("noStatusData")}
                            totalLabel={rk("totalLabel")}
                            labelForStatus={labelOrderStatus}
                        />
                        <StatusBreakdownChart
                            byStatus={data.products?.byStatus ?? {}}
                            title={rk("productStatusChartTitle")}
                            emptyMessage={rk("noStatusData")}
                            totalLabel={rk("totalLabel")}
                            labelForStatus={labelProductStatus}
                        />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <TopProductsChart
                            products={data.products?.topProducts ?? []}
                            title={rk("topProductsChartTitle")}
                            emptyMessage={rk("noTopProducts")}
                            revenueLabel={rk("chart.revenue")}
                        />
                        <TopProductsTable
                            products={data.products?.topProducts ?? []}
                            title={rk("topProductsTableTitle")}
                            emptyMessage={rk("noTopProducts")}
                            productLabel={rk("table.product")}
                            soldLabel={rk("table.sold")}
                            revenueLabel={rk("table.revenue")}
                        />
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
