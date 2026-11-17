import {lazy} from "react";
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/helpers/types/routeConfigContribution.types.ts";

// Pages load on first visit (D21); the panel shell's Suspense boundary shows the loader.
const AllCategories = lazy(() => import("@eCommerceModule/clients/panel/private/categories"));
const CreateCategory = lazy(() => import("@eCommerceModule/clients/panel/private/categories/createCategory.tsx"));
const EditCategory = lazy(() => import("@eCommerceModule/clients/panel/private/categories/editCategory.tsx"));
const SystemMap = lazy(() => import("@eCommerceModule/clients/panel/private/systemMap"));
const AllProducts = lazy(() => import("@eCommerceModule/clients/panel/private/products/index.tsx"));
const CreateProduct = lazy(() => import("@eCommerceModule/clients/panel/private/products/createProduct.tsx"));
const EditProduct = lazy(() => import("@eCommerceModule/clients/panel/private/products/editProduct.tsx"));
const AllProductAttributes = lazy(() => import("@eCommerceModule/clients/panel/private/productAttributes/index.tsx"));
const CreateProductAttribute = lazy(() => import("@eCommerceModule/clients/panel/private/productAttributes/createProductAttribute.tsx"));
const EditProductAttribute = lazy(() => import("@eCommerceModule/clients/panel/private/productAttributes/editProductAttribute.tsx"));
const AllWarehouses = lazy(() => import("@eCommerceModule/clients/panel/private/warehouses/index.tsx"));
const CreateWarehouse = lazy(() => import("@eCommerceModule/clients/panel/private/warehouses/createWarehouse.tsx"));
const EditWarehouse = lazy(() => import("@eCommerceModule/clients/panel/private/warehouses/editWarehouse.tsx"));
const AllInventories = lazy(() => import("@eCommerceModule/clients/panel/private/inventories/index.tsx"));
const CreateInventory = lazy(() => import("@eCommerceModule/clients/panel/private/inventories/createInventory.tsx"));
const EditInventory = lazy(() => import("@eCommerceModule/clients/panel/private/inventories/editInventory.tsx"));
const AllInventoryMovements = lazy(() => import("@eCommerceModule/clients/panel/private/inventoryMovements/index.tsx"));
const AllStockTransfers = lazy(() => import("@eCommerceModule/clients/panel/private/stockTransfers/index.tsx"));
const CreateStockTransfer = lazy(() => import("@eCommerceModule/clients/panel/private/stockTransfers/createStockTransfer.tsx"));
const EditStockTransfer = lazy(() => import("@eCommerceModule/clients/panel/private/stockTransfers/editStockTransfer.tsx"));
const AllStockCounts = lazy(() => import("@eCommerceModule/clients/panel/private/stockCounts/index.tsx"));
const CreateStockCount = lazy(() => import("@eCommerceModule/clients/panel/private/stockCounts/createStockCount.tsx"));
const EditStockCount = lazy(() => import("@eCommerceModule/clients/panel/private/stockCounts/editStockCount.tsx"));
const AllCollections = lazy(() => import("@eCommerceModule/clients/panel/private/collections/index.tsx"));
const CreateCollection = lazy(() => import("@eCommerceModule/clients/panel/private/collections/createCollection.tsx"));
const EditCollection = lazy(() => import("@eCommerceModule/clients/panel/private/collections/editCollection.tsx"));
const AllProductOrders = lazy(() => import("@eCommerceModule/clients/panel/private/productOrders/index.tsx"));
const AllDiscounts = lazy(() => import("@eCommerceModule/clients/panel/private/discounts/index.tsx"));
const CreateDiscount = lazy(() => import("@eCommerceModule/clients/panel/private/discounts/createDiscount.tsx"));
const EditDiscount = lazy(() => import("@eCommerceModule/clients/panel/private/discounts/editDiscount.tsx"));
const AllTaxZones = lazy(() => import("@eCommerceModule/clients/panel/private/taxZones/index.tsx"));
const CreateTaxZone = lazy(() => import("@eCommerceModule/clients/panel/private/taxZones/createTaxZone.tsx"));
const EditTaxZone = lazy(() => import("@eCommerceModule/clients/panel/private/taxZones/editTaxZone.tsx"));
const AllShippingZones = lazy(() => import("@eCommerceModule/clients/panel/private/shippingZones/index.tsx"));
const CreateShippingZone = lazy(() => import("@eCommerceModule/clients/panel/private/shippingZones/createShippingZone.tsx"));
const EditShippingZone = lazy(() => import("@eCommerceModule/clients/panel/private/shippingZones/editShippingZone.tsx"));
const AllCmsBlocks = lazy(() => import("@eCommerceModule/clients/panel/private/cmsBlocks/index.tsx"));
const CreateCmsBlock = lazy(() => import("@eCommerceModule/clients/panel/private/cmsBlocks/createCmsBlock.tsx"));
const EditCmsBlock = lazy(() => import("@eCommerceModule/clients/panel/private/cmsBlocks/editCmsBlock.tsx"));
const AllCustomerGroups = lazy(() => import("@eCommerceModule/clients/panel/private/customerGroups/index.tsx"));
const CreateCustomerGroup = lazy(() => import("@eCommerceModule/clients/panel/private/customerGroups/createCustomerGroup.tsx"));
const EditCustomerGroup = lazy(() => import("@eCommerceModule/clients/panel/private/customerGroups/editCustomerGroup.tsx"));
const AllPricingRules = lazy(() => import("@eCommerceModule/clients/panel/private/pricingRules/index.tsx"));
const CreatePricingRule = lazy(() => import("@eCommerceModule/clients/panel/private/pricingRules/createPricingRule.tsx"));
const EditPricingRule = lazy(() => import("@eCommerceModule/clients/panel/private/pricingRules/editPricingRule.tsx"));
const ECommerceAnalytics = lazy(() => import("@eCommerceModule/clients/panel/private/analytics/index.tsx"));
const OdooConnectionPage = lazy(() => import("@eCommerceModule/clients/panel/private/odooConnection/index.tsx"));
const OdooImportPage = lazy(() => import("@eCommerceModule/clients/panel/private/odooImport/index.tsx"));
const AllFulfillments = lazy(() => import("@eCommerceModule/clients/panel/private/fulfillments/index.tsx"));
const CreateFulfillment = lazy(() => import("@eCommerceModule/clients/panel/private/fulfillments/createFulfillment.tsx"));
const EditFulfillment = lazy(() => import("@eCommerceModule/clients/panel/private/fulfillments/editFulfillment.tsx"));
const AllReturnRequests = lazy(() => import("@eCommerceModule/clients/panel/private/returnRequests/index.tsx"));
const CreateReturnRequest = lazy(() => import("@eCommerceModule/clients/panel/private/returnRequests/createReturnRequest.tsx"));
const EditReturnRequest = lazy(() => import("@eCommerceModule/clients/panel/private/returnRequests/editReturnRequest.tsx"));
const AllProductVariants = lazy(() => import("@eCommerceModule/clients/panel/private/productVariants/index.tsx"));
const CreateProductVariant = lazy(() => import("@eCommerceModule/clients/panel/private/productVariants/createProductVariant.tsx"));
const EditProductVariant = lazy(() => import("@eCommerceModule/clients/panel/private/productVariants/editProductVariant.tsx"));
const AllSavedSearches = lazy(() => import("@eCommerceModule/clients/panel/private/savedSearches/index.tsx"));
const CreateSavedSearch = lazy(() => import("@eCommerceModule/clients/panel/private/savedSearches/createSavedSearch.tsx"));
const EditSavedSearch = lazy(() => import("@eCommerceModule/clients/panel/private/savedSearches/editSavedSearch.tsx"));
const AllProductReviews = lazy(() => import("@eCommerceModule/clients/panel/private/productReviews/index.tsx"));
const CreateProductReview = lazy(() => import("@eCommerceModule/clients/panel/private/productReviews/createProductReview.tsx"));
const EditProductReview = lazy(() => import("@eCommerceModule/clients/panel/private/productReviews/editProductReview.tsx"));
const AllCustomerAddresses = lazy(() => import("@eCommerceModule/clients/panel/private/customerAddresses/index.tsx"));
const AllPosPaymentMethods = lazy(() => import("@eCommerceModule/clients/panel/private/posPaymentMethods/index.tsx"));
const CreatePosPaymentMethod = lazy(() => import("@eCommerceModule/clients/panel/private/posPaymentMethods/createPosPaymentMethod.tsx"));
const EditPosPaymentMethod = lazy(() => import("@eCommerceModule/clients/panel/private/posPaymentMethods/editPosPaymentMethod.tsx"));
const AllPosConfigs = lazy(() => import("@eCommerceModule/clients/panel/private/posConfigs/index.tsx"));
const CreatePosConfig = lazy(() => import("@eCommerceModule/clients/panel/private/posConfigs/createPosConfig.tsx"));
const EditPosConfig = lazy(() => import("@eCommerceModule/clients/panel/private/posConfigs/editPosConfig.tsx"));
const AllPosSessions = lazy(() => import("@eCommerceModule/clients/panel/private/posSessions/index.tsx"));
const AllPosOrders = lazy(() => import("@eCommerceModule/clients/panel/private/posOrders/index.tsx"));
const PosTill = lazy(() => import("@eCommerceModule/clients/panel/private/pos/index.tsx"));

