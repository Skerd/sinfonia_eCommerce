import {lazy} from "react";
import {Navigate, Route, Routes, useSearchParams} from "react-router-dom";
import ErrorBoundary from "@coreModule/components/custom/errors/errorBoundary.tsx";
import SitePageLayout from "@coreModule/clients/portal/shared/sitePageLayout.tsx";
import {RequireSession} from "@coreModule/clients/portal/shared/sessionRoutes.tsx";

const ProductPage = lazy(() => import("@eCommerceModule/clients/client/public/product/index.tsx"));
const BlogPage = lazy(() => import("@eCommerceModule/clients/client/public/blog/index.tsx"));
const BlogArticlePage = lazy(() => import("@eCommerceModule/clients/client/public/blog/article.tsx"));
const CartPage = lazy(() => import("@eCommerceModule/clients/client/public/cart/index.tsx"));
const CheckoutPage = lazy(() => import("@eCommerceModule/clients/client/public/checkout/index.tsx"));
const PrivacyPage = lazy(() => import("@eCommerceModule/clients/client/public/legal/privacy/index.tsx"));
const TermsPage = lazy(() => import("@eCommerceModule/clients/client/public/legal/terms/index.tsx"));
const AccountLayout = lazy(() => import("@eCommerceModule/clients/client/public/account/accountLayout.tsx"));
const OrdersPage = lazy(() => import("@eCommerceModule/clients/client/public/account/orders/index.tsx"));
const OrderDetailPage = lazy(() => import("@eCommerceModule/clients/client/public/account/orders/orderDetail.tsx"));
const GiftCardsPage = lazy(() => import("@eCommerceModule/clients/client/public/account/giftCards/index.tsx"));
const AddressesPage = lazy(() => import("@eCommerceModule/clients/client/public/account/addresses/index.tsx"));
const NotFoundPage = lazy(() => import("@eCommerceModule/clients/client/public/notFound/index.tsx"));

/**
 * The shop's browse page is the portal's home catalog. `/products` (which merchants also link
 * to from their CMS blocks) opens it on the product kind, with its category and search.
 */
function ShopCatalog() {
    const [params] = useSearchParams();
    const catalog = new URLSearchParams({kind: "product"});
    const category = params.get("category");
    const search = params.get("search");
    if (category) catalog.set("f.category", category);
    if (search) catalog.set("q", search);
    return <Navigate to={`/?${catalog}`} replace />;
}

/**
 * The shop, under `/shop` on every host: one company's on its own site, every listed
 * seller's on the apex. The cart and its state come from the shell (`ShopSiteProvider`).
 */
export default function ShopSiteRoutes() {
    return (
        <Routes>
            <Route element={<SitePageLayout />}>
                <Route index element={<ShopCatalog />} />
                <Route path="products" element={<ShopCatalog />} />
                <Route path="product" element={<ErrorBoundary><ProductPage /></ErrorBoundary>} />
                <Route path="blog" element={<ErrorBoundary><BlogPage /></ErrorBoundary>} />
                <Route path="blog/:slug" element={<ErrorBoundary><BlogArticlePage /></ErrorBoundary>} />
                <Route path="cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
                <Route path="checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
                <Route path="privacy" element={<ErrorBoundary><PrivacyPage /></ErrorBoundary>} />
                <Route path="terms" element={<ErrorBoundary><TermsPage /></ErrorBoundary>} />
                <Route path="account" element={<RequireSession />}>
                    <Route element={<AccountLayout />}>
                        <Route index element={<Navigate to="orders" replace />} />
                        <Route path="orders" element={<ErrorBoundary><OrdersPage /></ErrorBoundary>} />
                        <Route path="orders/:orderId" element={<ErrorBoundary><OrderDetailPage /></ErrorBoundary>} />
                        <Route path="giftcards" element={<ErrorBoundary><GiftCardsPage /></ErrorBoundary>} />
                        <Route path="addresses" element={<ErrorBoundary><AddressesPage /></ErrorBoundary>} />
                    </Route>
                </Route>
                <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
            </Route>
        </Routes>
    );
}
