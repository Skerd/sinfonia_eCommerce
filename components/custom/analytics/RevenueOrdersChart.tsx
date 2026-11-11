import {useMemo} from "react";
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
} from "recharts";
import type {AnalyticsRevenueDaily} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.revenue.response.type.ts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@coreModule/components/ui/chart.tsx";
import {DashboardWidgetCard, DashboardWidgetEmpty} from "@coreModule/components/custom/dashboardWidgetCard.tsx";
import {formatCurrency, formatNumber} from "@coreModule/helpers/general/numbers.ts";

export type RevenueOrdersChartProps = {
    /** ISO code of the currency the amounts are in; without one they show as plain numbers. */
    currencyCode?: string;
    series: AnalyticsRevenueDaily[];
    title: string;
    emptyMessage: string;
    revenueLabel: string;
    ordersLabel: string;
};

export function RevenueOrdersChart({
    currencyCode,
    series,
    title,
    emptyMessage,
    revenueLabel,
    ordersLabel,
}: RevenueOrdersChartProps) {
    const money = (value: number, options: {compact?: boolean} = {}) =>
        currencyCode ? formatCurrency(value, currencyCode, options) : formatNumber(value, options);
    const chartData = useMemo(
        () =>
            series.map((day) => ({
                date: day._id,
                revenue: day.revenue ?? 0,
                orders: day.orders ?? 0,
            })),
        [series],
    );

    const chartConfig = useMemo(
        () =>
            ({
                revenue: {label: revenueLabel, color: "var(--chart-1)"},
                orders: {label: ordersLabel, color: "var(--chart-2)"},
            }) satisfies ChartConfig,
        [revenueLabel, ordersLabel],
    );

    const hasValues = chartData.some((row) => row.revenue > 0 || row.orders > 0);

    return (
        <DashboardWidgetCard title={title}>
            {!hasValues ? (
                <DashboardWidgetEmpty message={emptyMessage} />
            ) : (
                <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
                    <ComposedChart data={chartData} margin={{top: 8, right: 8, left: 0, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{fontSize: 11}} minTickGap={24} />
                        <YAxis
                            yAxisId="revenue"
                            tick={{fontSize: 11}}
                            tickFormatter={(v) => money(Number(v), {compact: true})}
                        />
                        <YAxis
                            yAxisId="orders"
                            orientation="right"
                            tick={{fontSize: 11}}
                            tickFormatter={(v) => formatNumber(Number(v))}
                            allowDecimals={false}
                        />
                        <ChartTooltip
                            cursor={{fill: "var(--muted)", fillOpacity: 0.4}}
                            content={<ChartTooltipContent valueFormatter={(value) => formatNumber(value)} />}
                        />
                        <Bar
                            yAxisId="revenue"
                            dataKey="revenue"
                            fill="var(--color-revenue)"
                            radius={[4, 4, 0, 0]}
                        />
                        <Line
                            yAxisId="orders"
                            type="monotone"
                            dataKey="orders"
                            stroke="var(--color-orders)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </ComposedChart>
                </ChartContainer>
            )}
        </DashboardWidgetCard>
    );
}
