# eCommerce Module (Sinfonia)

Client-side UI for the Arpeggio eCommerce domain: admin panel pages, custom components, sidebar navigation, and dashboard widgets.

Types and validators come from **armonia**; API calls target **maestro** routes under `/api/eCommerce/`.

Enable via `VITE_ENABLED_MODULES=eCommerce` (or leave unset to load all present modules).

## Directory layout

```
eCommerce/
├── apps/shop/                  # Vite shop client (index.html + entry)
├── assets/languages/           # Module i18n (en-US, sq-AL)
├── clients/panel/
│   ├── private/<resource>/     # List, create, edit pages
│   ├── sidebarContribution.tsx
│   ├── routeConfigContribution.tsx
│   ├── widgetContribution.tsx
│   └── tenancySettingsContribution.tsx
├── clients/client/public/      # Buyer storefront pages (shop app)
│   ├── shared/                 # shopLayout, cart/config contexts, product card
│   ├── home/ products/ product/ cart/ checkout/ account/orders/
└── components/
    └── cms/                    # CMS-specific UI
```

## Storefront (shop app)

The buyer-facing storefront is a separate Vite client: run with `VITE_SINFONIA_APP=shop`
(discovered from `src/modules/eCommerce/apps/shop/`). Pages are hand-built
React (no ViewConfig) hitting the public maestro routes `shopProducts`, `shopProduct`,
`shopTaxonomy`, `shopConfig`, `cmsBlock/public`, plus the authenticated cart/checkout
routers. Cart and checkout require a signed-in user (JWT in localStorage — shared origin
with the core app); Stripe checkout renders a Payment Element from the checkout DTO's
`stripeClientSecret` when `shopConfig` returns a publishable key.

## Panel pages

Routes are registered in `routeConfigContribution.tsx` and appear under the **eCommerce** sidebar group.

| Page folder | URL segment | Description |
|-------------|-------------|-------------|
| `products` | `/eCommerce/products` | Product catalog |
| `productVariants` | `/eCommerce/productvariants` | SKU-level variants |
| `productAttributes` | `/tenancy/systemSettings/productattributes` | Configurable attributes |
| `categories` | `/eCommerce/categories` | Categories (also under tenancy systemSettings) |
| `collections` | `/eCommerce/collections` | Merchandising collections |
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

- **Sidebar** (`order: 35`) — "Product Commerce" nav group
- **Routes** (`order: 40`) — maps menu/subview segments to page components
- **Widgets** — dashboard tiles for commerce KPIs
- **Tenancy settings** — eCommerce-specific company configuration tabs

## Path alias

```ts
import AllProducts from "@eCommerceModule/clients/panel/private/products/index.tsx";
```

## Related packages

| Package | Location |
|---------|----------|
| Armonia contracts | [`armonia/src/modules/eCommerce`](../../../armonia/src/modules/eCommerce/README.md) |
| API server | [`maestro/modules/eCommerce`](../../../maestro/modules/eCommerce/README.md) |
