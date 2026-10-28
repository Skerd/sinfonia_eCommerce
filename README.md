# eCommerce Module (Sinfonia)

Client-side UI for the Arpeggio eCommerce domain: product commerce and the services marketplace. Admin panel pages, custom components, sidebar navigation, and dashboard widgets.

Types and validators come from **armonia**; API calls target **maestro** routes under `/api/eCommerce/` and `/api/eCommerceMarketplace/`.

Enable via `VITE_ENABLED_MODULES=eCommerce` (or leave unset to load all present modules). Marketplace panel routes stay under `/eCommerceMarketplace/...`.

## Directory layout

```
eCommerce/
├── assets/languages/           # Module i18n (5 locales)
├── clients/panel/
│   ├── private/<resource>/     # List, create, edit pages
│   ├── sidebarContribution.tsx
│   ├── routeConfigContribution.tsx
│   ├── widgetContribution.tsx
│   └── tenancySettingsContribution.tsx
├── clients/client/public/      # Storefront pages (rendered by the portal under /shop)
│   ├── shared/                 # cart/config contexts, mini cart, cards, shopSiteRoutes
│   ├── product/ service/ provider/ blog/ cart/ checkout/ legal/ account/
├── clients/portal/             # Portal contribution: catalogs, home block, filters, provider
└── components/
    └── cms/                    # CMS-specific UI
```

## Storefront (in the portal)

The storefront has no app of its own: the core `portal` app renders it under `/shop` on every host
(every listed seller on the apex, one company on its own site), inside the portal's shell (navbar,
footer, chat). The contribution in `clients/portal/portalContribution.tsx` adds the product and
service catalogs to the portal home (with `shopProductFilters` / `shopServiceFilters`), the company's
CMS blocks and categories (`shopHome`), the cart in the navbar (`shopMiniCart`) and its state
(`shopSiteProvider`). `/shop/products` and `/shop/services` open that catalog.

Pages are hand-built React (no ViewConfig) on the core shadcn components, hitting the public maestro
routes `shopProducts`, `shopProduct`, `shopTaxonomy`, `shopConfig`, `shopCountries`, `shopStates`,
`shopCities`, `cmsBlock/public`, plus the authenticated cart/checkout routers and the buyer order routes
`productOrder/{my,mySingle}` (which return the buyer DTO, without staff fields). Links start at the
section base (`useSectionBase()`). Copy is translated with `withLanguage` (dictionaries under
`assets/languages/<locale>/clients/client/public/`). A placed order is confirmed on its own page,
`/shop/account/orders/:orderId?placed=1`. Cart and checkout require a signed-in portal account (one
session across the portal zone); Stripe checkout renders a Payment Element from the checkout DTO's
`stripeClientSecret` when `shopConfig` returns a publishable key.

## Panel pages

Routes are registered in `routeConfigContribution.tsx` and appear under the **eCommerce** sidebar group.

| Page folder | URL segment | Description |
|-------------|-------------|-------------|
| `products` | `/eCommerce/products` | Product catalog |
| `productVariants` | `/eCommerce/productvariants` | SKU-level variants |
| `productAttributes` | `/tenancy/systemSettings/productattributes` | Configurable attributes |
| `categories` | `/eCommerce/categories` | Categories (also under tenancy systemSettings) |
| `collections` | `/tenancy/systemSettings/collections` | Merchandising collections |
| `productOrders` | `/eCommerce/productorders` | Orders (confirm / process / ship / cancel / refund actions) |
| `fulfillments` | `/eCommerce/fulfillments` | Shipments and tracking |
| `returnRequests` | `/eCommerce/returnrequests` | Returns, exchanges, refunds |
| `customerAddresses` | `/eCommerce/customeraddresses` | Customer addresses |
| `productReviews` | `/eCommerce/productreviews` | Review moderation (created via storefront, purchase-gated) |
| `inventories` | `/eCommerce/inventories` | Stock levels |
| `warehouses` | `/eCommerce/warehouses` | Warehouses |
| `discounts` | `/tenancy/systemSettings/discounts` | Discounts |
| `taxZones` | `/eCommerce/taxzones` | Tax configuration |
| `shippingZones` | `/eCommerce/shippingzones` | Shipping zones |
| `cmsBlocks` | `/eCommerce/cmsblocks` | CMS blocks |
| `customerGroups` | `/eCommerce/customergroups` | Customer groups |
| `pricingRules` | `/tenancy/systemSettings/pricingrules` | Pricing rules |
| `analytics` | `/eCommerce/analytics` | Analytics dashboard |
| `systemMap` | `/eCommerce/systemmap` | Catalog eCommerce architecture map (models, checkout flow, capabilities) |

Each resource folder typically contains `index.tsx` (list), `create*.tsx`, and `edit*.tsx` pages built on core entity page / view engine primitives.

## Contributions

- **Sidebar** (`order: 35`) — "Product Commerce" and "Marketplace" nav groups
- **Routes** (`order: 40`) — maps `/eCommerce/*` and `/eCommerceMarketplace/*` menu segments to page components
- **Widgets** — sheet/card widgets for catalog and marketplace entities
- **Tenancy settings** — product commerce config plus listing categories

## Path alias

```ts
import AllProducts from "@eCommerceModule/clients/panel/private/products/index.tsx";
```

## Related packages

| Package | Location |
|---------|----------|
| Armonia contracts | [`armonia/src/modules/eCommerce`](../../../armonia/src/modules/eCommerce/README.md) |
| API server | [`maestro/modules/eCommerce`](../../../maestro/modules/eCommerce/README.md) |
