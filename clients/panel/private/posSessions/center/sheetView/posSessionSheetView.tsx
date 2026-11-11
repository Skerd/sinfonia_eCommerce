import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hooks/useAccess.ts";
import type {PosSession} from "armonia/src/modules/eCommerce/api/eCommerce/private/posSession/posSession.dto.ts";
import type {DeleteResponse} from "armonia/src/modules/core/types/shared.types.ts";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import SheetNameTitle from "@coreModule/components/entityPage/sheet/sheetNameTitle.tsx";
import StatusBadge from "@coreModule/components/entityPage/sheet/statusBadge.tsx";
import {DATE_FORMATS, formatDate} from "@coreModule/helpers/general/dateTime.ts";
import {useCompanyTimeZone} from "@coreModule/helpers/hooks/useCompanyTimeZone.ts";

export type PosSessionSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity?: PosSession;
    hideActions?: boolean;
    onDelete?: (response?: DeleteResponse) => void;
    onRestore?: () => void;
    fetchId?: string;
};

function PosSessionSheetView({
    open,
    onOpenChange,
    entity: entityProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    fetchId,
}: PosSessionSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(entityProp || {_id: fetchId});
    const access = useAccess("posSessions");
    const viewConfig = useViewConfig("posSessions", "sheet");
    const companyZone = useCompanyTimeZone();

    useEffect(() => {
        if (!entityProp) return;
        setSheetData(entityProp);
    }, [entityProp]);

    const entityId = entityProp?._id ?? fetchId;

    if (!viewConfig) return null;
    if (!entityId) return null;
    const session = sheetData as PosSession;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerce/posSession/single"
            fetchId={fetchId ?? entityProp?._id}
            onDataFetched={(data) => {
                setSheetData(data);
            }}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            // "Front till · 5 Nov 2026" with the session number as a badge, state in tone (UX-01, UX-02).
            headerTitle={<SheetNameTitle name={[session.config?.name, formatDate(session.openedAt, {timeZone: companyZone, format: DATE_FORMATS.mediumDate})].filter(Boolean).join(" · ")} code={session.name} typeLabel={String(resolveLanguageKey("typeLabel"))} />}
            headerDescription={<StatusBadge tableConfigKey="posSessions" field="state" value={session.state} label={String(resolveLanguageKey(`posSessionState.${session.state}`))} />}
            access={access}
            hideActions={hideActions}
            hideEdit
            hideDelete
            hideRestore
            onDelete={onDelete}
            onRestore={onRestore}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/posSessions/center/sheetView/posSessionSheetView.tsx"),
    withDebug(true, true, "posSessions"),
)(PosSessionSheetView);
