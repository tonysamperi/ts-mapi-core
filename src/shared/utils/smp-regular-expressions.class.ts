export class SmpRegularExpressions {
    static get COUNTRY(): RegExp {
        return this._country;
    }

    static get DOMAIN(): RegExp {
        return /^(?!www)(\w)([\w.-])*\.[a-z]{2,6}$/;
    }

    static get EMAIL(): RegExp {
        return /^[^\\|!"£$%&/()='?^€*[\]°#§<>,;:\s]+@[a-z0-9.-]+\.[a-z]{2,6}$/;
    }

    static get LANGUAGE(): RegExp {
        return this._language;
    }

    static get LATIN_CHARS(): RegExp {
        // HYBRIS LATIN CHARS => "\u0000-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF";
        // HYBRIS PATTERN => "^[" + this._privateContext.latinChars + "]+";
        // eslint-disable-next-line no-control-regex
        return /^[\u0000-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF]+/;
    }

    static get LOCALE(): RegExp {
        return new RegExp(`${this._country.source}-${this._language.source}`);
    }

    static get NO_EMOJI_NO_PUNCTUATION(): RegExp {
        return /[^\p{Emoji_Presentation}|\p{P}]/gu;
    }

    static get PHONE_NUMBER(): RegExp {
        // This is now the same on EVA having now min ["+1 " + 4 digits] (7) and max ["+123 " + 15 digits] (20)
        return /^(\+\d{1,4}\s)(\d{4,15})$/;
    }

    static get PHONE_NUMBER_BY_PREFIX(): Record<string, Record<string, RegExp>> {
        return {
            "+971": {
                dontStartWithZero: /^(\+\d{3}\s)([1-9])/, // Don't type 0 as first
                typeExactlyNineDigits: /^(\+\d{3}\s)([1-9]\d{8}$)/ // Exactly 9
            }
        };
    }

    static get TAXCODE_BY_COUNTRY(): Record<string, Record<string, RegExp>> {
        return {
            "ES": {
                DNI: /^\d{8}[A-Z]$/, // FOR SPANISH CITIZENS
                NIE: /^[A-Z]\d{7}[A-Z]$/, // FOR SPANISH FOREIGNERS
                CIF: /^[A-Z]\d{8}$/ // FOR SPANISH COMPANIES
            }
        };
    }

    protected static _country: RegExp = /[a-zA-Z]{2}/;
    protected static _language: RegExp = /[a-z]{2}/;
}
