import {SmpBrowserCache} from "../../shared/utils/cache/smp-browser-cache.class.js";

export class SmpHttpSessionStorageCache extends SmpBrowserCache {

    constructor() {
        super(sessionStorage, "smp_rest_cache_");
    }
}


