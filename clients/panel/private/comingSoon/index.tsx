import {IconDeviceDesktop, IconFileCertificate} from "@tabler/icons-react";
import withLanguage, {type WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import {Badge} from "@coreModule/components/ui/badge.tsx";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@coreModule/components/ui/empty.tsx";

export type ComingSoonFeature = "pos" | "fiscal";

const ICONS = {pos: IconDeviceDesktop, fiscal: IconFileCertificate} as const;
const POINTS = ["point1", "point2", "point3", "point4"] as const;

/**
 * Shown in place of the till and fiscal pages while fiscalization waits for certification (D186): what the feature will
 * do once it opens.
 */
function ComingSoon({feature, resolveLanguageKey}: WithLanguageType & {feature: ComingSoonFeature}) {
    const Icon = ICONS[feature];
    return (
        <div className="flex flex-1 items-center justify-center p-6">
            <Empty className="max-w-3xl gap-6">
                <EmptyHeader className="max-w-2xl gap-3">
                    <EmptyMedia variant="icon" className="size-14 rounded-xl [&_svg:not([class*='size-'])]:size-7">
                        <Icon />
                    </EmptyMedia>
                    <Badge variant="secondary" className="px-3 py-1 text-sm">{resolveLanguageKey("badge")}</Badge>
                    <EmptyTitle className="text-3xl font-semibold">{resolveLanguageKey(`${feature}.title`)}</EmptyTitle>
                    <EmptyDescription className="text-lg">{resolveLanguageKey(`${feature}.description`)}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="max-w-2xl">
                    <ul className="list-disc space-y-2 ps-6 text-start text-base text-muted-foreground">
                        {POINTS.map((point) => (
                            <li key={point}>{resolveLanguageKey(`${feature}.${point}`)}</li>
                        ))}
                    </ul>
                </EmptyContent>
            </Empty>
        </div>
    );
}

export default withLanguage("src/modules/eCommerce/clients/panel/private/comingSoon/index.tsx")(ComingSoon);
