import {Toaster} from "sonner";
import {Provider} from "react-redux";
import {store} from "@coreModule/helpers/redux/store/generalStore.ts";
import {LanguageProvider} from "@coreModule/helpers/context/providers/language-provider.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ErrorBoundary from "@coreModule/components/custom/errors/errorBoundary.tsx";
import {lazy, Suspense} from "react";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {useIsMobile} from "@coreModule/helpers/hooks/useMobile.tsx";
import {ensureDeviceId} from "@coreModule/helpers/context/localStorage/authenticationStorage.ts";
import ShopLayout from "@eCommerceModule/clients/client/public/shared/shopLayout.tsx";
import {ShopAuthProvider} from "@eCommerceModule/clients/client/public/shared/shopAuthContext.tsx";
import ShopAuthGuard from "@eCommerceModule/clients/client/public/shared/shopAuthGuard.tsx";
import {TooltipProvider} from "@coreModule/components/animate-ui/components/animate/tooltip.tsx";

const HomePage = lazy(() => import("@eCommerceModule/clients/client/public/home/index.tsx"));
const ProductsPage = lazy(() => import("@eCommerceModule/clients/client/public/products/index.tsx"));
const ProductPage = lazy(() => import("@eCommerceModule/clients/client/public/product/index.tsx"));
const CartPage = lazy(() => import("@eCommerceModule/clients/client/public/cart/index.tsx"));
const CheckoutPage = lazy(() => import("@eCommerceModule/clients/client/public/checkout/index.tsx"));
const LoginPage = lazy(() => import("@eCommerceModule/clients/client/public/auth/login/index.tsx"));
const SignUpPage = lazy(() => import("@eCommerceModule/clients/client/public/auth/signup/index.tsx"));
const ActivatePage = lazy(() => import("@eCommerceModule/clients/client/public/auth/activate/index.tsx"));
const ForgotPasswordPage = lazy(() => import("@eCommerceModule/clients/client/public/auth/forgotPassword/index.tsx"));
const ResetPasswordPage = lazy(() => import("@eCommerceModule/clients/client/public/auth/resetPassword/index.tsx"));
const PrivacyPage = lazy(() => import("@eCommerceModule/clients/client/public/legal/privacy/index.tsx"));
const TermsPage = lazy(() => import("@eCommerceModule/clients/client/public/legal/terms/index.tsx"));
const AccountLayout = lazy(() => import("@eCommerceModule/clients/client/public/account/accountLayout.tsx"));
const ProfilePage = lazy(() => import("@eCommerceModule/clients/client/public/account/profile/index.tsx"));
const SecurityPage = lazy(() => import("@eCommerceModule/clients/client/public/account/security/index.tsx"));
const OrdersPage = lazy(() => import("@eCommerceModule/clients/client/public/account/orders/index.tsx"));
const OrderDetailPage = lazy(() => import("@eCommerceModule/clients/client/public/account/orders/orderDetail.tsx"));
const GiftCardsPage = lazy(() => import("@eCommerceModule/clients/client/public/account/giftCards/index.tsx"));
const AddressesPage = lazy(() => import("@eCommerceModule/clients/client/public/account/addresses/index.tsx"));
const NotFoundPage = lazy(() => import("@eCommerceModule/clients/client/public/notFound/index.tsx"));

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
    ensureDeviceId();

    return (
        <Provider store={store}>
            <LanguageProvider>
                <TooltipProvider>
                    <BrowserRouter>
                        <ShopAuthProvider>
                            <Suspense fallback={<Loader />}>
                                <Routes>
                                    <Route element={<ShopLayout />}>
                                        <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                                        <Route path="products" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
                                        <Route path="product" element={<ErrorBoundary><ProductPage /></ErrorBoundary>} />
                                        <Route path="cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
                                        <Route path="checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
                                        <Route path="privacy" element={<ErrorBoundary><PrivacyPage /></ErrorBoundary>} />
                                        <Route path="terms" element={<ErrorBoundary><TermsPage /></ErrorBoundary>} />
                                        <Route path="login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                                        <Route path="login/:platform" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                                        <Route path="signup" element={<ErrorBoundary><SignUpPage /></ErrorBoundary>} />
                                        <Route path="activate/:code" element={<ErrorBoundary><ActivatePage /></ErrorBoundary>} />
                                        <Route path="forgot-password" element={<ErrorBoundary><ForgotPasswordPage /></ErrorBoundary>} />
                                        <Route path="reset-password/:code" element={<ErrorBoundary><ResetPasswordPage /></ErrorBoundary>} />
                                        <Route path="account" element={<ShopAuthGuard />}>
                                            <Route element={<AccountLayout />}>
                                                <Route index element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
                                                <Route path="security" element={<ErrorBoundary><SecurityPage /></ErrorBoundary>} />
                                                <Route path="orders" element={<ErrorBoundary><OrdersPage /></ErrorBoundary>} />
                                                <Route path="orders/:orderId" element={<ErrorBoundary><OrderDetailPage /></ErrorBoundary>} />
                                                <Route path="giftcards" element={<ErrorBoundary><GiftCardsPage /></ErrorBoundary>} />
                                                <Route path="addresses" element={<ErrorBoundary><AddressesPage /></ErrorBoundary>} />
                                            </Route>
                                        </Route>
                                        <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
                                    </Route>
                                </Routes>
                            </Suspense>
                        </ShopAuthProvider>
                    </BrowserRouter>
                </TooltipProvider>
            </LanguageProvider>
            <ToasterContainer />
        </Provider>
    );
}

export default ShopApp;
