import {Navigate, useLocation} from "react-router-dom";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {shopSafeNext, useShopAuth} from "./shopAuthContext.tsx";

function ShopGuestOnly({children}: {children: React.ReactNode}) {
    const {isAuthenticated, isHydrating} = useShopAuth();
    const location = useLocation();

    if (isHydrating) {
        return <Loader />;
    }

    if (isAuthenticated) {
        return <Navigate to={shopSafeNext(location.search)} replace />;
    }

    return children;
}

export default ShopGuestOnly;
