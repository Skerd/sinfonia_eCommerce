import type {PanelLayoutContribution} from "@coreModule/helpers/types/panelLayoutContribution.types.ts";

const eCommercePanelLayoutContribution: PanelLayoutContribution = {
    id: "eCommerce",
    order: 35,
    getCenterPanelClassName({menu, subview}) {
        if (menu === "eCommerce" && subview === "pos") {
            return "overflow-hidden";
        }
        return undefined;
    },
};

export default eCommercePanelLayoutContribution;
