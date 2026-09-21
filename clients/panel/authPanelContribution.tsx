import type {AuthPanelContribution} from "@coreModule/helpers/types/authPanelContribution.types.ts";
import ResetPosManagerPinForm from "@eCommerceModule/clients/panel/public/auth/resetPosManagerPin.form.tsx";

const eCommerceAuthPanelContribution: AuthPanelContribution = {
    id: "eCommerce",
    order: 40,
    panels: {
        resetPosManagerPin: ResetPosManagerPinForm,
    },
};

export default eCommerceAuthPanelContribution;
