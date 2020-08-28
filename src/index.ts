/**
 * The top-most generic type of function. Represents any callable function.
 */
export type Callable<A extends any[] = [], R = any> = (...args: A) => R;

/**
 * A function that accepts parameters and returns void.
 */
export type Consumer<T extends any[] = []> = Callable<T, void>;
/**
 * A function that accepts parameters and returns (Promise) void.
 */
export type AsyncConsumer<T extends any[] = []> = Callable<T, Promise<void>>;

/**
 * A function that accepts no parameters and returns a value.
 */
export type Provider<R = any> = Callable<[], R>;
/**
 * A function that accepts no parameters and returns a (Promise) value.
 */
export type AsyncProvider<R = any> = Callable<[], Promise<R>>;

/**
 * A function that accepts no parameters and returns void.
 */
export type Runnable = Provider<void>;
/**
 * A function that accepts no parameters and returns (Promise) void.
 */
export type AsyncRunnable = AsyncProvider<void>;

/**
 * A controller for sequential middleware.
 * Each callback is passed the `run` arguments followed by a `next` callback
 * which passes control to the next chained callback.
 */
export class Controller<T extends any[] = []> {
  protected readonly callbacks: (Consumer<[...T, Runnable]> | Consumer<T>)[] = [];

  /**
   * Adds a callback to the execution chain.
   * @param callback The callback to add. The last parameter of this callback
   * can accept a `next` callback which can be called to continue the chain.
   */
  public chain(callback: Consumer<[...T, Runnable]> | Consumer<T>): this {
    this.callbacks.push(callback);
    return this;
  }

  public run(...args: T): this {
    if (this.callbacks.length === 0) return this;
    let i = 0;
    const self = this;
    function next() {
      if (i < self.callbacks.length) self.callbacks[i++](...args, next);
    }
    next();
    return this;
  }
}

/**
 * A controller for asynchronous (Promise-returning) sequential middleware.
 * Each callback is passed the `run` arguments followed by a `next` callback
 * which passes control to the next chained callback.
 */
export class AsyncController<T extends any[] = []> {
  protected readonly callbacks: (AsyncConsumer<[...T, Runnable]> | AsyncConsumer<T>)[] = [];

  public chain(callback: AsyncConsumer<[...T, Runnable]> | AsyncConsumer<T>): this {
    this.callbacks.push(callback);
    return this;
  }

  public async run(...args: T): Promise<this> {
    if (this.callbacks.length === 0) return this;
    let i = 0;
    const self = this;
    async function next() {
      if (i < self.callbacks.length) await self.callbacks[i++](...args, next);
    }
    await next();
    return this;
  }
}
