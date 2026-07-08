import AllCategories from "@eCommerceModule/clients/panel/private/categories";
import CreateCategory from "@eCommerceModule/clients/panel/private/categories/createCategory.tsx";
import EditCategory from "@eCommerceModule/clients/panel/private/categories/editCategory.tsx";
import EscrowDashboard from "@eCommerceModule/clients/panel/private/escrowDashboard";
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
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/clients/panel/moduleContributions/routeConfigContribution.types.ts";

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
            return undefined;
        }

        if (menu !== "eCommerce") {
            return undefined;
        }

        const resource = subview;
        const action = segments[2];
        const productId = searchParams.get("productId") || undefined;
        const productTitle = safeDecode(searchParams.get("productTitle")) || undefined;
        const attributeId = searchParams.get("attributeId") || undefined;
        const warehouseId = searchParams.get("warehouseId") || undefined;
        const inventoryId = searchParams.get("inventoryId") || undefined;
        const inventoryTitle = safeDecode(searchParams.get("inventoryTitle")) || undefined;
        const collectionId = searchParams.get("collectionId") || undefined;
        const collectionTitle = safeDecode(searchParams.get("collectionTitle")) || undefined;
        const discountId = searchParams.get("discountId") || undefined;
        const taxZoneId = searchParams.get("taxZoneId") || undefined;
        const shippingZoneId = searchParams.get("shippingZoneId") || undefined;
        const cmsBlockId = searchParams.get("cmsBlockId") || undefined;
        const customerGroupId = searchParams.get("customerGroupId") || undefined;
        const pricingRuleId = searchParams.get("pricingRuleId") || undefined;

        if (resource === "escrowdashboard") {
            return <EscrowDashboard />;
        }
        if (resource === "products") {
            if (action === "create") return <CreateProduct />;
            if (action === "edit" && productId) return <EditProduct entityId={productId} entityName={productTitle} />;
            return <AllProducts />;
        }
        if (resource === "productattributes") {
            if (action === "create") return <CreateProductAttribute />;
            if (action === "edit" && attributeId) return <EditProductAttribute entityId={attributeId} />;
            return <AllProductAttributes />;
        }
        if (resource === "warehouses") {
            if (action === "create") return <CreateWarehouse />;
            if (action === "edit" && warehouseId) return <EditWarehouse entityId={warehouseId} />;
            return <AllWarehouses />;
        }
        if (resource === "inventories") {
            if (action === "create") return <CreateInventory />;
            if (action === "edit" && inventoryId) return <EditInventory entityId={inventoryId} entityName={inventoryTitle} />;
            return <AllInventories />;
        }
        if (resource === "collections") {
            if (action === "create") return <CreateCollection />;
            if (action === "edit" && collectionId) return <EditCollection entityId={collectionId} entityName={collectionTitle} />;
            return <AllCollections />;
        }
        if (resource === "productorders") {
            return <AllProductOrders />;
        }
        if (resource === "discounts") {
            if (action === "create") return <CreateDiscount />;
            if (action === "edit" && discountId) return <EditDiscount entityId={discountId} />;
            return <AllDiscounts />;
        }
        if (resource === "taxzones") {
            if (action === "create") return <CreateTaxZone />;
            if (action === "edit" && taxZoneId) return <EditTaxZone entityId={taxZoneId} />;
            return <AllTaxZones />;
        }
        if (resource === "shippingzones") {
            if (action === "create") return <CreateShippingZone />;
            if (action === "edit" && shippingZoneId) return <EditShippingZone entityId={shippingZoneId} />;
            return <AllShippingZones />;
        }
        if (resource === "cmsblocks") {
            if (action === "create") return <CreateCmsBlock />;
            if (action === "edit" && cmsBlockId) return <EditCmsBlock entityId={cmsBlockId} />;
            return <AllCmsBlocks />;
        }
        if (resource === "customergroups") {
            if (action === "create") return <CreateCustomerGroup />;
            if (action === "edit" && customerGroupId) return <EditCustomerGroup entityId={customerGroupId} />;
            return <AllCustomerGroups />;
        }
        if (resource === "pricingrules") {
            if (action === "create") return <CreatePricingRule />;
            if (action === "edit" && pricingRuleId) return <EditPricingRule entityId={pricingRuleId} />;
            return <AllPricingRules />;
        }
        if (resource === "analytics") {
            return <ECommerceAnalytics />;
        }
        return undefined;
    },
};

export default eCommerceRouteConfigContribution;
