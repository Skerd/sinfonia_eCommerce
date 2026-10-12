import {lazy} from "react";
import type {WidgetContribution} from "@coreModule/helpers/types/widgetContribution.types.ts";

const CategorySheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/categories/center/sheetView/categorySheetView.tsx"),
);
const CategoryCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/categories/center/cardView/categoryCard.tsx"),
);
const CollectionSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/collections/center/sheetView/collectionSheetView.tsx"),
);
const CollectionCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/collections/center/cardView/collectionCard.tsx"),
);
const ProductSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/products/center/sheetView/productSheetView.tsx"),
);
const ProductCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/products/center/cardView/productCard.tsx"),
);
const ProductAttributeSheetViewLazy = lazy(
    () =>
        import(
            "@eCommerceModule/clients/panel/private/productAttributes/center/sheetView/productAttributeSheetView.tsx"
        ),
);
const ProductAttributeCardLazy = lazy(
    () =>
        import(
            "@eCommerceModule/clients/panel/private/productAttributes/center/cardView/productAttributeCard.tsx"
        ),
);
const ProductVariantSheetViewLazy = lazy(
    () =>
        import(
            "@eCommerceModule/clients/panel/private/productVariants/center/sheetView/productVariantSheetView.tsx"
        ),
);
const ProductVariantCardLazy = lazy(
    () =>
        import("@eCommerceModule/clients/panel/private/productVariants/center/cardView/productVariantCard.tsx"),
);
const CustomerGroupSheetViewLazy = lazy(
    () =>
        import(
            "@eCommerceModule/clients/panel/private/customerGroups/center/sheetView/customerGroupSheetView.tsx"
        ),
);
const CustomerGroupCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/customerGroups/center/cardView/customerGroupCard.tsx"),
);
const WarehouseSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/warehouses/center/sheetView/warehouseSheetView.tsx"),
);
const WarehouseCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/warehouses/center/cardView/warehouseCard.tsx"),
);
const PosPaymentMethodSheetViewLazy = lazy(
    () =>
        import(
            "@eCommerceModule/clients/panel/private/posPaymentMethods/center/sheetView/posPaymentMethodSheetView.tsx"
        ),
);
const PosPaymentMethodCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/posPaymentMethods/center/cardView/posPaymentMethodCard.tsx"),
);
const PosManagerSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/posConfigs/center/sheetView/posManagerSheetView.tsx"),
);
const PosManagerCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/posConfigs/center/cardView/posManagerCard.tsx"),
);
const DiscountSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/discounts/center/sheetView/discountSheetView.tsx"),
);
const DiscountCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/discounts/center/cardView/discountCard.tsx"),
);
const ProductOrderSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/productOrders/center/sheetView/productOrderSheetView.tsx"),
);
const ProductOrderCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/productOrders/center/cardView/productOrderCard.tsx"),
);
const PosOrderSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/posOrders/center/sheetView/posOrderSheetView.tsx"),
);
const PosOrderCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/posOrders/center/cardView/posOrderCard.tsx"),
);
const PosSessionSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/posSessions/center/sheetView/posSessionSheetView.tsx"),
);
const PosConfigSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/posConfigs/center/sheetView/posConfigSheetView.tsx"),
);
const FiscalConfigSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/fiscalConfigs/center/sheetView/fiscalConfigSheetView.tsx"),
);
const FiscalConfigCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/fiscalConfigs/center/cardView/fiscalConfigCard.tsx"),
);
const SavedSearchSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/savedSearches/center/sheetView/savedSearchSheetView.tsx"),
);
const SavedSearchCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/savedSearches/center/cardView/savedSearchCard.tsx"),
);
const ProductReviewSheetViewLazy = lazy(
    () =>
        import(
            "@eCommerceModule/clients/panel/private/productReviews/center/sheetView/productReviewSheetView.tsx"
        ),
);
const ProductReviewCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/productReviews/center/cardView/productReviewCard.tsx"),
);
const InventorySheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/inventories/center/sheetView/inventorySheetView.tsx"),
);
const InventoryCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/inventories/center/cardView/inventoryCard.tsx"),
);
const InventoryMovementSheetViewLazy = lazy(
    () =>
        import(
            "@eCommerceModule/clients/panel/private/inventoryMovements/center/sheetView/inventoryMovementSheetView.tsx"
        ),
);
const InventoryMovementCardLazy = lazy(
    () =>
        import(
            "@eCommerceModule/clients/panel/private/inventoryMovements/center/cardView/inventoryMovementCard.tsx"
        ),
);
const StockTransferSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/stockTransfers/center/sheetView/stockTransferSheetView.tsx"),
);
const StockTransferCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/stockTransfers/center/cardView/stockTransferCard.tsx"),
);
const StockCountSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/stockCounts/center/sheetView/stockCountSheetView.tsx"),
);
const StockCountCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/stockCounts/center/cardView/stockCountCard.tsx"),
);
const FulfillmentSheetViewLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/fulfillments/center/sheetView/fulfillmentSheetView.tsx"),
);
const FulfillmentCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/fulfillments/center/cardView/fulfillmentCard.tsx"),
);
const ReturnRequestSheetViewLazy = lazy(
    () =>
        import(
            "@eCommerceModule/clients/panel/private/returnRequests/center/sheetView/returnRequestSheetView.tsx"
        ),
);
const ReturnRequestCardLazy = lazy(
    () => import("@eCommerceModule/clients/panel/private/returnRequests/center/cardView/returnRequestCard.tsx"),
);

