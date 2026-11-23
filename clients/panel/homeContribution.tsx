import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new shop company sets up before it can take customers (D178), in the order it needs them; each
 * step is done once its list has a row. Each step's guide points at the fields that matter most (D179), and the tour
 * walks every page of the module (D180). Texts are in this module's `menus.json` (`setup`, `guide`).
 */
const contribution: HomeContribution = {
    id: "eCommerce",
    order: 10,
    getSetupSteps: ({resolveLanguageKey: t}) => {
        const tip = (target: string, name: string) => ({
            target,
            title: t(`menus.eCommerce.guide.${name}Title`),
            text: t(`menus.eCommerce.guide.${name}Text`),
        });
        const save = {target: "form.save", title: t("home.guide.saveTitle"), text: t("home.guide.saveText")};
        return [
            // Stock is kept per warehouse (TD-F150): a new shop needs one before it can stock a tracked product.
            {
                key: "eCommerce.warehouse",
                title: t("menus.eCommerce.setup.warehouse"),
                description: t("menus.eCommerce.setup.warehouseHint"),
                to: "/tenancy/systemSettings/warehouses/create",
                accessModel: "warehouses",
                doneWhen: {list: {url: "/api/eCommerce/warehouse"}},
                guide: [tip("field.name", "warehouseName"), tip("field.code", "warehouseCode"), tip("field.address.country", "warehouseAddress"), save],
            },
            {
                key: "eCommerce.product",
                title: t("menus.eCommerce.setup.product"),
                to: "/eCommerce/products/create",
                accessModel: "products",
                doneWhen: {list: {url: "/api/eCommerce/product"}},
                guide: [
                    tip("field.title", "productTitle"),
                    tip("field.mainImage", "productImage"),
                    tip("field.price", "productPrice"),
                    tip("field.trackInventory", "productStock"),
                    tip("field.publishedAt", "productPublish"),
                    save,
                ],
            },
            {
                key: "eCommerce.shipping",
                title: t("menus.eCommerce.setup.shipping"),
                description: t("menus.eCommerce.setup.shippingHint"),
                to: "/tenancy/systemSettings/shippingzones/create",
                accessModel: "shippingzones",
                doneWhen: {list: {url: "/api/eCommerce/shippingZone"}},
                guide: [
                    tip("field.name", "shippingName"),
                    tip("field.countries", "shippingCountries"),
                    tip("field.states", "shippingRegions"),
                    tip("field.rates", "shippingRates"),
                    save,
                ],
            },
        ];
    },
    // Every page of the module, orders first, each explained by its own ⓘ help (D180); a page the person may not read is
    // left out. Analytics and customer addresses read through the orders, so they need the orders. The Odoo connection
    // and import are left out: a one-off move from Odoo, not part of running the shop.
    getTour: ({resolveLanguageKey: t}) => [
        {
            target: "page.help",
            to: "/eCommerce/productorders",
            accessModel: "productorders",
            title: t("menus.eCommerce.guide.tour.introTitle"),
            text: t("menus.eCommerce.guide.tour.introText"),
        },
        ...([
            ["/eCommerce/productorders", "productorders"],
            ["/eCommerce/fulfillments", "fulfillments"],
            ["/eCommerce/returnrequests", "returnrequests"],
            ["/eCommerce/pos", "posorders"],
            ["/eCommerce/posorders", "posorders"],
            ["/eCommerce/possessions", "possessions"],
            ["/eCommerce/products", "products"],
            ["/eCommerce/inventories", "inventories"],
            ["/eCommerce/inventorymovements", "inventorymovements"],
            ["/eCommerce/stocktransfers", "stocktransfers"],
            ["/eCommerce/stockcounts", "stockcounts"],
            ["/eCommerce/productreviews", "productreviews"],
            ["/eCommerce/savedsearches", "savedsearches"],
            ["/eCommerce/analytics", "productorders"],
            ["/tenancy/systemSettings/categories", "productcategories"],
            ["/tenancy/systemSettings/productattributes", "productattributes"],
            ["/tenancy/systemSettings/productvariants", "productvariants"],
            ["/tenancy/systemSettings/collections", "productcollections"],
            ["/tenancy/systemSettings/customergroups", "customergroups"],
            ["/tenancy/systemSettings/customeraddresses", "productorders"],
            ["/tenancy/systemSettings/discounts", "discounts"],
            ["/tenancy/systemSettings/giftcards", "giftcards"],
            ["/tenancy/systemSettings/pricingrules", "pricingrules"],
            ["/tenancy/systemSettings/taxzones", "taxzones"],
            ["/tenancy/systemSettings/shippingzones", "shippingzones"],
            ["/tenancy/systemSettings/warehouses", "warehouses"],
            ["/tenancy/systemSettings/cmsblocks", "cmsblocks"],
            ["/tenancy/systemSettings/posconfigs", "posconfigs"],
            ["/tenancy/systemSettings/pospaymentmethods", "pospaymentmethods"],
            ["/tenancy/systemSettings/fiscalconfigs", "fiscalconfigs"],
        ] as const).map(([page, accessModel]) => ({page, accessModel})),
    ],
};

export default contribution;
