import {useEffect, useRef} from "react";
import {useLocation} from "react-router-dom";

function isAccountPath(pathname: string): boolean {
    return pathname === "/account" || pathname.startsWith("/account/");
}

/** Starts every new page at the top (same as the public and dyeus apps). */
function ShopScrollToTop() {
    const {pathname} = useLocation();
    const previousPathname = useRef(pathname);

    useEffect(() => {
        const previous = previousPathname.current;
        previousPathname.current = pathname;
        if (isAccountPath(previous) && isAccountPath(pathname)) {
            return;
        }
        window.scrollTo({top: 0, left: 0, behavior: "auto"});
    }, [pathname]);

    return null;
}

export default ShopScrollToTop;
