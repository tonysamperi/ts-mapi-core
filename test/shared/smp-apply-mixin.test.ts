import {smpApplyMixin} from "../../src/shared/utils/index";

describe("kikApplyMixin", () => {
    class TimestampMixin {

        static get timestamp() {
            return +new Date();
        }

        static timestampFoo = "foo";

        getCreatedAt() {
            return "created-at";
        }

        static timestampBar() {
            return "bar";
        };

    }

    class ActivatableMixin {
        isActive = false;

        activate() {
            this.isActive = true;
        }
    }

    class MyClass {
    }

    class MyOtherClass {
        activate: () => string;
    }

    beforeAll(() => {
        smpApplyMixin(MyClass, [TimestampMixin, ActivatableMixin]);
        MyOtherClass.prototype.activate = () => "existing method1";
        smpApplyMixin(MyOtherClass, [TimestampMixin, ActivatableMixin]);
    });

    it("should mix in methods from base classes", () => {
        const instance = new MyClass() as MyClass & TimestampMixin & ActivatableMixin;
        expect(instance.getCreatedAt()).toBe("created-at");
    });

    it("should mix in instance-level fields only if declared on prototype", () => {
        const instance = new MyClass() as MyClass & ActivatableMixin;
        expect(instance.isActive).toBe(false);
        instance.activate();
        expect(instance.isActive).toBe(true);
    });

    it("should not copy constructor", () => {
        const proto = Object.getPrototypeOf(new MyClass());
        expect(proto.constructor.name).toBe("MyClass");
    });

    it("should copy static members and methods", () => {
        const MyClassTyped = (MyClass as typeof MyClass & typeof TimestampMixin & typeof ActivatableMixin);
        expect(MyClassTyped.timestampFoo).toBe("foo");
        expect(MyClassTyped.timestampBar).toBeDefined();
        expect(typeof MyClassTyped.timestampBar).toBe(typeof isNaN);
        expect(MyClassTyped.timestamp).toBeDefined();
    });

    it("does not overwrite existing properties or methods on the derived class prototype", () => {
        const instance = new MyOtherClass() as MyOtherClass & TimestampMixin & ActivatableMixin;
        expect(instance.activate()).toBe("existing method1");
    });
});
