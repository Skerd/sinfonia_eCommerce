import {useEffect} from "react";
import {useLocation} from "react-router-dom";

/** Starts every new page at the top (same as the public and dyeus apps). */
function ShopScrollToTop() {
    const {pathname} = useLocation();

    useEffect(() => {
        window.scrollTo({top: 0, left: 0, behavior: "auto"});
    }, [pathname]);

    return null;
}

export default ShopScrollToTop;
