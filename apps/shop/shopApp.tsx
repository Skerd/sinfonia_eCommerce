import {Toaster} from "sonner";
import {Provider} from "react-redux";
import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {LanguageProvider} from "@coreModule/helpers/context/providers/language-provider.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ErrorBoundary from "@coreModule/components/custom/errorBoundary.tsx";
import {lazy, Suspense} from "react";
import Loader from "@coreModule/components/custom/loader.tsx";
import {useIsMobile} from "@coreModule/helpers/hooks/useMobile.tsx";
import {getLocalStorageValue, setLocalStorageValue} from "@coreModule/helpers/context/localStorage/localStorageProvider.ts";
import {generateUUID} from "@coreModule/helpers/general";
import ShopLayout from "@eCommerceModule/clients/client/public/shared/shopLayout.tsx";
import {sinfoniaRouterBasename} from "@coreModule/helpers/sinfoniaRouterBasename";

const HomePage = lazy(() => import("@eCommerceModule/clients/client/public/home/index.tsx"));
const ProductsPage = lazy(() => import("@eCommerceModule/clients/client/public/products/index.tsx"));
const ProductPage = lazy(() => import("@eCommerceModule/clients/client/public/product/index.tsx"));
const CartPage = lazy(() => import("@eCommerceModule/clients/client/public/cart/index.tsx"));
const CheckoutPage = lazy(() => import("@eCommerceModule/clients/client/public/checkout/index.tsx"));
const OrdersPage = lazy(() => import("@eCommerceModule/clients/client/public/account/orders/index.tsx"));
const GiftCardsPage = lazy(() => import("@eCommerceModule/clients/client/public/account/giftCards/index.tsx"));

function ToasterContainer() {
    const isMobile = useIsMobile();
    return (
        <Toaster
            closeButton
            richColors
            position={isMobile ? "top-right" : "bottom-right"}
            expand={false}
            duration={1500}
        />
    );
}

function ShopApp() {
    const deviceId = getLocalStorageValue("deviceId");
    if (!deviceId) {
        setLocalStorageValue("deviceId", generateUUID());
    }

    return (
        <Provider store={store}>
            <LanguageProvider storageKey="vite-ui-language">
                <BrowserRouter basename={sinfoniaRouterBasename()}>
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            <Route element={<ShopLayout />}>
                                <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                                <Route path="products" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
                                <Route path="product" element={<ErrorBoundary><ProductPage /></ErrorBoundary>} />
                                <Route path="cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
                                <Route path="checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
                                <Route path="account/orders" element={<ErrorBoundary><OrdersPage /></ErrorBoundary>} />
                                <Route path="account/giftcards" element={<ErrorBoundary><GiftCardsPage /></ErrorBoundary>} />
                            </Route>
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </LanguageProvider>
            <ToasterContainer />
        </Provider>
    );
}

export default ShopApp;
