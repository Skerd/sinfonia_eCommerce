import {useMemo} from "react";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import type {AnalyticsTopProduct} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.products.response.type.ts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@coreModule/components/ui/chart.tsx";
import {DashboardWidgetCard, DashboardWidgetEmpty} from "@coreModule/components/custom/dashboardWidgetCard.tsx";
import {formatCurrency} from "@coreModule/helpers/general/numbers.ts";

export type TopProductsChartProps = {
    products: AnalyticsTopProduct[];
    title: string;
    emptyMessage: string;
    revenueLabel: string;
};

export function TopProductsChart({
    products,
    title,
    emptyMessage,
    revenueLabel,
}: TopProductsChartProps) {
    const chartData = useMemo(
        () =>
            products.map((product) => ({
                name: product.title?.trim() || product._id,
                revenue: product.totalRevenue ?? 0,
            })),
        [products],
    );

    const chartConfig = useMemo(
        () =>
            ({
                revenue: {label: revenueLabel, color: "var(--chart-1)"},
            }) satisfies ChartConfig,
        [revenueLabel],
    );

    return (
        <DashboardWidgetCard title={title}>
            {chartData.length === 0 ? (
                <DashboardWidgetEmpty message={emptyMessage} />
            ) : (
                <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{top: 8, right: 8, left: 0, bottom: 0}}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                        <XAxis
                            type="number"
                            tick={{fontSize: 11}}
                            tickFormatter={(v) => formatCurrency(Number(v), undefined, {compact: true})}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={120}
                            tick={{fontSize: 11}}
                            tickFormatter={(value) => {
                                const label = String(value);
                                return label.length > 18 ? `${label.slice(0, 16)}…` : label;
                            }}
                        />
                        <ChartTooltip
                            cursor={{fill: "var(--muted)", fillOpacity: 0.4}}
                            content={<ChartTooltipContent valueFormatter={(v) => formatCurrency(Number(v))} />}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ChartContainer>
            )}
        </DashboardWidgetCard>
    );
}
