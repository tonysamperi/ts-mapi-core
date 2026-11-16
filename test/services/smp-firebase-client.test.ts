import {SmpFirebaseClient} from "../../src/services/firebase/smp-firebase-client.class";
import {SmpFirebaseService} from "../../src/services/firebase/smp-firebase.service";

type MockFirebaseApp = {
    name: string;
    options: Record<string, unknown>;
};

type MockFirebaseAuth = {
    currentUser: null;
    onAuthStateChanged: jest.Mock;
    tenantId: string | null;
};

const _apps: MockFirebaseApp[] = [];
const _authByAppName = new Map<string, MockFirebaseAuth>();

const _createAuth = (): MockFirebaseAuth => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(() => () => void 0),
    tenantId: null
});

jest.mock("firebase/app", () => ({
    getApps: jest.fn(() => _apps),
    initializeApp: jest.fn((options: Record<string, unknown>, name?: string) => {
        const app = {
            name: name || "[DEFAULT]",
            options
        };

        _apps.push(app);

        return app;
    })
}));

jest.mock("firebase/auth", () => {
    class MockOAuthProvider {
        providerId: string;

        constructor(providerId: string) {
            this.providerId = providerId;
        }

        setCustomParameters(): this {
            return this;
        }
    }

    return {
        EmailAuthProvider: {
            credential: jest.fn()
        },
        FacebookAuthProvider: class MockFacebookAuthProvider extends MockOAuthProvider {
            constructor() {
                super("facebook.com");
            }
        },
        GoogleAuthProvider: class MockGoogleAuthProvider extends MockOAuthProvider {
            constructor() {
                super("google.com");
            }
        },
        OAuthProvider: MockOAuthProvider,
        browserLocalPersistence: "local",
        browserSessionPersistence: "session",
        checkActionCode: jest.fn(),
        confirmPasswordReset: jest.fn(),
        fetchSignInMethodsForEmail: jest.fn(),
        getAuth: jest.fn((app: MockFirebaseApp) => {
            const existingAuth = _authByAppName.get(app.name);

            if (existingAuth) {
                return existingAuth;
            }

            const auth = _createAuth();
            _authByAppName.set(app.name, auth);

            return auth;
        }),
        getRedirectResult: jest.fn(() => Promise.resolve(null)),
        reauthenticateWithCredential: jest.fn(),
        sendEmailVerification: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        setPersistence: jest.fn(),
        signInWithCustomToken: jest.fn(),
        signInWithEmailAndPassword: jest.fn(),
        signInWithPopup: jest.fn(),
        signInWithRedirect: jest.fn(),
        signOut: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn()
    };
});

const {getAuth, initializeApp} = jest.requireMock("firebase/auth").getAuth
    ? {
        getAuth: jest.requireMock("firebase/auth").getAuth as jest.Mock,
        initializeApp: jest.requireMock("firebase/app").initializeApp as jest.Mock
    }
    : {
        getAuth: jest.fn(),
        initializeApp: jest.fn()
    };

Object.defineProperty(global, "localStorage", {
    value: {
        getItem: jest.fn(() => null),
        removeItem: jest.fn(),
        setItem: jest.fn()
    },
    writable: !0
});

describe("SmpFirebaseClient", () => {
    beforeEach(() => {
        _apps.splice(0, _apps.length);
        _authByAppName.clear();
        getAuth.mockClear();
        initializeApp.mockClear();
        (SmpFirebaseService as unknown as { _instance?: SmpFirebaseService })._instance = void 0;
    });

    it("should isolate firebase app and auth per tenant", () => {
        const firebaseOptions = {
            apiKey: "api-key",
            projectId: "project-id"
        };

        const _clientA = new SmpFirebaseClient(firebaseOptions, {
            tenantId: "tenant-a"
        });
        const _clientB = new SmpFirebaseClient(firebaseOptions, {
            tenantId: "tenant-b"
        });

        expect(_clientA.tenantId).toBe("tenant-a");
        expect(_clientB.tenantId).toBe("tenant-b");
        expect(_clientA.storedUserKey).toBe("firebaseUser::tenant-a");
        expect(_clientB.storedUserKey).toBe("firebaseUser::tenant-b");
        expect(initializeApp).toHaveBeenCalledTimes(2);
        expect(initializeApp.mock.calls[0]?.[1]).toBe("smp_firebase_client_1");
        expect(initializeApp.mock.calls[1]?.[1]).toBe("smp_firebase_client_2");
        expect(getAuth.mock.calls[0]?.[0]).not.toBe(getAuth.mock.calls[1]?.[0]);
    });

    it("should keep the singleton service retrocompatible", () => {
        const firebaseOptions = {
            apiKey: "api-key",
            projectId: "project-id"
        };

        const _serviceA = SmpFirebaseService.init(firebaseOptions, {
            tenantId: "tenant-a"
        });
        const _serviceB = SmpFirebaseService.init(firebaseOptions, {
            tenantId: "tenant-b"
        });

        expect(_serviceA).toBe(_serviceB);
        expect(SmpFirebaseService.INSTANCE).toBe(_serviceA);
        expect(_serviceB.tenantId).toBe("tenant-a");
    });
});
