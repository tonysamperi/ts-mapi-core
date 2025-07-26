import {SmpGenericConstructor} from "../common/smp-generic-constructor.type.js";

export function smpApplyMixin<T extends SmpGenericConstructor>(
    derivedCtor: T,
    baseCtors: SmpGenericConstructor[]
): void {
    baseCtors.forEach(baseCtor => {
        // Copia metodi e getter/setter dal prototype senza sovrascrivere
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== "constructor") {
                if (!(name in derivedCtor.prototype)) {
                    Object.defineProperty(
                        derivedCtor.prototype,
                        name,
                        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)!
                    );
                }
            }
        });

        // Copy props w/out overwrite
        try {
            const instance = new baseCtor();
            Object.getOwnPropertyNames(instance).forEach(name => {
                if (!(name in derivedCtor.prototype)) {
                    Object.defineProperty(
                        derivedCtor.prototype,
                        name,
                        Object.getOwnPropertyDescriptor(instance, name)!
                    );
                }
            });
        }
        catch {
            // Silent erroring (constructor w/ side effects or parameters
        }

        // Copy static members and methods
        Object.getOwnPropertyNames(baseCtor).forEach(name => {
            if (name !== "prototype" && name !== "name" && name !== "length") {
                if (!(name in derivedCtor)) {
                    Object.defineProperty(
                        derivedCtor,
                        name,
                        Object.getOwnPropertyDescriptor(baseCtor, name)!
                    );
                }
            }
        });
    });
}

