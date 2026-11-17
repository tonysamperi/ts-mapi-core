import {FirebaseOptions} from "firebase/app";
//
import {SmpFirebaseClient} from "./smp-firebase-client.class.js";
import {SmpFirebaseServiceConfig} from "./smp-firebase-service-config.interface.js";

export class SmpFirebaseService extends SmpFirebaseClient {

    static get INSTANCE(): SmpFirebaseService {
        if (!(this._instance instanceof SmpFirebaseService)) {
            throw Error(`SmpFirebaseService instance doesn't exist! Call SmpFirebaseService.init first!`);
        }

        return this._instance;
    }

    protected static _instance?: SmpFirebaseService;

    constructor(firebaseOptions: FirebaseOptions, config: SmpFirebaseServiceConfig) {
        super(firebaseOptions, config);
    }

    static init(firebaseOptions: FirebaseOptions, config: SmpFirebaseServiceConfig): SmpFirebaseService {
        if (!this._instance) {
            this._instance = new SmpFirebaseService(firebaseOptions, config);
        }

        return this._instance;
    }
}
