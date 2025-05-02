import {SmpLoggerMethods} from "@tonysamperi/logger";

export class SmpApiCommonUtils {
    // /{([a-zA-Z_$][a-zA-Z0-9_$]*)}/g
    protected static _javascriptVariablePattern = "[a-zA-Z_$][a-zA-Z_$0-9]*";
    protected static _logger: SmpLoggerMethods = new SmpLoggerMethods();
    // Extract all params enclosed in curly braces in a path. E.g.: /api/v3/{foo}/{bar}
    protected static _pathParamRegex = new RegExp(`\\{(${this._javascriptVariablePattern})\\}`, "g");

    static credentialsToBasicAuth(user: string, password: string): string {
        return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
    }

    static fromBearer(header: string = ""): string {
        return header.split(" ")[1];
    }

    static getCountryFromReferer(referer: string): string | void {
        return this.getLocaleFromReferer(referer)?.split("-")[0]?.toUpperCase();
    }

    static getLanguageFromReferer(referer: string): string | void {
        return this.getLocaleFromReferer(referer)?.split("-")[1];
    }

    static getLocaleFromReferer(referer: string): string | void {
        return referer?.match(/\/([A-Z]{2}-[A-Z]{2})\//i)?.[1];
    }

    static interpolateParams(urlTemplate: string, params: Record<string, string | number | boolean>): string {
        try {
            return urlTemplate.replace(this._pathParamRegex, (match, key) => {
                const value = params[key];
                return value !== void 0 ? encodeURIComponent(value) : match;
            });
        }
        catch (e) {
            this._logger.warn("KikApiCommonUtils: couldn't interpolate params", e);
        }

        return urlTemplate;
    }

}
