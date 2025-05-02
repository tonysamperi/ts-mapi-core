export enum SmpFirebaseErrors {
    DIFFERENT_CREDENTIAL = "auth/account-exists-with-different-credential",
    // DIFFERENT_CREDENTIALS_{SmpSocialSignInKeys}: dynamic key for social provider error
    DIFFERENT_CREDENTIAL_APPLE = "auth/account-exists-with-different-credential/apple",
    DIFFERENT_CREDENTIAL_FACEBOOK = "auth/account-exists-with-different-credential/facebook",
    DIFFERENT_CREDENTIAL_GOOGLE = "auth/account-exists-with-different-credential/google",
    EMAIL_EXISTS = "auth/email-already-exists",
    INVALID_ACTION_CODE = "auth/invalid-action-code",
    POPUP_BLOCKED = "auth/popup-blocked",
    POPUP_CLOSED_BY_USER = "auth/popup-closed-by-user",
    USER_NOT_FOUND = "auth/user-not-found",
    WRONG_PASSWORD = "auth/wrong-password",
}
