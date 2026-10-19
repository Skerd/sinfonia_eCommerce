import {useMemo} from "react";
import {Cell, Pie, PieChart} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@coreModule/components/ui/chart.tsx";
import {DashboardWidgetCard, DashboardWidgetEmpty} from "@coreModule/components/custom/dashboardWidgetCard.tsx";
import {formatNumber} from "@coreModule/helpers/general/numbers.ts";

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
] as const;

export type StatusBreakdownChartProps = {
    byStatus: Record<string, number>;
    title: string;
    emptyMessage: string;
    totalLabel: string;
    /** Resolve a status key to a display label; falls back to the raw key. */
    labelForStatus: (status: string) => string;
};

export function StatusBreakdownChart({
    byStatus,
    title,
    emptyMessage,
    totalLabel,
    labelForStatus,
}: StatusBreakdownChartProps) {
    const chartData = useMemo(() => {
        const entries = Object.entries(byStatus)
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);
        return entries.map(([status, value], index) => ({
            status,
            name: labelForStatus(status),
            value,
            color: CHART_COLORS[index % CHART_COLORS.length],
        }));
    }, [byStatus, labelForStatus]);

    const chartConfig = useMemo(() => {
        const config: ChartConfig = {};
        for (const row of chartData) {
            config[row.status] = {label: row.name, color: row.color};
        }
        return config;
    }, [chartData]);

    const total = chartData.reduce((sum, row) => sum + row.value, 0);

    return (
        <DashboardWidgetCard
            title={title}
            footer={
                total > 0 ? (
                    <p className="w-full py-2 text-center text-xs text-muted-foreground">
                        {totalLabel}: <span className="font-semibold text-foreground">{formatNumber(total)}</span>
                    </p>
                ) : null
            }
        >
            {chartData.length === 0 ? (
                <DashboardWidgetEmpty message={emptyMessage} />
            ) : (
                <>
                    <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
                        <PieChart>
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        nameKey="status"
                                        hideLabel
                                        valueFormatter={(value) => formatNumber(Number(value))}
                                    />
                                }
                            />
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={58}
                                paddingAngle={4}
                                dataKey="value"
                                nameKey="status"
                                strokeWidth={0}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.status} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {chartData.map((item) => (
                            <div key={item.status} className="flex items-center gap-2">
                                <div
                                    className="size-2.5 shrink-0 rounded-full"
                                    style={{backgroundColor: item.color}}
                                />
                                <span className="truncate text-xs text-muted-foreground">
                                    {item.name}
                                </span>
                                <span className="ml-auto text-xs font-medium tabular-nums">
                                    {formatNumber(item.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </DashboardWidgetCard>
    );
}
