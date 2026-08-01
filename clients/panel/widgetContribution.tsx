import {lazy} from "react";
import type {WidgetContribution} from "@coreModule/clients/panel/moduleContributions/widgetContribution.types.ts";

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
        "#DiscountSheetView": DiscountSheetViewLazy,
        "#DiscountCard": DiscountCardLazy,
        "#ProductOrderSheetView": ProductOrderSheetViewLazy,
        "#ProductOrderCard": ProductOrderCardLazy,
        "#PosOrderSheetView": PosOrderSheetViewLazy,
        "#PosOrderCard": PosOrderCardLazy,
        "#PosSessionSheetView": PosSessionSheetViewLazy,
        "#PosConfigSheetView": PosConfigSheetViewLazy,
        "#ProductReviewSheetView": ProductReviewSheetViewLazy,
        "#ProductReviewCard": ProductReviewCardLazy,
        "#InventorySheetView": InventorySheetViewLazy,
        "#InventoryCard": InventoryCardLazy,
        "#InventoryMovementSheetView": InventoryMovementSheetViewLazy,
        "#InventoryMovementCard": InventoryMovementCardLazy,
    },
    referencesDefaultItemProps: {
        "#PosPaymentMethodCard": "entity",
        "#ProductCard": "product",
        "#ProductAttributeCard": "productAttribute",
        "#ProductVariantCard": "entity",
        "#CollectionCard": "collection",
        "#CategoryCard": "category",
        "#CustomerGroupCard": "customerGroup",
        "#WarehouseCard": "warehouse",
        "#DiscountCard": "discount",
        "#ProductOrderCard": "order",
        "#PosOrderCard": "entity",
        "#ProductReviewCard": "review",
        "#InventoryCard": "inventory",
        "#InventoryMovementCard": "movement",
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
        "#ProductReviewSheetView": {
            url: "/api/eCommerce/productReview/single",
            labelFields: ["title", "product.title", "rating"],
        },
        "#InventorySheetView": {
            url: "/api/eCommerce/inventory/single",
            labelFields: ["product.title", "warehouse.name"],
        },
        "#InventoryMovementSheetView": {
            url: "/api/eCommerce/inventoryMovement/single",
            labelFields: ["reason", "quantity", "receiptNumber"],
        },
    },
};

export default eCommerceWidgetContribution;
