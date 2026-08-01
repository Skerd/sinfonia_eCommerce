import type {AuthPanelContribution} from "@coreModule/clients/panel/moduleContributions/authPanelContribution.types.ts";
import ResetPosManagerPinForm from "@eCommerceModule/clients/panel/public/auth/resetPosManagerPin.form.tsx";

const eCommerceAuthPanelContribution: AuthPanelContribution = {
    id: "eCommerce",
    order: 40,
    panels: {
        resetPosManagerPin: ResetPosManagerPinForm,
    },
};

export default eCommerceAuthPanelContribution;