function safeDecode(value: string | null): string | undefined {
    if (value == null || value === "") return undefined;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

const eCommerceRouteConfigContribution: RouteConfigContribution = {
    id: "eCommerce",
    order: 40,
    contributeRoutes({
        menu,
        subview,
        segments,
        searchParams,
    }: RouteConfigArgs) {
        if (menu === "tenancy" && subview === "systemSettings") {
            const resource = segments[2];
            const action = segments[3];
            if (resource === "categories") {
                const categoryId = searchParams.get("categoryId") || undefined;
                const categoryName = safeDecode(searchParams.get("categoryName")) || undefined;
                if (action === "create") return <CreateCategory />;
                if (action === "edit" && categoryId) {
                    return <EditCategory entityId={categoryId} entityName={categoryName} />;
                }
                return <AllCategories />;
            }
            if (resource === "posconfigs") {
                const posConfigId = searchParams.get("posConfigId") || undefined;
                if (action === "create") return <CreatePosConfig />;
                if (action === "edit" && posConfigId) return <EditPosConfig entityId={posConfigId} />;
                return <AllPosConfigs />;
            }
            if (resource === "pospaymentmethods") {
                const posPaymentMethodId = searchParams.get("posPaymentMethodId") || undefined;
                if (action === "create") return <CreatePosPaymentMethod />;
                if (action === "edit" && posPaymentMethodId) return <EditPosPaymentMethod entityId={posPaymentMethodId} />;
                return <AllPosPaymentMethods />;
            }
            if (resource === "customergroups") {
                const customerGroupId = searchParams.get("customerGroupId") || undefined;
                if (action === "create") return <CreateCustomerGroup />;
                if (action === "edit" && customerGroupId) return <EditCustomerGroup entityId={customerGroupId} />;
                return <AllCustomerGroups />;
            }
            if (resource === "customeraddresses") return <AllCustomerAddresses />;
            if (resource === "discounts") {
                const discountId = searchParams.get("discountId") || undefined;
                if (action === "create") return <CreateDiscount />;
                if (action === "edit" && discountId) return <EditDiscount entityId={discountId} />;
                return <AllDiscounts />;
            }
            if (resource === "pricingrules") {
                const pricingRuleId = searchParams.get("pricingRuleId") || undefined;
                if (action === "create") return <CreatePricingRule />;
                if (action === "edit" && pricingRuleId) return <EditPricingRule entityId={pricingRuleId} />;
                return <AllPricingRules />;
            }
            if (resource === "warehouses") {
                const warehouseId = searchParams.get("warehouseId") || undefined;
                if (action === "create") return <CreateWarehouse />;
                if (action === "edit" && warehouseId) return <EditWarehouse entityId={warehouseId} />;
                return <AllWarehouses />;
            }
            if (resource === "productattributes") {
                const attributeId = searchParams.get("attributeId") || undefined;
                if (action === "create") return <CreateProductAttribute />;
                if (action === "edit" && attributeId) return <EditProductAttribute entityId={attributeId} />;
                return <AllProductAttributes />;
            }
            if (resource === "shippingzones") {
                const shippingZoneId = searchParams.get("shippingZoneId") || undefined;
                if (action === "create") return <CreateShippingZone />;
                if (action === "edit" && shippingZoneId) return <EditShippingZone entityId={shippingZoneId} />;
                return <AllShippingZones />;
            }
            if (resource === "taxzones") {
                const taxZoneId = searchParams.get("taxZoneId") || undefined;
                if (action === "create") return <CreateTaxZone />;
                if (action === "edit" && taxZoneId) return <EditTaxZone entityId={taxZoneId} />;
                return <AllTaxZones />;
            }
            if (resource === "productvariants") {
                const productVariantId = searchParams.get("productVariantId") || undefined;
                const productVariantTitle = safeDecode(searchParams.get("productVariantTitle")) || undefined;
                if (action === "create") return <CreateProductVariant />;
                if (action === "edit" && productVariantId) {
                    return <EditProductVariant entityId={productVariantId} entityName={productVariantTitle} />;
                }
                return <AllProductVariants />;
            }
            if (resource === "collections") {
                const collectionId = searchParams.get("collectionId") || undefined;
                const collectionName = safeDecode(searchParams.get("collectionName")) || undefined;
                if (action === "create") return <CreateCollection />;
                if (action === "edit" && collectionId) {
                    return <EditCollection entityId={collectionId} entityName={collectionName} />;
                }
                return <AllCollections />;
            }
            if (resource === "cmsblocks") {
                const cmsBlockId = searchParams.get("cmsBlockId") || undefined;
                if (action === "create") return <CreateCmsBlock />;
                if (action === "edit" && cmsBlockId) return <EditCmsBlock entityId={cmsBlockId} />;
                return <AllCmsBlocks />;
            }
            if (resource === "odooconnection") {
                return <OdooConnectionPage />;
            }
            if (resource === "odooimport") {
                return <OdooImportPage />;
            }
            return undefined;
        }

        if (menu !== "eCommerce") {
            return undefined;
        }

        const resource = subview;
        const action = segments[2];
        const productId = searchParams.get("productId") || undefined;
        const productTitle = safeDecode(searchParams.get("productTitle")) || undefined;
        const inventoryId = searchParams.get("inventoryId") || undefined;
        const inventoryTitle = safeDecode(searchParams.get("inventoryTitle")) || undefined;
        if (resource === "systemmap") {
            return <SystemMap />;
        }
        if (resource === "pos") {
            return <PosTill />;
        }
        if (resource === "possessions") {
            return <AllPosSessions />;
        }
        if (resource === "posorders") {
            return <AllPosOrders />;
        }
        if (resource === "products") {
            if (action === "create") return <CreateProduct />;
            if (action === "edit" && productId) return <EditProduct entityId={productId} entityName={productTitle} />;
            return <AllProducts />;
        }
        if (resource === "inventories") {
            if (action === "create") return <CreateInventory />;
            if (action === "edit" && inventoryId) return <EditInventory entityId={inventoryId} entityName={inventoryTitle} />;
            return <AllInventories />;
        }
        if (resource === "inventorymovements") {
            return <AllInventoryMovements />;
        }
        if (resource === "stocktransfers") {
            const stockTransferId = searchParams.get("stockTransferId") || undefined;
            if (action === "create") return <CreateStockTransfer />;
            if (action === "edit" && stockTransferId) return <EditStockTransfer entityId={stockTransferId} />;
            return <AllStockTransfers />;
        }
        if (resource === "stockcounts") {
            const stockCountId = searchParams.get("stockCountId") || undefined;
            if (action === "create") return <CreateStockCount />;
            if (action === "edit" && stockCountId) return <EditStockCount entityId={stockCountId} />;
            return <AllStockCounts />;
        }
        if (resource === "productorders") {
            return <AllProductOrders />;
        }
        if (resource === "analytics") {
            return <ECommerceAnalytics />;
        }
        if (resource === "odooimport") {
            return <OdooImportPage />;
        }
        if (resource === "fulfillments") {
            const fulfillmentId = searchParams.get("fulfillmentId") || undefined;
            if (action === "create") return <CreateFulfillment />;
            if (action === "edit" && fulfillmentId) return <EditFulfillment entityId={fulfillmentId} />;
            return <AllFulfillments />;
        }
        if (resource === "returnrequests") {
            const returnRequestId = searchParams.get("returnRequestId") || undefined;
            if (action === "create") return <CreateReturnRequest />;
            if (action === "edit" && returnRequestId) return <EditReturnRequest entityId={returnRequestId} />;
            return <AllReturnRequests />;
        }
        if (resource === "productreviews") {
            const productReviewId = searchParams.get("productReviewId") || undefined;
            const productReviewTitle = safeDecode(searchParams.get("productReviewTitle")) || undefined;
            if (action === "create") return <CreateProductReview />;
            if (action === "edit" && productReviewId) {
                return <EditProductReview entityId={productReviewId} entityName={productReviewTitle} />;
            }
            return <AllProductReviews />;
        }
        if (resource === "savedsearches") {
            const savedSearchId = searchParams.get("savedSearchId") || undefined;
            const savedSearchName = safeDecode(searchParams.get("savedSearchName")) || undefined;
            if (action === "create") return <CreateSavedSearch />;
            if (action === "edit" && savedSearchId) {
                return <EditSavedSearch entityId={savedSearchId} entityName={savedSearchName} />;
            }
            return <AllSavedSearches companyWide />;
        }
        return undefined;
    },
};

export default eCommerceRouteConfigContribution;
