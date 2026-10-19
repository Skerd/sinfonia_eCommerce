import type {AnalyticsTopProduct} from "armonia/src/modules/eCommerce/api/eCommerce/private/analytics/analytics.products.response.type.ts";
import {DashboardWidgetCard, DashboardWidgetEmpty} from "@coreModule/components/custom/dashboardWidgetCard.tsx";
import {formatCurrency, formatNumber} from "@coreModule/helpers/general/numbers.ts";

export type TopProductsTableProps = {
    products: AnalyticsTopProduct[];
    title: string;
    emptyMessage: string;
    productLabel: string;
    soldLabel: string;
    revenueLabel: string;
};

export function TopProductsTable({
    products,
    title,
    emptyMessage,
    productLabel,
    soldLabel,
    revenueLabel,
}: TopProductsTableProps) {
    return (
        <DashboardWidgetCard title={title} contentClassName="px-0">
            {products.length === 0 ? (
                <div className="px-6">
                    <DashboardWidgetEmpty message={emptyMessage} />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-xs text-muted-foreground">
                                <th className="px-6 py-2 font-medium">#</th>
                                <th className="px-2 py-2 font-medium">{productLabel}</th>
                                <th className="px-2 py-2 text-right font-medium">{soldLabel}</th>
                                <th className="px-6 py-2 text-right font-medium">{revenueLabel}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product._id} className="border-b last:border-0">
                                    <td className="px-6 py-2.5 tabular-nums text-muted-foreground">
                                        {index + 1}
                                    </td>
                                    <td className="max-w-[14rem] truncate px-2 py-2.5 font-medium">
                                        {product.title?.trim() || product._id}
                                    </td>
                                    <td className="px-2 py-2.5 text-right tabular-nums">
                                        {formatNumber(product.totalSold ?? 0)}
                                    </td>
                                    <td className="px-6 py-2.5 text-right tabular-nums">
                                        {formatCurrency(product.totalRevenue ?? 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardWidgetCard>
    );
}
