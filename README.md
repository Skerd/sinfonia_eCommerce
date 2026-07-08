# eCommerce Module (Sinfonia)

Client-side UI for the Arpeggio eCommerce domain: admin panel pages, custom components, sidebar navigation, and dashboard widgets.

Types and validators come from **armonia**; API calls target **maestro** routes under `/api/eCommerce/`.

Enable via `VITE_ENABLED_MODULES=eCommerce` (or leave unset to load all present modules).

## Directory layout

```
eCommerce/
├── assets/languages/           # Module i18n (en-US, sq-AL)
├── clients/panel/
│   ├── private/<resource>/     # List, create, edit pages
│   ├── sidebarContribution.tsx
│   ├── routeConfigContribution.tsx
│   ├── widgetContribution.tsx
│   └── tenancySettingsContribution.tsx
└── components/
    └── cms/                    # CMS-specific UI
```

## Panel pages

Routes are registered in `routeConfigContribution.tsx` and appear under the **eCommerce** sidebar group.

| Page folder | URL segment | Description |
|-------------|-------------|-------------|
| `products` | `/eCommerce/products` | Product catalog |
| `productAttributes` | `/eCommerce/productattributes` | Configurable attributes |
| `categories` | `/eCommerce/categories` | Categories |
| `collections` | `/eCommerce/collections` | Merchandising collections |
| `productOrders` | `/eCommerce/productorders` | Orders |
| `inventories` | `/eCommerce/inventories` | Stock levels |
| `warehouses` | `/eCommerce/warehouses` | Warehouses |
| `discounts` | `/eCommerce/discounts` | Discounts |
| `taxZones` | `/eCommerce/taxzones` | Tax configuration |
| `shippingZones` | `/eCommerce/shippingzones` | Shipping zones |
| `cmsBlocks` | `/eCommerce/cmsblocks` | CMS blocks |
| `customerGroups` | `/eCommerce/customergroups` | Customer groups |
| `pricingRules` | `/eCommerce/pricingrules` | Pricing rules |
| `analytics` | `/eCommerce/analytics` | Analytics dashboard |
| `escrowDashboard` | `/eCommerce/escrowdashboard` | Escrow overview |

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
