import {lazy} from "react";
import type {WidgetContribution} from "@coreModule/clients/panel/moduleContributions/widgetContribution.types.ts";

const CategorySheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/categories/center/sheetView/categorySheetView.tsx"),
);

const eCommerceWidgetContribution: WidgetContribution = {
    id: "eCommerce",
    order: 35,
    widgets: {
        "#CategorySheetView": CategorySheetViewLazy,
    },
};

export default eCommerceWidgetContribution;
