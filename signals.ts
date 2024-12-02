class Signal<T> extends EventTarget {
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

class Computed<T> extends Signal<T> {
  constructor(fn: (deps: Signal<unknown>[]) => T, deps: Signal<unknown>[]) {
    // @ts-expect-error - works fine, I don't know how to type this correctly
    super(fn(...deps));

    deps.forEach(
      // @ts-expect-error - works fine, I don't know how to type this correctly
      dep => dep.addEventListener('change', () => this.value = fn(...deps)),
    );
  }
}

/**
 * Creates a reactive variable (signal) with the given data.
 * What are signals?: https://www.dhiwise.com/post/how-to-implement-signals-in-javascript-for-event-handling
 */
export const signal = <T>(data: T) => new Signal(data);

/**
 * Creates a computed signal that recomputes its value when any of the dependencies change.
 * @param fn - Function that computes the value of the signal.
 * @param deps - Dependencies of the computed signal that trigger a recompute when they change.
 */
export const computed = <T>(fn: () => T, deps: Signal<unknown>[]) => new Computed(fn, deps);

/**
 * Creates an effect that runs the given function when any of the dependencies change.
 * @param deps - Dependencies of the effect that trigger a recompute when they change.
 * @param fn - Function to run when the dependencies change.
 */
export function effect(deps: Signal<unknown>[], fn: () => void) {
  const removeListeners = deps.map(dep => dep.effect(fn));
  return () => removeListeners.forEach(removeListener => removeListener());
}
