class InternalSignal<T> extends EventTarget {
  #value: T;

  constructor(value: T) {
    super();
    this.#value = value;
  }

  get value() {
    return this.#value;
  }

  set value(value: T) {
    if (this.#value === value) return;
    this.#value = value;
    this.dispatchEvent(new CustomEvent('change'));
  }

  effect(fn: () => void) {
    fn();
    this.addEventListener('change', fn);
    return () => this.removeEventListener('change', fn);
  }

  valueOf() {
    return this.#value;
  }

  toString() {
    return String(this.#value);
  }
}

/** Maps a tuple of signals to a tuple of their inner value types. */
type SignalValues<T extends readonly InternalSignal<unknown>[]> = {
  [K in keyof T]: T[K] extends InternalSignal<infer V> ? V : never;
};

class InternalComputed<
  T,
  D extends readonly InternalSignal<unknown>[] = readonly InternalSignal<unknown>[],
> extends InternalSignal<T> {
  constructor(fn: (...deps: SignalValues<D>) => T, deps: D) {
    super(fn(...(deps.map(d => d.value) as SignalValues<D>)));
    deps.forEach(dep =>
      dep.addEventListener('change', () => {
        this.value = fn(...(deps.map(d => d.value) as SignalValues<D>));
      }),
    );
  }
}

/**
 * Creates a reactive variable (signal) with the given data.
 * What are signals?: https://www.dhiwise.com/post/how-to-implement-signals-in-javascript-for-event-handling
 */
export const signal = <T>(data: T) => new InternalSignal(data) as Signal<T>;

/**
 * Creates a computed signal that recomputes its value when any of the dependencies change.
 * @param fn - Function that computes the value of the signal. Receives the current values of the dependencies.
 * @param deps - Dependencies of the computed signal that trigger a recompute when they change.
 */
export function computed<T, D extends readonly InternalSignal<unknown>[]>(fn: (...deps: SignalValues<D>) => T, deps: [...D]) {
  return new InternalComputed<T, D>(fn, deps) as Computed<T>;
}

/**
 * Creates an effect that runs the given function when any of the dependencies change.
 * @param deps - Dependencies of the effect that trigger a recompute when they change.
 * @param fn - Function to run when the dependencies change.
 */
export function effect(deps: InternalSignal<unknown>[], fn: () => void) {
  const removeListeners = deps.map(dep => dep.effect(fn));
  return () => removeListeners.forEach(removeListener => removeListener());
}

export type Signal<T> = InternalSignal<T>;
export type Computed<T> = InternalComputed<T>;
