import type {HomeContribution} from "@coreModule/helpers/types/homeContribution.types.ts";

/**
 * What a new shop company sets up before it can take customers (D178), in the order it needs them; each
 * step is done once its list has a row. Labels are in this module's `menus.json`.
 */
const contribution: HomeContribution = {
    id: "eCommerce",
    order: 10,
    getSetupSteps: ({resolveLanguageKey: t}) => [
        {
            key: "eCommerce.product",
            title: t("menus.eCommerce.setup.product"),
            to: "/eCommerce/products/create",
            accessModel: "products",
            doneWhen: {list: {url: "/api/eCommerce/product"}},
        },
        {
            key: "eCommerce.shipping",
            title: t("menus.eCommerce.setup.shipping"),
            description: t("menus.eCommerce.setup.shippingHint"),
            to: "/tenancy/systemSettings/shippingzones/create",
            accessModel: "shippingzones",
            doneWhen: {list: {url: "/api/eCommerce/shippingZone"}},
        },
    ],
};

export default contribution;
