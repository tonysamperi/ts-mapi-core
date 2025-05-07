import {SmpLoggerMethods} from "@tonysamperi/logger";
import {FirebaseApp, FirebaseOptions, getApps, initializeApp} from "firebase/app";
import {
    ActionCodeInfo,
    Auth,
    AuthProvider,
    browserLocalPersistence,
    browserSessionPersistence,
    EmailAuthProvider,
    FacebookAuthProvider,
    GoogleAuthProvider,
    IdTokenResult,
    OAuthProvider,
    User,
    UserCredential,
    //
    checkActionCode,
    confirmPasswordReset,
    fetchSignInMethodsForEmail,
    getAuth,
    getRedirectResult,
    reauthenticateWithCredential,
    sendEmailVerification,
    sendPasswordResetEmail,
    setPersistence,
    signInWithCustomToken,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    updatePassword,
    updateProfile
} from "firebase/auth";
//
import {SmpSocialSignInKeys} from "../../shared/common/smp-social-sign-in-keys.enum.js";
import {SmpSocialSignInUxModes} from "../../shared/common/smp-social-sign-in-ux-modes.enum.js";
import {SmpFirebaseErrors} from "../../shared/firebase/smp-firebase-errors.enum.js";
import {SmpFirebaseServiceConfig} from "./smp-firebase-service-config.interface.js";

export class SmpFirebaseService {

    static get INSTANCE(): SmpFirebaseService {
        if (!(this._instance instanceof SmpFirebaseService)) {
            throw Error(`${this.constructor.name} instance doesn't exist! Call ${this.constructor.name}.init first!`);
        }

        return this._instance;
    }

    protected static _instance?: SmpFirebaseService;

    get config(): FirebaseOptions {
        return this._config;
    }

    get enabledSocials(): SmpSocialSignInKeys[] {
        return this._enabledSocials;
    }

    get loggedUser(): User | void {
        if (!this._loggedUser) {
            this._loggedUser = this._readStoredUser();
        }

        return this._auth.currentUser || this._loggedUser || void 0;
    }

    get providersRelation(): Record<string, SmpSocialSignInKeys> {
        return {
            "facebook.com": SmpSocialSignInKeys.FACEBOOK,
            "google.com": SmpSocialSignInKeys.GOOGLE,
            "apple.com": SmpSocialSignInKeys.APPLE
        };
    }

    get socialLoginUXMode(): SmpSocialSignInUxModes {
        return this._socialLoginUxMode;
    }

    get storedUserKey(): string {
        return "firebaseUser";
    }

    protected get _auth(): Auth {
        return getAuth(this._app);
    }


    protected readonly _app: FirebaseApp;
    // protected _appCheck?: AppCheck;
    // protected readonly _auth;
    protected readonly _config: FirebaseOptions;
    protected readonly _enabledSocials: SmpSocialSignInKeys[] = [];
    protected _loggedUser?: User | void;
    protected _logger: SmpLoggerMethods;
    protected _popupErrors: number = 0;
    protected _popupFallsBackToRedirect: boolean;
    protected _providers: Record<SmpSocialSignInKeys, AuthProvider>;
    protected _socialLoginUxMode: SmpSocialSignInUxModes = SmpSocialSignInUxModes.POPUP;

    constructor(firebaseOptions: FirebaseOptions, config: SmpFirebaseServiceConfig) {
        this._config = firebaseOptions;
        this._enabledSocials = config.enabledSocials || [];
        this._socialLoginUxMode = config.socialLoginUxMode || SmpSocialSignInUxModes.POPUP;
        this._popupFallsBackToRedirect = !!config.popupFallsBackToRedirect;
        this._buildProviders();
        this._logger = config.logger || new SmpLoggerMethods();
        this._app = getApps().length ? getApps()[0] : initializeApp(firebaseOptions);
        // TODO: see how we can activate this
        // this.initAppCheck();
        this._watchAuthState();
    }

    // Static

    static init(firebaseOptions: FirebaseOptions, config: SmpFirebaseServiceConfig): SmpFirebaseService {
        if (!this._instance) {
            this._instance = new SmpFirebaseService(firebaseOptions, config);
        }

        return this._instance;
    }

    // Public

    addAuthStateChangedCallback(cb: (userOrNull: User | null) => void): () => void {
        return this._auth.onAuthStateChanged((userOrNull: User | null) => {
            cb(userOrNull || this.loggedUser || null);
        });
    }

    checkActionCode(code: string): Promise<ActionCodeInfo> {
        return checkActionCode(this._auth, code);
    }

    confirmPasswordReset(code: string, newPassword: string): Promise<void> {
        return confirmPasswordReset(this._auth, code, newPassword);
    }

    fetchSignInMethodsForEmail(email: string): Promise<SmpSocialSignInKeys[] | "password"> {
        return fetchSignInMethodsForEmail(this._auth, email).then((list: string[]) =>
            list.map((method: string) => this.providersRelation[method] || method)
        );
    }

    getRedirectResult() {
        return getRedirectResult(this._auth).catch(async (err: any) => {
            await this._expandDifferentCredential(err);

            return Promise.reject(err);
        });
    }

    // Made public to see if we can call this from a useEffect or something
    initAppCheck(): void {
        // this._appCheck = initializeAppCheck(this._app, {
        //     provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_KEY as string),
        //     isTokenAutoRefreshEnabled: true
        // } as AppCheckOptions);
    }

