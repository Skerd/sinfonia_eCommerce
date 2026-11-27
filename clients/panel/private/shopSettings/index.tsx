import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import useHttpRequest, {type HttpRequest} from "@coreModule/helpers/hooks/useHttpRequest.ts";
import Loader from "@coreModule/components/custom/loader/loader.tsx";
import SimpleError from "@coreModule/components/custom/errors/errorViewWrapper.tsx";
import type {ShopSettings} from "armonia/src/modules/eCommerce/api/eCommerce/private/shopSettings/shopSettings.dto.ts";
import EditShopSettings from "@eCommerceModule/clients/panel/private/shopSettings/editShopSettings.tsx";

const ENSURE_SETTINGS_REQUEST: HttpRequest = {method: "POST", url: "/api/eCommerce/shopSettings/ensure"};

/** One settings record per shop (P26.8): make sure it exists, then edit What we sell in place. */
function ShopSettingsGate({resolveLanguageKey}: WithLanguageType) {
    const {data: settings, error} = useHttpRequest<ShopSettings>(ENSURE_SETTINGS_REQUEST, {}, 1);
    if (error) return <SimpleError title={String(resolveLanguageKey("loadError"))} />;
    if (!settings) return <Loader />;
    return <EditShopSettings entityId={settings._id} />;
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/shopSettings/index.tsx"),
    withDebug(true, true, "shopsettings"),
)(ShopSettingsGate);
