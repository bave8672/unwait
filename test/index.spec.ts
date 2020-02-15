import unwait from "../src";

// tslint:disable-next-line: no-big-function
describe("unwait", () => {
    it("should  wrap a value", async () => {
        const val = { key: Math.random() };
        const wrapped = unwait(val);
        const unwrapped = await wrapped;
        expect(unwrapped).toBe(val);
    });

    it("should wrap a promised value", async () => {
        const val = { key: Math.random() };
        const promise = Promise.resolve(val);
        const wrapped = unwait(promise);
        const unwrapped = await wrapped;
        expect(unwrapped).toBe(val);
    });

    it("should proxy through to Promises' then() method", async () => {
        const val = { key: Math.random() };
        const promise = Promise.resolve(val);
        const wrapped = unwait(promise);
        await wrapped.then((unwrapped) => expect(unwrapped).toBe(val));
    });

    it("should proxy through to Promises' catch() method", async () => {
        const err = new Error("I shouldn't be thrown");
        const promise = Promise.reject(err);
        const wrapped = unwait(promise);
        await wrapped.catch((unwrapped) => expect(unwrapped).toBe(err));
    });

    it("should allow access to properties", async () => {
        const val = { key: Math.random() };
        const unwrapped = await unwait(val).key;
        expect(unwrapped).toBe(val.key);
    });

    it("should allow access to undefined properties", async () => {
        const val = { key: Math.random() };
        const unwrapped = await unwait((val as any).foo);
        expect(unwrapped).toBe(undefined);
    });

    it("should wrap a function and it's result", async () => {
        const fn = async (firstName: string, lastName: string) =>
            `Hello ${firstName} ${lastName}`;
        const wrapped = unwait(fn);
        const result = await wrapped("sensible", "mackerel");
        expect(result).toBe(`Hello sensible mackerel`);
    });

    it("should wrap native methods", async () => {
        const wrapped = unwait(Promise.resolve("hello world"));
        expect(await wrapped.toUpperCase()).toBe("HELLO WORLD");
    });

    it("should wrap native APIs", async () => {
        const wrapped = unwait(Math);
        expect(await wrapped.sqrt(16)).toBe(4);
    });

    it("should allow access to nested properties and methods", async () => {
        class Greeter {
            async greetAsync(name: string) {
                return `Hello ${name}!`;
            }
        }
        const API = {
            math: {
                PI: Math.PI,
                double: (x: number) => x * 2,
            },
            async getGreeter() {
                return new Greeter();
            },
        };
        const api = unwait(API);
        expect(await api.math.PI).toBe(Math.PI);
        expect(await api.math.double(2)).toBe(4);
        expect(await api.getGreeter().greetAsync("world")).toBe("Hello world!");
    });

    it("should preserve the `this` context of a class instance", async () => {
        // tslint:disable-next-line: max-classes-per-file
        class AsyncIncrementer {
            count = 0;
            async increment() {
                this.count++;
            }
        }
        const wrapped = unwait(new AsyncIncrementer());
        await wrapped.increment();
        expect(await wrapped.count).toBe(1);
    });

    it("should preserve the `this` context of a fluent API", async () => {
        // tslint:disable-next-line: max-classes-per-file
        class AsyncIncrementer {
            count = 0;
            async increment() {
                this.count++;
                return this;
            }
        }
        const wrapped = unwait(new AsyncIncrementer());
        const result = await wrapped
            .increment()
            .increment()
            .increment().count;
        expect(result).toBe(3);
    });

    it("should allow the the overriding of the `this` argument", async () => {
        // tslint:disable-next-line: max-classes-per-file
        class AsyncGreeter {
            greeting = "Hello world!";
            async greet() {
                return this.greeting;
            }
        }
        const wrapped = unwait(new AsyncGreeter());
        const result = await wrapped.greet.call({ greeting: "Hello this!" });
        expect(result).toBe("Hello this!");
    });

    it("should wrap a constructor", async () => {
        // tslint:disable-next-line: max-classes-per-file
        class AsyncIncrementer {
            constructor(public count: number) {}
            async increment() {
                this.count++;
                return this;
            }
        }
        const wrapped = unwait(AsyncIncrementer);
        const result = await new (wrapped as any)(100)
            .increment()
            .increment()
            .increment().count;
        expect(result).toBe(103);
    });

    it("should throw a TypeError when invalid properties are accessed", async (done) => {
        const val = { key: Math.random() };
        const wrapped = unwait(val);
        const getUnwrapped = async () => (wrapped as any).foo.bar;
        try {
            await getUnwrapped();
        } catch (err) {
            expect(err instanceof TypeError).toBe(true);
            done();
        }
        throw new Error();
    });

    it("should throw a TypeError when non-functions are called", async (done) => {
        const val = { key: Math.random() };
        const wrapped = unwait(val);
        try {
            await (wrapped as any).key();
        } catch (err) {
            expect(err instanceof TypeError).toBe(true);
            done();
        }
        throw new Error();
    });

    it("should throw a TypeError when an undefined value is called", async (done) => {
        const val = { key: Math.random() };
        const wrapped = unwait(val);
        try {
            await (wrapped as any).foo();
        } catch (err) {
            expect(err instanceof TypeError).toBe(true);
            done();
        }
        throw new Error();
    });

    it("should throw a TypeError when non-constructors are constructed", async (done) => {
        const val = { key: Math.random() };
        const wrapped = unwait(val);
        try {
            await new (wrapped as any)();
        } catch (err) {
            expect(err instanceof TypeError).toBe(true);
            done();
        }
        throw new Error();
    });

    it("should cache repeated references to the same object", async () => {
        // tslint:disable-next-line: max-classes-per-file
        class AsyncIncrementer {
            count = 0;
            async increment() {
                this.count++;
                return this;
            }
        }
        const api = unwait(new AsyncIncrementer());
        expect(
            // tslint:disable-next-line: no-identical-expressions
            (await api.increment()) === (await api.increment()),
        ).toBe(true);
    });

    it("should cache repeated references to the same method", async () => {
        // tslint:disable-next-line: max-classes-per-file
        class AsyncIncrementer {
            count = 0;
            async increment() {
                this.count++;
                return this;
            }
        }
        const api = unwait(new AsyncIncrementer());
        // tslint:disable-next-line: no-identical-expressions
        expect((await api.increment) === (await api.increment)).toBe(true);
    });
});
