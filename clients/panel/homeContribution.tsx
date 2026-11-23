import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new shop company sets up before it can take customers (D178), in the order it needs them; each
 * step is done once its list has a row. Each step's guide points at the fields that matter most (D179), and the tour
 * shows the pages a shop uses every day. Texts are in this module's `menus.json` (`setup`, `guide`).
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
    // Each stop opens its page: most of these sidebar links sit in a group that stays closed until its page is open.
    // A stop the person may not read is left out; the tour then ends at the last one's page help.
    getTour: ({resolveLanguageKey: t}) => ([
        ["productorders", "productorders"],
        ["fulfillments", "fulfillments"],
        ["inventories", "inventories"],
        ["products", "products"],
    ] as const).map(([page, accessModel]) => ({
        target: `nav:/eCommerce/${page}`,
        to: `/eCommerce/${page}`,
        accessModel,
        // Named as the sidebar names them.
        title: t(`menus.eCommerce.${page}.title`),
        text: t(`menus.eCommerce.guide.tour.${page}`),
    })),
};

export default contribution;