const eCommerceWidgetContribution: WidgetContribution = {
    id: "eCommerce",
    order: 35,
    widgets: {
        "#CategorySheetView": CategorySheetViewLazy,
        "#CategoryCard": CategoryCardLazy,
        "#CollectionSheetView": CollectionSheetViewLazy,
        "#CollectionCard": CollectionCardLazy,
        "#ProductSheetView": ProductSheetViewLazy,
        "#ProductCard": ProductCardLazy,
        "#ProductAttributeSheetView": ProductAttributeSheetViewLazy,
        "#ProductAttributeCard": ProductAttributeCardLazy,
        "#ProductVariantSheetView": ProductVariantSheetViewLazy,
        "#ProductVariantCard": ProductVariantCardLazy,
        "#CustomerGroupSheetView": CustomerGroupSheetViewLazy,
        "#CustomerGroupCard": CustomerGroupCardLazy,
        "#WarehouseSheetView": WarehouseSheetViewLazy,
        "#WarehouseCard": WarehouseCardLazy,
        "#PosPaymentMethodSheetView": PosPaymentMethodSheetViewLazy,
        "#PosPaymentMethodCard": PosPaymentMethodCardLazy,
        "#PosManagerSheetView": PosManagerSheetViewLazy,
        "#PosManagerCard": PosManagerCardLazy,
        "#DiscountSheetView": DiscountSheetViewLazy,
        "#DiscountCard": DiscountCardLazy,
        "#ProductOrderSheetView": ProductOrderSheetViewLazy,
        "#ProductOrderCard": ProductOrderCardLazy,
        "#PosOrderSheetView": PosOrderSheetViewLazy,
        "#PosOrderCard": PosOrderCardLazy,
        "#PosSessionSheetView": PosSessionSheetViewLazy,
        "#PosConfigSheetView": PosConfigSheetViewLazy,
        "#FiscalConfigSheetView": FiscalConfigSheetViewLazy,
        "#FiscalConfigCard": FiscalConfigCardLazy,
        "#ProductReviewSheetView": ProductReviewSheetViewLazy,
        "#ProductReviewCard": ProductReviewCardLazy,
        "#SavedSearchSheetView": SavedSearchSheetViewLazy,
        "#SavedSearchCard": SavedSearchCardLazy,
        "#InventorySheetView": InventorySheetViewLazy,
        "#InventoryCard": InventoryCardLazy,
        "#InventoryMovementSheetView": InventoryMovementSheetViewLazy,
        "#InventoryMovementCard": InventoryMovementCardLazy,
        "#StockTransferSheetView": StockTransferSheetViewLazy,
        "#StockTransferCard": StockTransferCardLazy,
        "#StockCountSheetView": StockCountSheetViewLazy,
        "#StockCountCard": StockCountCardLazy,
        "#FulfillmentSheetView": FulfillmentSheetViewLazy,
        "#FulfillmentCard": FulfillmentCardLazy,
        "#ReturnRequestSheetView": ReturnRequestSheetViewLazy,
        "#ReturnRequestCard": ReturnRequestCardLazy,
    },
    referencesDefaultItemProps: {
        "#PosPaymentMethodCard": "entity",
        "#PosManagerCard": "manager",
        "#ProductCard": "product",
        "#ProductAttributeCard": "productAttribute",
        "#ProductVariantCard": "entity",
        "#CollectionCard": "collection",
        "#CategoryCard": "category",
        "#CustomerGroupCard": "customerGroup",
        "#WarehouseCard": "warehouse",
        "#FiscalConfigCard": "entity",
        "#DiscountCard": "discount",
        "#ProductOrderCard": "order",
        "#PosOrderCard": "entity",
        "#ProductReviewCard": "review",
        "#SavedSearchCard": "entity",
        "#InventoryCard": "inventory",
        "#InventoryMovementCard": "movement",
        "#StockTransferCard": "entity",
        "#StockCountCard": "entity",
        "#FulfillmentCard": "entity",
        "#ReturnRequestCard": "entity",
    },
    auditSinglePostHints: {
        "#WarehouseSheetView": {url: "/api/eCommerce/warehouse/single", labelFields: ["name", "code"]},
        "#PosPaymentMethodSheetView": {
            url: "/api/eCommerce/posPaymentMethod/single",
            labelFields: ["name", "type"],
        },
        "#ProductSheetView": {url: "/api/eCommerce/product/single", labelFields: ["title", "sku"]},
        "#ProductAttributeSheetView": {
            url: "/api/eCommerce/productAttribute/single",
            labelFields: ["name"],
        },
        "#ProductVariantSheetView": {
            url: "/api/eCommerce/productVariant/single",
            labelFields: ["sku"],
        },
        "#CollectionSheetView": {url: "/api/eCommerce/collection/single", labelFields: ["name"]},
        "#CategorySheetView": {url: "/api/eCommerce/category/single", labelFields: ["name"]},
        "#CustomerGroupSheetView": {url: "/api/eCommerce/customerGroup/single", labelFields: ["name"]},
        "#DiscountSheetView": {url: "/api/eCommerce/discount/single", labelFields: ["title", "code"]},
        "#ProductOrderSheetView": {
            url: "/api/eCommerce/productOrder/single",
            labelFields: ["orderNumber", "status"],
        },
        "#PosOrderSheetView": {
            url: "/api/eCommerce/posOrder/single",
            labelFields: ["name", "state"],
        },
        "#PosSessionSheetView": {
            url: "/api/eCommerce/posSession/single",
            labelFields: ["name", "state"],
        },
        "#PosConfigSheetView": {
            url: "/api/eCommerce/posConfig/single",
            labelFields: ["name"],
        },
        "#FiscalConfigSheetView": {
            url: "/api/eCommerce/fiscalConfig/single",
            labelFields: ["name"],
        },
        "#ProductReviewSheetView": {
            url: "/api/eCommerce/productReview/single",
            labelFields: ["title", "product.title", "rating"],
        },
        "#SavedSearchSheetView": {
            url: "/api/eCommerce/savedSearch/single",
            labelFields: ["name"],
        },
        "#InventorySheetView": {
            url: "/api/eCommerce/inventory/single",
            labelFields: ["product.title", "warehouse.name"],
        },
        "#InventoryMovementSheetView": {
            url: "/api/eCommerce/inventoryMovement/single",
            labelFields: ["reason", "quantity", "receiptNumber"],
        },
        "#StockTransferSheetView": {
            url: "/api/eCommerce/stockTransfer/single",
            labelFields: ["fromWarehouse.name", "toWarehouse.name", "status"],
        },
        "#StockCountSheetView": {
            url: "/api/eCommerce/stockCount/single",
            labelFields: ["warehouse.name", "status"],
        },
        "#FulfillmentSheetView": {
            url: "/api/eCommerce/fulfillment/single",
            labelFields: ["status", "trackingNumber", "carrier"],
        },
        "#ReturnRequestSheetView": {
            url: "/api/eCommerce/returnRequest/single",
            labelFields: ["type", "status"],
        },
    },
};

export default eCommerceWidgetContribution;