    sendEmailVerification(url?: string): Promise<void> | never {
        if (!this.loggedUser) {
            throw Error("Firebase: user is not logged!");
        }

        return sendEmailVerification(this.loggedUser, url ? {url} : void 0);
    }

    sendPasswordResetEmail(email: string, continueUrl: string): Promise<void> {
        return sendPasswordResetEmail(this._auth, email, {
            url: continueUrl
        });
    }

    setPersistence(rememberMe: boolean): Promise<void> {
        return setPersistence(this._auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    }

    signInWithCustomToken(customToken: string): Promise<UserCredential> {
        return signInWithCustomToken(this._auth, customToken);
    }

    signInWithEmailAndPassword(email: string, password: string): Promise<User> {
        return signInWithEmailAndPassword(this._auth, email, password).then(async (userCredential) => userCredential.user);
    }

    signInWithSocialProvider(key: SmpSocialSignInKeys): Promise<User | void> {
        if (!this._providers[key]) {
            throw Error(`Firebase: invalid social key provided! Expected one of ${this.enabledSocials}, got ${key}`);
        }

        return this._signInWithProvider(this._providers[key]!);
    }

    signOut(): Promise<void> {
        return signOut(this._auth);
    }

    updatePassword(oldPassword: string, newPassword: string) {
        if (!this.loggedUser) {
            throw Error("Firebase: user is not logged!");
        }
        const credentials = EmailAuthProvider.credential(this.loggedUser.email!, oldPassword);

        return reauthenticateWithCredential(this.loggedUser, credentials).then(() =>
            updatePassword(this.loggedUser!, newPassword)
        );
    }

    updateUserProfile(params: { displayName?: string | null; photoURL?: string | null }): Promise<void> {
        if (!this.loggedUser) {
            throw Error("Firebase: user is not logged!");
        }

        return updateProfile(this.loggedUser, params);
    }

    async verifyIdToken(): Promise<IdTokenResult | void> {
        return this._auth.currentUser?.getIdTokenResult();
    }

    // protected

    protected _buildProviders(): void {
        this._providers = this._enabledSocials.reduce((acc, key) => {
            if (key in acc) {
                // eslint-disable-next-line no-self-assign
                acc[key] = acc[key];
            }
            return acc;
        }, {
            [SmpSocialSignInKeys.APPLE]: new OAuthProvider("apple.com"),
            [SmpSocialSignInKeys.FACEBOOK]: new FacebookAuthProvider().setCustomParameters({
                prompt: "select_account"
            }),
            [SmpSocialSignInKeys.GOOGLE]: new GoogleAuthProvider().setCustomParameters({
                prompt: "select_account"
            })
        } as Record<SmpSocialSignInKeys, OAuthProvider>);
    }

    protected async _expandDifferentCredential(err: any): Promise<void> {
        if (err?.code === SmpFirebaseErrors.DIFFERENT_CREDENTIAL) {
            const preferredCredentials = await this.fetchSignInMethodsForEmail(err.customData.email);
            err.code = SmpFirebaseErrors[("DIFFERENT_CREDENTIAL_" + preferredCredentials[0]) as keyof typeof SmpFirebaseErrors];

            throw err;
        }
    }

    protected _readStoredUser(): User | void {
        try {
            const storedUser = localStorage.getItem(this.storedUserKey);
            if (!!storedUser) {
                this._logger?.debug("Firebase: found local user", storedUser);
                const parsedUser = JSON.parse(storedUser);

                return {
                    ...parsedUser,
                    getIdToken: () => Promise.resolve(parsedUser.stsTokenManager.accessToken)
                };
            }
        }
        catch (e: any) {
            this._logger.debug("Firebase: error while getting stored user", e);
        }

        return;
    }

    protected async _signInWithProvider<T extends AuthProvider = AuthProvider>(
        provider: T,
        uxMode: SmpSocialSignInUxModes = this.socialLoginUXMode
    ): Promise<User | void> {
        const method = uxMode === SmpSocialSignInUxModes.POPUP ? signInWithPopup : signInWithRedirect;

        return method(this._auth, provider)
            .then((userCredential: UserCredential) => {
                this._logger.info(`Firebase: signin with provider ${provider.providerId} was successful`);

                return userCredential.user;
            })
            .catch(async (err: any) => {
                if (err?.code === SmpFirebaseErrors.POPUP_BLOCKED) {
                    this._logger.warn(`Firebase: social signin popup blocked (${++this._popupErrors}`);
                    if (this._popupFallsBackToRedirect && this._popupErrors > 1) {
                        this._popupErrors = 0; // Cooldown
                        return this._signInWithProvider(provider, SmpSocialSignInUxModes.REDIRECT);
                    }
                }
                this._logger.error(`Firebase: sign in with ${provider.providerId} errored`, err);
                await this._expandDifferentCredential(err);

                return Promise.reject(err);
            });
    }

    protected _updateLocalUser(user: User | void): void {
        try {
            if (user) {
                localStorage.setItem(this.storedUserKey, JSON.stringify(user));
            }
            else {
                localStorage.removeItem(this.storedUserKey);
            }
            this._logger.debug("Firebase: updating local user", user);
            this._loggedUser = user;
        }
        catch (error) {
            this._logger.warn("Firebase: couldn't update local user", {
                user,
                error
            });
        }
    }

    protected _watchAuthState(): void {
        this._auth.onAuthStateChanged((user: User | null) => {
            this._logger.debug("Firebase: firebase detected auth state change", user);
            this._updateLocalUser(user || void 0);
        });
    }
}
