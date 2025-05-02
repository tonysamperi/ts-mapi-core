import {smpAsciiWords} from "./smp-ascii-words.function.js";
import {SmpUnicodeWords} from "./smp-unicode-words.class.js";
import {SmpRestVerbs} from "../api/smp-rest-verbs.enum.js";

export class SmpCommonUtils {
    /**
     * Removes items the predicate returns truthy for from the source array and returns them
     */
    static arrayRemove<T = any>(array: T[], iteratee: (item: T, index: number) => any): T[] {
        // in order to not mutate the original array until the very end, we want to cache the indexes to remove while preparing the result to return
        const toRemove: number[] = [];
        const result = array.filter((item, index) => iteratee(item, index) && toRemove.push(index));
        // just before returning, we can then remove the items, making sure we start from the higher indexes: otherwise they would shift at each removal
        toRemove.reverse().forEach((i) => array.splice(i, 1));

        return result;
    }

    static assertIsArray<T>(entity: T[], withMessage?: string): asserts entity is T[] {
        if (!Array.isArray(entity)) {
            throw new Error(withMessage || "KikCommonUtils => val was not an array");
        }
    }

    static assertIsBoolean(entity: any, withMessage?: string): asserts entity is boolean {
        if (!this.isBoolean(entity)) {
            throw new Error(withMessage || "KikCommonUtils => val was not boolean");
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    static assertIsFunction(entity: any, withMessage?: string): asserts entity is Function {
        if (!this.isFunction(entity)) {
            throw new Error(withMessage || "KikCommonUtils => entity was not a function");
        }
    }

    static assertIsInstance(
        entity: any,
        klass: new (...args: any[]) => any,
        withMessage?: string
    ): asserts entity is typeof klass {
        if (!(entity instanceof klass)) {
            throw new Error(withMessage || "KikCommonUtils => val was not instance of class");
        }
    }

    static assertIsNotEmpty(val: any, withMessage?: string): void {
        if (this.isEmpty(val)) {
            throw new Error(withMessage || "KikCommonUtils => entity was empty");
        }
    }

    static assertIsNumber(entity: any, withMessage?: string): asserts entity is number {
        if (typeof entity !== typeof 0) {
            throw new Error(withMessage || "KikCommonUtils => val was not numeric");
        }
    }

    static assertIsNumeric(entity: any, withMessage?: string): void {
        if (!this.isNumeric(entity)) {
            throw new Error(withMessage || "KikCommonUtils => val was not numeric");
        }
    }

    static assertIsObject(entity: any, withMessage?: string): asserts entity is object {
        if (!this.isObject(entity)) {
            throw new Error(withMessage || "KikCommonUtils => val was not an object");
        }
    }

    static assertIsString(entity: any, withMessage?: string): asserts entity is string {
        if (!this.isString(entity)) {
            throw new Error(withMessage || "KikCommonUtils => val was not a string");
        }
    }

    static assertIsTruthy<T>(condition: T, withMessage?: string): asserts condition {
        if (!condition) {
            throw new Error(withMessage || "KikCommonUtils => condition wasn't truthy");
        }
    }

    static buildPath(...args: any[]): string {
        const result = args
            .filter((a) => !!a)
            .join("/")
            // .replace(/(?:([^:])|^)\/\//g, "$1/");
            .replace(/(?<!:)\/\/+/g, "/");

        return result.startsWith("http") && !result.endsWith("/") ? `${result}/` : result;
    }

    static downloadBlob(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
    }

    static generateRandomHexString(length: number = 12): string {
        const chars = "0123456789abcdef";
        let hexString = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            hexString += chars[randomIndex];
        }

        return hexString;
    }

    static generateUUID(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;

            return v.toString(16);
        });
    }

    static getDecimalPrecision(val: number | string): number {
        this.assertIsNumeric(val);
        if (!isFinite(+val)) {
            return 0;
        }
        let factor = 1,
            precision = 0;
        while (Math.round(+val * factor) / factor !== val) {
            factor *= 10;
            precision++;
        }
        return precision;
    }

    /**
     * More accurately check the type of JavaScript object
     * @param  {Object} entity The object
     * @return {String}     The object type
     */
    static getType(entity: any): string {
        return Object.prototype.toString.call(entity).slice(8, -1).toLowerCase();
    }

    static isBoolean(value: any): value is boolean {
        return typeof value === typeof !0;
    }

    /**
     * Returns true if string is a valid CSS color
     * @param str
     */
    static isColor(str: string): boolean {
        if (!str || !this.isString(str)) {
            return !1;
        }
        const s = new Option().style;
        s.color = str;

        return s.color !== "";
    }

    static isEmpty(entity: any): boolean {
        return !entity && entity !== 0;
    }

    /**
     *
     * @param value1 {any} first term of comparison
     * @param value2 {any} second term of comparison
     *
     * @returns boolean
     */
    static isEqual(value1: any, value2: any): boolean {
        function areArraysEqual() {
            // Check length
            if (value1.length !== value2.length) {
                return false;
            }
            // Check each item in the array
            for (let i = 0; i < value1.length; i++) {
                if (!SmpCommonUtils.isEqual(value1[i], value2[i])) {
                    return false;
                }
            }

            return true;
        }

        function areObjectsEqual() {
            if (Object.keys(value1).length !== Object.keys(value2).length) {
                return false;
            }

            // Check each item in the object
            for (const key in value1) {
                if (Object.prototype.hasOwnProperty.call(value1, key)) {
                    if (!SmpCommonUtils.isEqual(value1[key], value2[key])) {
                        return false;
                    }
                }
            }

            return true;
        }

        function areFunctionsEqual() {
            return value1.toString() === value2.toString();
        }

        function arePrimativesEqual() {
            return value1 === value2;
        }

        // Get the object type
        const type = this.getType(value1);

        // If the two items are not the same type, return false
        if (type !== this.getType(value2)) {
            return false;
        }

        // Compare based on type
        if (type === "array") {
            return areArraysEqual();
        }
        if (type === "object") {
            return areObjectsEqual();
        }
        if (type === "function") {
            return areFunctionsEqual();
        }
        return arePrimativesEqual();
    }

    static isFormField(el: HTMLElement): boolean {
        return /^(?:input|select|textarea|button)$/i.test(el.nodeName);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    static isFunction(entity: any): entity is Function {
        return typeof entity === typeof isNaN;
    }

    static isNotEmpty(entity: any): boolean {
        return !this.isEmpty(entity);
    }

    /**
     * Returns true if the entity is a number
     * @param entity
     */
    static isNumber(entity: any): entity is number {
        return typeof entity === typeof 0 && this.isNumeric(entity);
    }

    /**
     * Returns true whether you're dealing with a numeric entity. Use isNumber if you want exact type check
     * @param entity
     */
    static isNumeric(entity: any): boolean {
        return !isNaN(entity);
    }

    static isObject(entity: any): entity is object {
        return !!entity && entity === Object(entity) && entity.constructor === Object;
    }

    /**
     * This one is from underscore.js 1.13.6
     * It basically checks if a value is generically an object (meaning Array, Date, Map).
     * If you want a strict check use KikCommonUtils.isObject instead.
     * [TS] TODO: It would be nice to exclude String, Number, Boolean and Symbol, but for now, this will do
     * @param entity
     * @returns {boolean}
     */
    static isPrimitive(entity: any): boolean {
        const type = this.getType(entity);
        return type !== "function" && (type !== "object" || !entity);

        // Possible solution => Object.prototype.toString.call(val)
        // This always returns [Object myType], so we could compare with a list of primitive types: ["number", "string", "symbol", "ecc.."]
    }

    static isString(entity: any): entity is string {
        return typeof entity === typeof "";
    }

    static isWindows(): boolean {
        return navigator.userAgent.toLowerCase().includes("win");
    }

    /**
     *
     * @param objLike object or array
     * @param iteratee the map fn
     */
    static mapObject<T = any>(objLike: any, iteratee: (v: any, indexOrKey: string | number, arr?: string[]) => any): T[] {
        this.assertIsFunction(iteratee, `CommonUtils => expected type of iteratee to be Function, got ${typeof iteratee}`);
        if (this.isObject(objLike)) {
            return Object.entries(objLike).reduce((acc: T[], [key, value]) => {
                acc.push(iteratee(value, key));

                return acc;
            }, []);
        }
        if (Array.isArray(objLike)) {
            return objLike.map(iteratee);
        }
        throw new Error(`CommonUtils => invalid object provided. Expected Object or Array, got ${typeof iteratee}`);
    }

    static mapObjectKeys<T extends string = string>(
        obj: Record<T, any>,
        callback: (key: string, value: any) => any
    ): Record<string, any> {
        return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
            acc[key] = callback.call(null, key, value);

            return acc;
        }, {});
    }

    static mapObjectValues<T extends string = string>(
        obj: Partial<Record<T, any>>,
        callback: (value: any, key: string) => any
    ): Record<string, any> {
        if (!this.isObject(obj)) {
            return {};
        }

        return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
            acc[key] = callback.call(null, value, key);

            return acc;
        }, {});
    }

    static noop() {
    }

    static objectHasValue<T extends object>(obj: T, value: any): boolean {
        return !!~Object.values(obj).filter((v) => this.isEqual(v, value));
    }

    static parseBoolean(str?: string): boolean {
        return str ? /^true$/i.test(str) : !1;
    }

    static parseJsonSafely<T = any>(str: string): T | void {
        try {
            return JSON.parse(str);
        }
        catch (e) {
            console.warn("KikCommonUtils => couldn't parse json string", {
                str,
                error: e
            });

            return void 0;
        }
    }

    static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
        return keys.reduce((acc, key) => {
            if (key in obj) {
                acc[key] = obj[key];
            }
            return acc;
        }, {} as Pick<T, K>);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    static runSafely<V = any, U = any, T extends Function = (...args: V[]) => U>(
        fn?: T,
        thisArg = null,
        params: V[] = []
    ): U | void {
        if (this.isFunction(fn)) {
            return fn.apply(thisArg, params);
        }
    }

    static sleep(timeToDelay: number) {
        return new Promise((resolve) => setTimeout(resolve, timeToDelay));
    }

    static sprintf(str: string, ...argv: (string | number | symbol)[]): string {
        if (!this.isString(str)) {
            return str;
        }

        return !argv.length ? str : this.sprintf(str.replace("%s", String(argv.shift())), ...argv);
    }

    static stripComments(html: string): string {
        return typeof html === typeof "" ? html.replace(/(<!--.*?-->)|(<!--[\S\s]+?-->)|(<!--[\S\s]*?$)/g, "") : html;
    }

    static submitFakeForm<T extends object = object>({
                                                         action,
                                                         method = SmpRestVerbs.POST,
                                                         data,
                                                         target
                                                     }: {
        action: string;
        method: SmpRestVerbs;
        data?: T;
        target?: "_blank" | "_self"
    }): void {
        const fieldInputs = Object.entries(data || {}).map(([k, v]) => `<input name="${k}" type="hidden" value="${v}" />`);
        const form = document.createElement("form");
        form.method = method;
        form.action = action;
        form.innerHTML = `${fieldInputs}`;
        form.target = target || "_self";
        document.body.append(form);
        form.submit();
    }


    static toCamelCase(s: string): string {
        return this.words(s.replace(/['\u2019]/g, "")).reduce((res, word, index) => {
            word = word.toLowerCase();
            return (
                res + (index ? word.charAt(0).toUpperCase() + word.slice(1) : word)
            );
        }, "");
    }

    static toKebabCase(s: string): string {
        return this.words(s.replace(/['\u2019]/g, "")).join("-").toLowerCase();
    }

    static toPascalCase(s: string): string {
        return this.toCamelCase(s).replace(/^(.)/, ($1) => {
            return $1.toUpperCase();
        });
    }

    static toSnakeCase(s: string): string {
        return this.words(s.replace(/['\u2019]/g, "")).join("_").toLowerCase();
    }

    static toUpperSnakeCase(s: string): string {
        return this.toSnakeCase(s).toUpperCase();
    }

    static words(string: string, pattern?: RegExp): string[] {
        if (pattern === void 0) {
            const result = SmpUnicodeWords.HAS_UNICODE_WORD(string) ? SmpUnicodeWords.unicodeWords(string) : smpAsciiWords(string);
            return result || [];
        }
        return string.match(pattern) || [];
    }

}
