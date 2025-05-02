import {SmpLoggerMethods} from "@tonysamperi/logger";
//
import {SmpSocialSignInKeys} from "../../shared/common/smp-social-sign-in-keys.enum";
import {SmpSocialSignInUxModes} from "../../shared/common/smp-social-sign-in-ux-modes.enum";

export interface SmpFirebaseServiceConfig {
    enabledSocials?: SmpSocialSignInKeys[];
    logger?: SmpLoggerMethods;
    popupFallsBackToRedirect?: boolean;
    socialLoginUxMode?: SmpSocialSignInUxModes;
}
