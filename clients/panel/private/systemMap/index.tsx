import {useState} from "react";
import {compose} from "redux";
import withLanguage, {type WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@coreModule/components/ui/tabs.tsx";
import {ModelGraph} from "./ModelGraph.tsx";
import {FlowDiagram} from "./FlowDiagram.tsx";
import {CapabilitiesView} from "./CapabilitiesView.tsx";
import {ECOMMERCE_SYSTEM_MAP} from "./systemMap.data.ts";

function SystemMap({resolveLanguageKey}: WithLanguageType) {
    const rk = (key: string) => String(resolveLanguageKey(key) ?? key);
    const [tab, setTab] = useState("models");

    return (
        <div className="flex h-full min-h-0 flex-col gap-4 p-6">
            <header className="shrink-0">
                <h2 className="text-xl font-semibold">{rk("title")}</h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-3xl leading-relaxed">
                    {rk("description")}
                </p>
            </header>

            <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-3">
                <TabsList className="w-fit shrink-0">
                    <TabsTrigger value="models">{rk("tabs.models")}</TabsTrigger>
                    <TabsTrigger value="flows">{rk("tabs.flows")}</TabsTrigger>
                    <TabsTrigger value="capabilities">{rk("tabs.capabilities")}</TabsTrigger>
                </TabsList>

                <TabsContent value="models" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden">
                    <ModelGraph dataset={ECOMMERCE_SYSTEM_MAP} />
                </TabsContent>

                <TabsContent value="flows" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden">
                    <FlowDiagram flows={ECOMMERCE_SYSTEM_MAP.flows} />
                </TabsContent>

                <TabsContent
                    value="capabilities"
                    className="mt-0 flex-1 min-h-0 overflow-y-auto data-[state=inactive]:hidden"
                >
                    <CapabilitiesView capabilities={ECOMMERCE_SYSTEM_MAP.capabilities} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/systemMap/index.tsx"),
    withDebug(true, true),
)(SystemMap);
