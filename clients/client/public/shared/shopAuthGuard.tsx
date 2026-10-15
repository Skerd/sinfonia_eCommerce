import {Navigate, Outlet, useLocation} from "react-router-dom";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {useShopAuth} from "./shopAuthContext.tsx";

function ShopAuthGuard() {
    const {isAuthenticated, isHydrating} = useShopAuth();
    const location = useLocation();

    if (isHydrating) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        const next = `${location.pathname}${location.search}`;
        return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
    }

    return <Outlet />;
}

export default ShopAuthGuard;
