import {Navigate, useLocation} from "react-router-dom";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import {safeNextPath} from "@coreModule/helpers/publicAuth/safeNextPath.ts";
import {useShopAuth} from "./shopAuthContext.tsx";

function ShopGuestOnly({children}: {children: React.ReactNode}) {
    const {isAuthenticated, isHydrating} = useShopAuth();
    const location = useLocation();

    if (isHydrating) {
        return <Loader />;
    }

    if (isAuthenticated) {
        return <Navigate to={safeNextPath(location.search, "/account")} replace />;
    }

    return children;
}

export default ShopGuestOnly;
