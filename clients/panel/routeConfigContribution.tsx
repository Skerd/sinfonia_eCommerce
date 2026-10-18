import AllCategories from "@eCommerceModule/clients/panel/private/categories";
import CreateCategory from "@eCommerceModule/clients/panel/private/categories/createCategory.tsx";
import EditCategory from "@eCommerceModule/clients/panel/private/categories/editCategory.tsx";
import SystemMap from "@eCommerceModule/clients/panel/private/systemMap";
import AllProducts from "@eCommerceModule/clients/panel/private/products/index.tsx";
import CreateProduct from "@eCommerceModule/clients/panel/private/products/createProduct.tsx";
import EditProduct from "@eCommerceModule/clients/panel/private/products/editProduct.tsx";
import AllProductAttributes from "@eCommerceModule/clients/panel/private/productAttributes/index.tsx";
import CreateProductAttribute from "@eCommerceModule/clients/panel/private/productAttributes/createProductAttribute.tsx";
import EditProductAttribute from "@eCommerceModule/clients/panel/private/productAttributes/editProductAttribute.tsx";
import AllWarehouses from "@eCommerceModule/clients/panel/private/warehouses/index.tsx";
import CreateWarehouse from "@eCommerceModule/clients/panel/private/warehouses/createWarehouse.tsx";
import EditWarehouse from "@eCommerceModule/clients/panel/private/warehouses/editWarehouse.tsx";
import AllInventories from "@eCommerceModule/clients/panel/private/inventories/index.tsx";
import CreateInventory from "@eCommerceModule/clients/panel/private/inventories/createInventory.tsx";
import EditInventory from "@eCommerceModule/clients/panel/private/inventories/editInventory.tsx";
import AllInventoryMovements from "@eCommerceModule/clients/panel/private/inventoryMovements/index.tsx";
import AllStockTransfers from "@eCommerceModule/clients/panel/private/stockTransfers/index.tsx";
import CreateStockTransfer from "@eCommerceModule/clients/panel/private/stockTransfers/createStockTransfer.tsx";
import EditStockTransfer from "@eCommerceModule/clients/panel/private/stockTransfers/editStockTransfer.tsx";
import AllStockCounts from "@eCommerceModule/clients/panel/private/stockCounts/index.tsx";
import CreateStockCount from "@eCommerceModule/clients/panel/private/stockCounts/createStockCount.tsx";
import EditStockCount from "@eCommerceModule/clients/panel/private/stockCounts/editStockCount.tsx";
import AllCollections from "@eCommerceModule/clients/panel/private/collections/index.tsx";
import CreateCollection from "@eCommerceModule/clients/panel/private/collections/createCollection.tsx";
import EditCollection from "@eCommerceModule/clients/panel/private/collections/editCollection.tsx";
import AllProductOrders from "@eCommerceModule/clients/panel/private/productOrders/index.tsx";
import AllDiscounts from "@eCommerceModule/clients/panel/private/discounts/index.tsx";
import CreateDiscount from "@eCommerceModule/clients/panel/private/discounts/createDiscount.tsx";
import EditDiscount from "@eCommerceModule/clients/panel/private/discounts/editDiscount.tsx";
import AllTaxZones from "@eCommerceModule/clients/panel/private/taxZones/index.tsx";
import CreateTaxZone from "@eCommerceModule/clients/panel/private/taxZones/createTaxZone.tsx";
import EditTaxZone from "@eCommerceModule/clients/panel/private/taxZones/editTaxZone.tsx";
import AllShippingZones from "@eCommerceModule/clients/panel/private/shippingZones/index.tsx";
import CreateShippingZone from "@eCommerceModule/clients/panel/private/shippingZones/createShippingZone.tsx";
import EditShippingZone from "@eCommerceModule/clients/panel/private/shippingZones/editShippingZone.tsx";
import AllCmsBlocks from "@eCommerceModule/clients/panel/private/cmsBlocks/index.tsx";
import CreateCmsBlock from "@eCommerceModule/clients/panel/private/cmsBlocks/createCmsBlock.tsx";
import EditCmsBlock from "@eCommerceModule/clients/panel/private/cmsBlocks/editCmsBlock.tsx";
import AllCustomerGroups from "@eCommerceModule/clients/panel/private/customerGroups/index.tsx";
import CreateCustomerGroup from "@eCommerceModule/clients/panel/private/customerGroups/createCustomerGroup.tsx";
import EditCustomerGroup from "@eCommerceModule/clients/panel/private/customerGroups/editCustomerGroup.tsx";
import AllPricingRules from "@eCommerceModule/clients/panel/private/pricingRules/index.tsx";
import CreatePricingRule from "@eCommerceModule/clients/panel/private/pricingRules/createPricingRule.tsx";
import EditPricingRule from "@eCommerceModule/clients/panel/private/pricingRules/editPricingRule.tsx";
import ECommerceAnalytics from "@eCommerceModule/clients/panel/private/analytics/index.tsx";
import OdooConnectionPage from "@eCommerceModule/clients/panel/private/odooConnection/index.tsx";
import OdooImportPage from "@eCommerceModule/clients/panel/private/odooImport/index.tsx";
import AllFulfillments from "@eCommerceModule/clients/panel/private/fulfillments/index.tsx";
import CreateFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/createFulfillment.tsx";
import EditFulfillment from "@eCommerceModule/clients/panel/private/fulfillments/editFulfillment.tsx";
import AllReturnRequests from "@eCommerceModule/clients/panel/private/returnRequests/index.tsx";
import CreateReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/createReturnRequest.tsx";
import EditReturnRequest from "@eCommerceModule/clients/panel/private/returnRequests/editReturnRequest.tsx";
import AllProductVariants from "@eCommerceModule/clients/panel/private/productVariants/index.tsx";
import CreateProductVariant from "@eCommerceModule/clients/panel/private/productVariants/createProductVariant.tsx";
import EditProductVariant from "@eCommerceModule/clients/panel/private/productVariants/editProductVariant.tsx";
import AllSavedSearches from "@eCommerceModule/clients/panel/private/savedSearches/index.tsx";
import CreateSavedSearch from "@eCommerceModule/clients/panel/private/savedSearches/createSavedSearch.tsx";
import EditSavedSearch from "@eCommerceModule/clients/panel/private/savedSearches/editSavedSearch.tsx";
import AllProductReviews from "@eCommerceModule/clients/panel/private/productReviews/index.tsx";
import CreateProductReview from "@eCommerceModule/clients/panel/private/productReviews/createProductReview.tsx";
import EditProductReview from "@eCommerceModule/clients/panel/private/productReviews/editProductReview.tsx";
import AllCustomerAddresses from "@eCommerceModule/clients/panel/private/customerAddresses/index.tsx";
import CreateCustomerAddress from "@eCommerceModule/clients/panel/private/customerAddresses/createCustomerAddress.tsx";
import EditCustomerAddress from "@eCommerceModule/clients/panel/private/customerAddresses/editCustomerAddress.tsx";
import AllPosPaymentMethods from "@eCommerceModule/clients/panel/private/posPaymentMethods/index.tsx";
import CreatePosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/createPosPaymentMethod.tsx";
import EditPosPaymentMethod from "@eCommerceModule/clients/panel/private/posPaymentMethods/editPosPaymentMethod.tsx";
import AllPosConfigs from "@eCommerceModule/clients/panel/private/posConfigs/index.tsx";
import CreatePosConfig from "@eCommerceModule/clients/panel/private/posConfigs/createPosConfig.tsx";
import EditPosConfig from "@eCommerceModule/clients/panel/private/posConfigs/editPosConfig.tsx";
import AllPosSessions from "@eCommerceModule/clients/panel/private/posSessions/index.tsx";
import AllPosOrders from "@eCommerceModule/clients/panel/private/posOrders/index.tsx";
import PosTill from "@eCommerceModule/clients/panel/private/pos/index.tsx";
import AllFiscalConfigs from "@eCommerceModule/clients/panel/private/fiscalConfigs/index.tsx";
import CreateFiscalConfig from "@eCommerceModule/clients/panel/private/fiscalConfigs/createFiscalConfig.tsx";
import EditFiscalConfig from "@eCommerceModule/clients/panel/private/fiscalConfigs/editFiscalConfig.tsx";
import AllListings from "@eCommerceModule/clients/panel/private/listings";
import CreateListing from "@eCommerceModule/clients/panel/private/listings/createListing.tsx";
import EditListing from "@eCommerceModule/clients/panel/private/listings/editListing.tsx";
import AllTaskRequests from "@eCommerceModule/clients/panel/private/taskRequests";
import CreateTaskRequest from "@eCommerceModule/clients/panel/private/taskRequests/createTaskRequest.tsx";
import EditTaskRequest from "@eCommerceModule/clients/panel/private/taskRequests/editTaskRequest.tsx";
import AllOrders from "@eCommerceModule/clients/panel/private/orders";
import AllBids from "@eCommerceModule/clients/panel/private/bids";
import CreateBid from "@eCommerceModule/clients/panel/private/bids/createBid.tsx";
import AllBookings from "@eCommerceModule/clients/panel/private/bookings";
import CreateBooking from "@eCommerceModule/clients/panel/private/bookings/createBooking.tsx";
import AllDisputes from "@eCommerceModule/clients/panel/private/disputes";
import CreateDispute from "@eCommerceModule/clients/panel/private/disputes/createDispute.tsx";
import AllReviews from "@eCommerceModule/clients/panel/private/reviews";
import CreateReview from "@eCommerceModule/clients/panel/private/reviews/createReview.tsx";
import AllPromotions from "@eCommerceModule/clients/panel/private/promotions";
import CreatePromotion from "@eCommerceModule/clients/panel/private/promotions/createPromotion.tsx";
import AllListingFlags from "@eCommerceModule/clients/panel/private/listingFlags";
import CreateListingFlag from "@eCommerceModule/clients/panel/private/listingFlags/createListingFlag.tsx";
import EditListingFlag from "@eCommerceModule/clients/panel/private/listingFlags/editListingFlag.tsx";
import AllProviderProfiles from "@eCommerceModule/clients/panel/private/providerProfile";
import EditProviderProfile from "@eCommerceModule/clients/panel/private/providerProfile/editProviderProfile.tsx";
import AllListingAddOns from "@eCommerceModule/clients/panel/private/listingAddOns";
import CreateListingAddOn from "@eCommerceModule/clients/panel/private/listingAddOns/createListingAddOn.tsx";
import EditListingAddOn from "@eCommerceModule/clients/panel/private/listingAddOns/editListingAddOn.tsx";
import AllListingPackages from "@eCommerceModule/clients/panel/private/listingPackages";
import CreateListingPackage from "@eCommerceModule/clients/panel/private/listingPackages/createListingPackage.tsx";
import EditListingPackage from "@eCommerceModule/clients/panel/private/listingPackages/editListingPackage.tsx";
import MarketplaceSystemMap from "@eCommerceModule/clients/panel/private/marketplaceSystemMap";
import AllListingCategories from "@eCommerceModule/clients/panel/private/listingCategories";
import CreateListingCategory from "@eCommerceModule/clients/panel/private/listingCategories/createCategory.tsx";
import EditListingCategory from "@eCommerceModule/clients/panel/private/listingCategories/editCategory.tsx";
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/helpers/types/routeConfigContribution.types.ts";

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
                    return <EditCategory categoryId={categoryId} categoryName={categoryName} />;
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
            if (resource === "customeraddresses") {
                const customerAddressId = searchParams.get("customerAddressId") || undefined;
                if (action === "create") return <CreateCustomerAddress />;
                if (action === "edit" && customerAddressId) return <EditCustomerAddress entityId={customerAddressId} />;
                return <AllCustomerAddresses companyWide />;
            }
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
            if (resource === "fiscalconfigs") {
                const fiscalConfigId = searchParams.get("fiscalConfigId") || undefined;
                if (action === "create") return <CreateFiscalConfig />;
                if (action === "edit" && fiscalConfigId) return <EditFiscalConfig entityId={fiscalConfigId} />;
                return <AllFiscalConfigs />;
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
            if (resource === "listingcategories") {
                const categoryId = searchParams.get("categoryId") || undefined;
                const categoryName = safeDecode(searchParams.get("categoryName")) || undefined;
                if (action === "create") return <CreateListingCategory />;
                if (action === "edit" && categoryId) {
                    return <EditListingCategory categoryId={categoryId} categoryName={categoryName} />;
                }
                return <AllListingCategories />;
            }
            return undefined;
        }

        if (menu === "eCommerceMarketplace") {
            const resource = subview;
            const action = segments[2];
            const listingAddOnId = searchParams.get("listingAddOnId") || undefined;
            const listingPackageId = searchParams.get("listingPackageId") || undefined;
            const listingId = searchParams.get("listingId") || undefined;
            const listingTitle = safeDecode(searchParams.get("listingTitle")) || undefined;
            const taskRequestId = searchParams.get("taskRequestId") || undefined;
            const taskRequestTitle = safeDecode(searchParams.get("taskRequestTitle")) || undefined;
            const listingFlagId = searchParams.get("listingFlagId") || undefined;
            const profileId = searchParams.get("profileId") || undefined;
            const profileName = safeDecode(searchParams.get("profileName")) || undefined;

            if (resource === "marketplacesystemmap") {
                return <MarketplaceSystemMap />;
            }
            if (resource === "listingcategories") {
                const categoryId = searchParams.get("categoryId") || undefined;
                const categoryName = safeDecode(searchParams.get("categoryName")) || undefined;
                if (action === "create") return <CreateListingCategory />;
                if (action === "edit" && categoryId) {
                    return <EditListingCategory categoryId={categoryId} categoryName={categoryName} />;
                }
                return <AllListingCategories />;
            }
            if (resource === "listings") {
                if (action === "create") return <CreateListing />;
                if (action === "edit" && listingId) {
                    return <EditListing entityId={listingId} entityName={listingTitle} />;
                }
                return <AllListings />;
            }
            if (resource === "taskrequests") {
                if (action === "create") return <CreateTaskRequest />;
                if (action === "edit" && taskRequestId) {
                    return <EditTaskRequest entityId={taskRequestId} entityName={taskRequestTitle} />;
                }
                return <AllTaskRequests />;
            }
            if (resource === "orders") {
                return <AllOrders />;
            }
            if (resource === "bids") {
                if (action === "create") return <CreateBid />;
                return <AllBids />;
            }
            if (resource === "bookings") {
                if (action === "create") return <CreateBooking />;
                return <AllBookings />;
            }
            if (resource === "disputes") {
                if (action === "create") return <CreateDispute />;
                return <AllDisputes />;
            }
            if (resource === "reviews") {
                if (action === "create") return <CreateReview />;
                return <AllReviews />;
            }
            if (resource === "promotions") {
                if (action === "create") return <CreatePromotion />;
                return <AllPromotions />;
            }
            if (resource === "listingflags") {
                if (action === "create") return <CreateListingFlag />;
                if (action === "edit" && listingFlagId) return <EditListingFlag entityId={listingFlagId} />;
                return <AllListingFlags />;
            }
            if (resource === "providerprofile") {
                if (action === "edit" && profileId) return <EditProviderProfile entityId={profileId} entityName={profileName} />;
                return <AllProviderProfiles />;
            }
            if (resource === "listingaddons") {
                if (action === "create") return <CreateListingAddOn />;
                if (action === "edit" && listingAddOnId) return <EditListingAddOn entityId={listingAddOnId} />;
                return <AllListingAddOns />;
            }
            if (resource === "listingpackages") {
                if (action === "create") return <CreateListingPackage />;
                if (action === "edit" && listingPackageId) return <EditListingPackage entityId={listingPackageId} />;
                return <AllListingPackages />;
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
